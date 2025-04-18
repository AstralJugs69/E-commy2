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

export default router; 