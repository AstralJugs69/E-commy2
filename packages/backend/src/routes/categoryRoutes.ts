import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { staticCache, etagMiddleware } from '../middleware/cacheMiddleware';

const router = Router();
const prisma = new PrismaClient();

/**
 * @route GET /api/categories
 * @description Get all categories (public, read-only access)
 * @access Public
 */
router.get('/', staticCache(3600), etagMiddleware(), async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        imageUrl: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'An error occurred while fetching categories.' });
  }
});

export default router;