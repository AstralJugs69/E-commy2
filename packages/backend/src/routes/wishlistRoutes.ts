import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { isUser } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Define Zod validation schema for adding wishlist item
const addWishlistItemSchema = z.object({
  productId: z.number().int().positive({ message: "Product ID must be a positive integer" })
});

/**
 * Schema for batch wishlist operations
 */
const batchWishlistOperationSchema = z.object({
  operations: z.array(
    z.object({
      productId: z.number().int().positive({ message: "Product ID must be a positive integer" }),
      action: z.enum(['add', 'remove'], { 
        errorMap: () => ({ message: "Action must be one of: add, remove" })
      })
    })
  ).min(1, { message: "At least one operation is required" })
});

/**
 * @route GET /api/wishlist
 * @description Get all wishlist items for the authenticated user
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

    // Fetch all wishlist items for the user, including product details
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId },
      select: {
        id: true,
        createdAt: true,
        productId: true,
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            images: {
              select: { url: true },
              take: 1 // Only need the first image for wishlist display
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json(wishlistItems);
  } catch (error) {
    console.error('Error fetching wishlist items:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

/**
 * @route POST /api/wishlist
 * @description Add an item to the wishlist
 * @access Private (User only)
 */
router.post('/', isUser, async (req: Request, res: Response) => {
  try {
    // Get user ID from the JWT token (via middleware)
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }

    // Validate request body
    const validationResult = addWishlistItemSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        message: 'Validation failed',
        errors: validationResult.error.errors
      });
      return;
    }

    // Extract validated data
    const { productId } = validationResult.data;

    try {
      // Check if product exists
      const product = await prisma.product.findUniqueOrThrow({
        where: { id: productId }
      });

      // Create wishlist item
      const wishlistItem = await prisma.wishlistItem.create({
        data: {
          userId,
          productId
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              stock: true
            }
          }
        }
      });

      res.status(201).json(wishlistItem);
    } catch (error) {
      // Handle specific errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation (item already in wishlist)
        if (error.code === 'P2002') {
          res.status(409).json({
            message: 'Item already in wishlist'
          });
          return;
        }
        // Foreign key constraint failure (product not found)
        if (error.code === 'P2003') {
          res.status(404).json({
            message: 'Product not found'
          });
          return;
        }
      }
      throw error; // Re-throw other errors to be caught by the outer try-catch
    }
  } catch (error) {
    console.error('Error adding item to wishlist:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

/**
 * @route DELETE /api/wishlist/:productId
 * @description Remove an item from the wishlist
 * @access Private (User only)
 */
router.delete('/:productId', isUser, async (req: Request, res: Response) => {
  try {
    // Get user ID from the JWT token (via middleware)
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in token' });
      return;
    }

    // Validate and parse product ID
    const productIdInt = parseInt(req.params.productId, 10);
    if (isNaN(productIdInt)) {
      res.status(400).json({ message: 'Invalid product ID' });
      return;
    }

    try {
      // Delete the wishlist item using the compound unique key
      await prisma.wishlistItem.delete({
        where: {
          userId_productId: {
            userId,
            productId: productIdInt
          }
        }
      });

      // Return success - No Content
      res.status(204).send();
    } catch (error) {
      // Handle specific errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Record not found
        if (error.code === 'P2025') {
          // Return 204 anyway since the end state (item not in wishlist) is achieved
          res.status(204).send();
          return;
        }
      }
      throw error; // Re-throw other errors to be caught by the outer try-catch
    }
  } catch (error) {
    console.error('Error removing item from wishlist:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

/**
 * @route POST /api/wishlist/batch
 * @description Process multiple wishlist operations in a single request
 * @access Private (User only)
 */
router.post('/batch', isUser, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = batchWishlistOperationSchema.safeParse(req.body);
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
      const operationResults = [];

      // Process each operation
      for (const op of operations) {
        const { productId, action } = op;

        try {
          if (action === 'add') {
            // Check if product exists
            const product = await tx.product.findFirst({
              where: { id: productId }
            });

            if (!product) {
              operationResults.push({
                success: false,
                productId,
                action,
                message: 'Product not found'
              });
              continue;
            }

            // Check if already in wishlist
            const existing = await tx.wishlistItem.findUnique({
              where: {
                userId_productId: {
                  userId,
                  productId
                }
              }
            });

            if (existing) {
              operationResults.push({
                success: true, // Consider it a success since the item is already in wishlist
                productId,
                action,
                message: 'Item already in wishlist'
              });
              continue;
            }

            // Add to wishlist
            await tx.wishlistItem.create({
              data: {
                userId,
                productId
              }
            });

            operationResults.push({
              success: true,
              productId,
              action,
              message: 'Item added to wishlist'
            });
          } 
          else if (action === 'remove') {
            try {
              // Remove from wishlist
              await tx.wishlistItem.delete({
                where: {
                  userId_productId: {
                    userId,
                    productId
                  }
                }
              });

              operationResults.push({
                success: true,
                productId,
                action,
                message: 'Item removed from wishlist'
              });
            } catch (error) {
              // Item not in wishlist (P2025 error)
              if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                operationResults.push({
                  success: true, // Consider it a success since the end state is achieved
                  productId,
                  action,
                  message: 'Item not in wishlist'
                });
              } else {
                throw error; // Re-throw other errors
              }
            }
          }
        } catch (error) {
          console.error(`Error processing operation ${action} for product ${productId}:`, error);
          operationResults.push({
            success: false,
            productId,
            action,
            message: 'Operation failed'
          });
        }
      }

      return operationResults;
    });

    res.status(200).json({
      results
    });
  } catch (error) {
    console.error('Error processing batch wishlist operations:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

export default router; 