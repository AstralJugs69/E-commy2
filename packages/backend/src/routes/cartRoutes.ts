import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { isUser } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Define schemas for cart operations
const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, { message: "Quantity must be at least 1" }),
});

const addCartItemSchema = z.object({
  productId: z.number().int().positive({ message: "Product ID must be a positive integer" }),
  quantity: z.number().int().min(1, { message: "Quantity must be at least 1" }),
});

/**
 * Schema for batch cart operations
 */
const batchCartOperationSchema = z.object({
  operations: z.array(
    z.object({
      productId: z.number().int().positive({ message: "Product ID must be a positive integer" }),
      quantity: z.number().int().min(1, { message: "Quantity must be at least 1" }),
      action: z.enum(['add', 'update', 'remove'], { 
        errorMap: () => ({ message: "Action must be one of: add, update, remove" })
      })
    })
  ).min(1, { message: "At least one operation is required" })
});

/**
 * @route POST /api/cart/item
 * @description Add/Update an item in the cart with a specific quantity
 * @access Private (User only)
 */
router.post('/item', isUser, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = addCartItemSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        message: 'Validation failed',
        errors: validationResult.error.errors
      });
      return;
    }

    // Extract validated data
    const { productId, quantity } = validationResult.data;

    // Get user ID from the JWT token (via middleware)
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }

    // Use transaction for atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // Fetch the product to check stock availability
      const product = await tx.product.findUniqueOrThrow({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
          stock: true,
          description: true
        }
      });

      // Check if the item already exists in the cart
      const existingCartItem = await tx.cartItem.findUnique({
        where: {
          userId_productId: {
            userId: userId,
            productId: productId
          }
        }
      });

      const currentQuantityInCart = existingCartItem?.quantity ?? 0;

      // Check if adding the requested quantity would exceed available stock
      if (currentQuantityInCart + quantity > product.stock) {
        throw new Error(`Insufficient stock for ${product.name}. Only ${product.stock} available and you already have ${currentQuantityInCart} in your cart.`);
      }

      // Upsert the cart item - create if not exists, update quantity if exists
      const upsertedItem = await tx.cartItem.upsert({
        where: {
          userId_productId: {
            userId: userId,
            productId: productId
          }
        },
        create: {
          userId: userId,
          productId: productId,
          quantity: quantity // For new items, use the requested quantity
        },
        update: {
          quantity: { increment: quantity } // For existing items, increment by the requested quantity
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              stock: true,
              description: true
            }
          }
        }
      });

      return upsertedItem;
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error adding/updating cart item:', error);
    
    // Handle specific error messages
    if (error.message && (
      error.message.includes('Product not found') ||
      error.message.includes('Insufficient stock')
    )) {
      res.status(400).json({ message: error.message });
      return;
    }
    
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

/**
 * @route POST /api/cart/update/:productId
 * @description Update the quantity of a product in the cart
 * @access Private (User only)
 */
router.post('/update/:productId', isUser, async (req: Request, res: Response) => {
  try {
    // Validate Product ID param
    const productIdInt = parseInt(req.params.productId, 10);
    if (isNaN(productIdInt)) {
      res.status(400).json({ message: 'Invalid product ID' });
      return;
    }

    // Validate request body
    const validationResult = updateCartItemSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.errors 
      });
      return;
    }

    // Extract validated quantity
    const { quantity } = validationResult.data;

    // Get user ID from the JWT token (via middleware)
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }

    // Use transaction for atomic operations
    const result = await prisma.$transaction(async (tx) => {
      // Fetch the product to check if it exists and has sufficient stock
      const product = await tx.product.findUnique({
        where: { id: productIdInt },
        select: { 
          id: true,
          name: true,
          price: true,
          images: true,
          stock: true,
          description: true
        }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      // Check if requested quantity exceeds available stock
      if (quantity > product.stock) {
        throw new Error(`Insufficient stock for ${product.name}. Only ${product.stock} available.`);
      }

      // Update the cart item with the new quantity
      const cartItem = await tx.cartItem.upsert({
        where: {
          userId_productId: {
            userId: userId,
            productId: productIdInt
          }
        },
        create: {
          userId: userId,
          productId: productIdInt,
          quantity: quantity
        },
        update: {
          quantity: quantity
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              stock: true,
              description: true
            }
          }
        }
      });

      return cartItem;
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error updating cart item:', error);
    
    // Handle specific error messages
    if (error.message && (
      error.message.includes('Product not found') ||
      error.message.includes('Insufficient stock')
    )) {
      res.status(400).json({ message: error.message });
      return;
    }
    
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

/**
 * @route GET /api/cart
 * @description Get all cart items for the authenticated user
 * @access Private (User only)
 */
router.get('/', isUser, async (req: Request, res: Response) => {
  try {
    // Get user ID from the JWT token (via middleware)
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }

    // Fetch all cart items for the user, including product details
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: userId },
      select: {
        id: true,
        quantity: true,
        productId: true,
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            images: {
              select: { url: true },
              take: 1 // Only need the first image for cart display
            }
          }
        }
      }
    });

    res.status(200).json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

