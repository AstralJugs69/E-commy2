import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { isUser } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient({
  log: ['error'], // Add logging for better debugging
});

// Define schemas for cart operations
const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, { message: "Quantity must be at least 1" }),
});

const addCartItemSchema = z.object({
  productId: z.number().int().positive({ message: "Product ID must be a positive integer" }),
  quantity: z.number().int().min(1, { message: "Quantity must be at least 1" }),
});

/**
 * @route GET /api/cart/health
 * @description Check database health
 * @access Public
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    // Simple query to check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'up', database: 'connected' });
  } catch (error: any) {
    console.error('Database health check failed:', error);
    res.status(500).json({ 
      status: 'down', 
      database: 'disconnected', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Database connection error'
    });
  }
});

/**
 * @route POST /api/cart/item
 * @description Add/Update an item in the cart with a specific quantity
 * @access Private (User only)
 */
router.post('/item', isUser, async (req: Request, res: Response) => {
  try {
    console.log('Adding new item to cart:', req.body);
    
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

    // Pre-check: Fetch product outside of transaction to validate it exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true
      }
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Check if the item already exists in the cart (outside transaction)
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: userId,
          productId: productId
        }
      }
    });

    const currentQuantityInCart = existingCartItem?.quantity ?? 0;

    // Pre-check: Validate stock availability
    if (currentQuantityInCart + quantity > product.stock) {
      res.status(400).json({
        message: `Insufficient stock for ${product.name}. Only ${product.stock} available and you already have ${currentQuantityInCart} in your cart.`
      });
      return;
    }

    // Now perform the upsert operation (simpler transaction)
    const upsertedItem = await prisma.cartItem.upsert({
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
            images: {
              select: { url: true },
              take: 1
            },
            stock: true,
            description: true
          }
        }
      }
    });

    res.status(200).json(upsertedItem);
  } catch (error: any) {
    // Enhanced error logging
    console.error('Error adding/updating cart item:', error);
    console.error('Error details:', {
      code: error.code,
      name: error.name,
      meta: error?.meta, // Prisma adds metadata to errors
      stack: error.stack
    });
    
    // Handle Prisma-specific error codes
    if (error.code) {
      // P2025: Record not found
      if (error.code === 'P2025') {
        res.status(404).json({ message: 'Product or user record not found' });
        return;
      }
      
      // P2002: Unique constraint violation
      if (error.code === 'P2002') {
        res.status(409).json({ message: 'Cart item already exists' });
        return;
      }
      
      // P2014: Relation violation
      if (error.code === 'P2014') {
        res.status(400).json({ message: 'Invalid relation between cart item and product/user' });
        return;
      }
    }
    
    // Handle specific error messages
    if (error.message && (
      error.message.includes('Product not found') ||
      error.message.includes('Insufficient stock')
    )) {
      res.status(400).json({ message: error.message });
      return;
    }
    
    // Default 500 error with additional details in development
    res.status(500).json({ 
      message: 'An internal server error occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

    // Pre-check: Fetch product outside of transaction to validate it exists
    const product = await prisma.product.findUnique({
      where: { id: productIdInt },
      select: { 
        id: true,
        name: true,
        price: true,
        stock: true
      }
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Check if requested quantity exceeds available stock
    if (quantity > product.stock) {
      res.status(400).json({
        message: `Insufficient stock for ${product.name}. Only ${product.stock} available.`
      });
      return;
    }

    // Update the cart item with the new quantity
    const cartItem = await prisma.cartItem.upsert({
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
            images: {
              select: { url: true },
              take: 1
            },
            stock: true,
            description: true
          }
        }
      }
    });

    res.status(200).json(cartItem);
  } catch (error: any) {
    // Enhanced error logging
    console.error('Error updating cart item:', error);
    console.error('Error details:', {
      code: error.code,
      name: error.name,
      meta: error?.meta,
      stack: error.stack
    });
    
    // Handle Prisma-specific error codes
    if (error.code) {
      if (error.code === 'P2025') {
        res.status(404).json({ message: 'Product or user record not found' });
        return;
      }
    }
    
    // Handle specific error messages
    if (error.message && (
      error.message.includes('Product not found') ||
      error.message.includes('Insufficient stock')
    )) {
      res.status(400).json({ message: error.message });
      return;
    }
    
    // Default 500 error
    res.status(500).json({ 
      message: 'An internal server error occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
  } catch (error: any) {
    console.error('Error fetching cart items:', error);
    console.error('Error details:', {
      code: error.code,
      name: error.name,
      meta: error?.meta,
      stack: error.stack
    });
    
    res.status(500).json({ 
      message: 'An internal server error occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
    console.error('Error details:', {
      code: error.code,
      name: error.name,
      meta: error?.meta,
      stack: error.stack
    });
    
    // Handle "not found" Prisma error
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Item not found in cart' });
      return;
    }
    
    res.status(500).json({ 
      message: 'An internal server error occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    console.error('Error details:', {
      code: error.code,
      name: error.name,
      meta: error?.meta,
      stack: error.stack
    });
    
    res.status(500).json({ 
      message: 'An internal server error occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router; 