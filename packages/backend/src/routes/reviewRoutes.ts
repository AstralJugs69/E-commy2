import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { isUser } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Define Zod validation schema for creating/updating reviews
const reviewSchema = z.object({
  productId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional()
});

// POST /api/reviews - Submit a new review
router.post('/', isUser, async (req: Request, res: Response) => {
  console.log('POST /api/reviews route hit', req.body);
  try {
    // Get user ID from the authenticated request
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in the request' });
      return;
    }

    // Validate the request body
    const validationResult = reviewSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({ 
        message: 'Invalid review data', 
        errors: validationResult.error.errors 
      });
      return;
    }

    const { productId, rating, comment } = validationResult.data;

    // Create the review within a transaction to also update product aggregates
    const result = await prisma.$transaction(async (tx) => {
      // Create the review
      try {
        const review = await tx.review.create({
          data: {
            userId,
            productId,
            rating,
            comment
          }
        });

        // Recalculate the average rating and review count
        const aggregates = await tx.review.aggregate({
          where: { productId },
          _avg: { rating: true },
          _count: { id: true }
        });

        // Update the product with new rating data
        await tx.product.update({
          where: { id: productId },
          data: {
            averageRating: aggregates._avg.rating,
            reviewCount: aggregates._count.id
          }
        });

        return review;
      } catch (error) {
        // Handle unique constraint violation (user already reviewed this product)
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new Error('You have already reviewed this product');
        }
        throw error;
      }
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating review:', error);
    if (error instanceof Error && error.message === 'You have already reviewed this product') {
      res.status(409).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Failed to create review' });
    }
  }
});

// GET /api/reviews/user - Get all reviews by the current user
router.get('/user', isUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in the request' });
      return;
    }

    const userReviews = await prisma.review.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(userReviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

// PUT /api/reviews/:reviewId - Update an existing review
router.put('/:reviewId', isUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in the request' });
      return;
    }

    // Validate reviewId
    const reviewId = parseInt(req.params.reviewId);
    if (isNaN(reviewId)) {
      res.status(400).json({ message: 'Invalid review ID' });
      return;
    }

    // Validate request body
    const validationResult = z.object({
      rating: z.number().int().min(1).max(5),
      comment: z.string().optional()
    }).safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({ 
        message: 'Invalid review data', 
        errors: validationResult.error.errors 
      });
      return;
    }

    const { rating, comment } = validationResult.data;

    // Check if the review exists and belongs to the user
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!existingReview) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    if (existingReview.userId !== userId) {
      res.status(403).json({ message: 'You can only update your own reviews' });
      return;
    }

    // Update the review and recalculate product aggregates in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the review
      const updatedReview = await tx.review.update({
        where: { id: reviewId },
        data: { rating, comment }
      });

      // Recalculate the average rating for the product
      const productId = existingReview.productId;
      const aggregates = await tx.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { id: true }
      });

      // Update the product with the new average
      await tx.product.update({
        where: { id: productId },
        data: {
          averageRating: aggregates._avg.rating,
          reviewCount: aggregates._count.id
        }
      });

      return updatedReview;
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Failed to update review' });
  }
});

// DELETE /api/reviews/:reviewId - Delete a review
router.delete('/:reviewId', isUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in the request' });
      return;
    }

    // Validate reviewId
    const reviewId = parseInt(req.params.reviewId);
    if (isNaN(reviewId)) {
      res.status(400).json({ message: 'Invalid review ID' });
      return;
    }

    // Check if the review exists and belongs to the user
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!existingReview) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    if (existingReview.userId !== userId) {
      res.status(403).json({ message: 'You can only delete your own reviews' });
      return;
    }

    // Get the product ID for recalculating aggregates later
    const productId = existingReview.productId;

    // Delete the review and update product aggregates in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete the review
      await tx.review.delete({
        where: { id: reviewId }
      });

      // Recalculate the average rating for the product
      const aggregates = await tx.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { id: true }
      });

      // Update the product with the new average rating (or set to null if no reviews left)
      await tx.product.update({
        where: { id: productId },
        data: {
          averageRating: aggregates._count.id > 0 ? aggregates._avg.rating : null,
          reviewCount: aggregates._count.id
        }
      });
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Failed to delete review' });
  }
});

// GET /api/reviews/product/:productId - Get all reviews for a product
router.get('/product/:productId', async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.productId);
    
    if (isNaN(productId)) {
      res.status(400).json({ message: 'Invalid Product ID format.' });
      return;
    }
    
    // Verify that the product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      res.status(404).json({ message: `Product with ID ${productId} not found.` });
      return;
    }
    
    // Get all reviews for the product, including user email
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: { email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.status(200).json(reviews);
  } catch (error) {
    console.error(`Error fetching reviews for product:`, error);
    res.status(500).json({ message: 'Error retrieving product reviews.', error: String(error) });
  }
});

export default router; 