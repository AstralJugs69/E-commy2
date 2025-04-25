import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { dynamicCache, etagMiddleware } from '../middleware/cacheMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Predefined list of Shashemene districts/kebeles
const shashemeneDistricts: string[] = [
  "Arada",
  "Awasho",
  "Bekelcha",
  "Bulchana",
  "Burka Gudina",
  "Kuyera",
  "Mehal Ketema",
  "Kebele 01",
  "Kebele 02",
  "Kebele 03",
  "Kebele 04",
  "Kebele 05",
  "Kebele 06",
  "Kebele 07",
  "Kebele 08",
  "Kebele 09",
  "Kebele 10"
];

// Sort districts alphabetically
shashemeneDistricts.sort();

/**
 * @route   GET /api/districts
 * @desc    Get list of Shashemene districts/kebeles
 * @access  Public
 */
router.get('/districts', (req: Request, res: Response) => {
  try {
    // Return the predefined list
    res.status(200).json(shashemeneDistricts);
  } catch (error) {
    console.error("Error fetching districts:", error);
    res.status(500).json({ message: "Failed to retrieve district list." });
  }
});

/**
 * @route GET /api/homepage
 * @description Get aggregated data for the homepage
 * @access Public
 */
router.get('/homepage', dynamicCache(300), etagMiddleware(), async (req: Request, res: Response) => {
  try {
    // Execute all queries in parallel using Promise.all
    const [featuredProducts, categories, newProducts] = await Promise.all([
      // Get featured products (can be hardcoded for now or based on a flag)
      prisma.product.findMany({
        where: {
          stock: { gt: 0 } // Only in-stock products
        },
        orderBy: {
          averageRating: 'desc' // Use highest rated as featured
        },
        select: {
          id: true,
          name: true,
          price: true,
          averageRating: true,
          images: {
            select: { url: true },
            take: 1
          }
        },
        take: 4 // Limit to 4 featured products
      }),
      
      // Get all categories
      prisma.category.findMany({
        select: {
          id: true,
          name: true,
          imageUrl: true
        },
        orderBy: {
          name: 'asc'
        }
      }),
      
      // Get newest products
      prisma.product.findMany({
        where: {
          stock: { gt: 0 } // Only in-stock products
        },
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          name: true,
          price: true,
          images: {
            select: { url: true },
            take: 1
          }
        },
        take: 8 // Limit to 8 newest products
      })
    ]);
    
    // Return the aggregated data
    res.status(200).json({
      featuredProducts,
      categories,
      newProducts
    });
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    res.status(500).json({ message: 'An error occurred while fetching homepage data.' });
  }
});

export default router; 