/**
 * @route DELETE /api/cart/item/:productId
 * @description Remove a specific item from the cart
 * @access Private (User only)
 */
router.delete('/item/:productId', isUser, async (req: Request, res: Response) => {
  try {
    // Validate product ID
    const productId = parseInt(req.params.productId, 10);
    if (isNaN(productId)) {
      res.status(400).json({ message: 'Invalid product ID' });
      return;
    }

    // Get user ID from the JWT token
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }

    // Delete cart item
    await prisma.cartItem.delete({
      where: {
        userId_productId: {
          userId: userId,
          productId: productId
        }
      }
    });

    res.status(200).json({ message: 'Item removed from cart' });
  } catch (error: any) {
    console.error('Error removing cart item:', error);
    
    // Handle "not found" Prisma error
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Item not found in cart' });
      return;
    }
    
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

/**
 * @route DELETE /api/cart
 * @description Clear the user's entire cart
 * @access Private (User only)
 */
router.delete('/', isUser, async (req: Request, res: Response) => {
  try {
    // Get user ID from the JWT token
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }

    // Delete all cart items for the user
    await prisma.cartItem.deleteMany({
      where: { userId: userId }
    });

    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

/**
 * @route POST /api/cart/batch
 * @description Process multiple cart operations in a single request
 * @access Private (User only)
 */
router.post('/batch', isUser, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = batchCartOperationSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        message: 'Validation failed',
        errors: validationResult.error.errors
      });
      return;
    }

    // Extract validated data
    const { operations } = validationResult.data;

    // Get user ID from the JWT token (via middleware)
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }

    // Use transaction for atomic operations
    const results = await prisma.$transaction(async (tx) => {
      const processedResults = [];
      
      // First, fetch all the products in one query to check stock
      const productIds = operations.map(op => op.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          images: true
        }
      });
      
      // Create a lookup map for fast access
      const productMap = new Map(products.map(p => [p.id, p]));
      
      // Get current cart items for this user (to check existing quantities)
      const existingCartItems = await tx.cartItem.findMany({
        where: { 
          userId,
          productId: { in: productIds }
        }
      });
      
      // Create a lookup map for cart items
      const cartItemMap = new Map(existingCartItems.map(item => [item.productId, item]));
      
      // Process each operation
      for (const op of operations) {
        const { productId, quantity, action } = op;
        const product = productMap.get(productId);
        
        // Skip if product doesn't exist
        if (!product) {
          processedResults.push({
            productId,
            success: false,
            message: 'Product not found'
          });
          continue;
        }
        
        try {
          let result;
          
          switch (action) {
            case 'add':
              // Check if adding would exceed stock
              const currentQuantity = cartItemMap.get(productId)?.quantity || 0;
              if (currentQuantity + quantity > product.stock) {
                processedResults.push({
                  productId,
                  success: false,
                  message: `Insufficient stock. Only ${product.stock} available and you already have ${currentQuantity} in your cart.`
                });
                continue;
              }
              
              // Add to cart
              result = await tx.cartItem.upsert({
                where: {
                  userId_productId: { userId, productId }
                },
                create: {
                  userId,
                  productId,
                  quantity
                },
                update: {
                  quantity: { increment: quantity }
                }
              });
              break;
              
            case 'update':
              // Check if update would exceed stock
              if (quantity > product.stock) {
                processedResults.push({
                  productId,
                  success: false,
                  message: `Insufficient stock. Only ${product.stock} available.`
                });
                continue;
              }
              
              // Update quantity
              result = await tx.cartItem.upsert({
                where: {
                  userId_productId: { userId, productId }
                },
                create: {
                  userId,
                  productId,
                  quantity
                },
                update: {
                  quantity
                }
              });
              break;
              
            case 'remove':
              // Remove from cart
              result = await tx.cartItem.deleteMany({
                where: {
                  userId,
                  productId
                }
              });
              break;
          }
          
          processedResults.push({
            productId,
            success: true,
            action,
            result
          });
        } catch (error) {
          processedResults.push({
            productId,
            success: false,
            message: 'Operation failed',
            error: (error as Error).message
          });
        }
      }
      
      // Get the updated cart
      const updatedCart = await tx.cartItem.findMany({
        where: { userId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              stock: true,
              images: true
            }
          }
        }
      });
      
      return {
        operations: processedResults,
        cart: updatedCart
      };
    });

    res.status(200).json(results);
  } catch (error) {
    console.error('Error processing batch cart operations:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

export default router; 