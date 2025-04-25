import { Router, Request, Response, RequestHandler } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { dynamicCache, staticCache, etagMiddleware } from '../middleware/cacheMiddleware';
import { getPaginationParams, createPaginatedResponse } from '../utils/pagination';
import { processFieldSelection, FieldSelectionOptions } from '../utils/fieldSelection';

const router = Router();
const prisma = new PrismaClient();

// Define product field selection options
const productFieldOptions: FieldSelectionOptions = {
  defaultFields: ['id', 'name', 'price', 'description', 'images', 'stock', 'averageRating', 'reviewCount', 'createdAt'],
  allowedFields: ['id', 'name', 'price', 'description', 'images', 'stock', 'averageRating', 'reviewCount', 'createdAt', 'category'],
  nestedFields: {
    images: ['url', 'id'],
    category: ['id', 'name', 'slug']
  }
};

/**
 * @route GET /api/products
 * @description Get all products with optional search and filtering
 * @access Public
 */
router.get('/', dynamicCache(300), etagMiddleware(), (async (req: Request, res: Response) => {
  try {
    // Extract field selection from query params
    let selectClause = processFieldSelection(req, productFieldOptions);
    
    // Get pagination parameters
    const { page = 1, limit = 12 } = req.query;
    const pageInt = parseInt(page as string, 10) || 1;
    const limitInt = parseInt(limit as string, 10) || 12;
    const skip = (pageInt - 1) * limitInt;
    
    // Extract sorting params
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';
    
    // Construct order by clause
    const orderByClause: {[key: string]: 'asc' | 'desc'} = {};
    
    // Prepare filter conditions
    let whereClause: any = {
      isPublished: true // Only show published products
    };
    
    // Apply category filter if provided
    if (req.query.category) {
      whereClause.category = {
        slug: req.query.category as string
      };
    }
    
    // Apply search filter if provided
    if (req.query.search) {
      const searchTerm = req.query.search as string;
      whereClause.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }
    
    // Apply price range filter if provided
    if (req.query.minPrice || req.query.maxPrice) {
      whereClause.price = {};
      
      if (req.query.minPrice) {
        whereClause.price.gte = parseFloat(req.query.minPrice as string);
      }
      
      if (req.query.maxPrice) {
        whereClause.price.lte = parseFloat(req.query.maxPrice as string);
      }
    }
    
    // Apply sorting
    if (['name', 'price', 'createdAt'].includes(sortBy)) {
      orderByClause[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      // Default to newest first if invalid sort field
      orderByClause.createdAt = 'desc';
    }
    
    // Get total count of products matching the filter
    const totalProducts = await prisma.product.count({
      where: whereClause
    });
    
    // Handle special formatting for the 'images' field if requested
    // This ensures we only get the first image if images field is selected
    if (selectClause.images === true) {
      selectClause.images = {
        select: {
          url: true
        },
        take: 1
      };
    }
    
    // Fetch products with the constructed filters, pagination, and field selection
    const products = await prisma.product.findMany({
      where: whereClause,
      select: selectClause,
      orderBy: orderByClause,
      skip: skip,
      take: limitInt
    });
    
    console.log(`Found ${products.length} products (page ${pageInt} of ${Math.ceil(totalProducts / limitInt)})`);
    
    // Create paginated response
    const paginationParams = {
      page: pageInt,
      limit: limitInt,
      skip
    };
    
    const paginatedResponse = createPaginatedResponse(products, totalProducts, paginationParams);
    
    // Return paginated response
    res.status(200).json(paginatedResponse);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error retrieving products' });
  }
}) as RequestHandler);

/**
 * @route GET /api/products/:productId
 * @description Get a single product by ID
 * @access Public
 */
router.get('/:productId', staticCache(600), etagMiddleware(), (async (req: Request, res: Response) => {
  // Validate productId param (convert to int, check NaN)
  const productId = parseInt(req.params.productId, 10);
  if (isNaN(productId)) {
    res.status(400).json({ message: 'Invalid Product ID format.' });
    return;
  }

  try {
    // Fetch the product by ID
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        price: true,
        costPrice: true,
        description: true,
        images: true,
        stock: true,
        createdAt: true,
        averageRating: true,
        reviewCount: true
      }
    });

    // Handle Not Found case
    if (!product) {
      res.status(404).json({ message: `Product with ID ${productId} not found.` });
      return;
    }

    // Return 200 OK with the product details
    res.status(200).json(product);
  } catch (error) {
    // Handle potential database errors -> return 500
    console.error(`Error fetching product ${productId}:`, error);
    res.status(500).json({ message: 'Error retrieving product details.' });
  }
}) as RequestHandler);

/**
 * @route GET /api/products/:productId/reviews
 * @description Get all reviews for a product
 * @access Public
 */
router.get('/:productId/reviews', staticCache(600), etagMiddleware(), (async (req: Request, res: Response) => {
  try {
    console.log(`GET /api/products/${req.params.productId}/reviews route hit`);
    console.log('Request params:', req.params);
    console.log('Request path:', req.path);
    console.log('Full URL:', req.originalUrl);
    
    // Validate productId param
    const productId = parseInt(req.params.productId, 10);
    console.log('Parsed productId:', productId);
    
    if (isNaN(productId)) {
      console.log('Invalid productId format');
      res.status(400).json({ message: 'Invalid Product ID format.' });
      return;
    }

    // Check if product exists
    console.log('Checking if product exists...');
    const productExists = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true }
    });
    console.log('Product exists check result:', productExists);

    if (!productExists) {
      console.log(`Product with ID ${productId} not found.`);
      res.status(404).json({ message: `Product with ID ${productId} not found.` });
      return;
    }

    // Fetch reviews for the product
    console.log('Fetching reviews for product...');
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            email: true // Include only necessary user info, not password
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`Found ${reviews.length} reviews for product ${productId}`);

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error in product reviews route:', error);
    res.status(500).json({ message: 'Error retrieving product reviews.', error: String(error) });
  }
}) as RequestHandler);

/**
 * @route GET /api/products/:productId/with-details
 * @description Get a product with all its details including reviews
 * @access Public
 */
router.get('/:productId/with-details', staticCache(300), etagMiddleware(), (async (req: Request, res: Response) => {
  // Validate productId param
  const productId = parseInt(req.params.productId, 10);
  if (isNaN(productId)) {
    res.status(400).json({ message: 'Invalid Product ID format.' });
    return;
  }

  try {
    // Fetch product with reviews in a single query
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        stock: true,
        averageRating: true,
        reviewCount: true,
        createdAt: true,
        images: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!product) {
      res.status(404).json({ message: `Product with ID ${productId} not found.` });
      return;
    }

    // Get related products from the same category
    let relatedProducts: Array<{
      id: number;
      name: string;
      price: number;
      images: Array<{ url: string }>;
    }> = [];
    if (product.category) {
      relatedProducts = await prisma.product.findMany({
        where: {
          AND: [
            { category: { id: product.category.id } },
            { id: { not: productId } } // Exclude current product
          ]
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
        take: 4 // Limit to 4 related products
      });
    }

    // Return complete product details with related products
    res.status(200).json({
      product,
      relatedProducts
    });
  } catch (error) {
    console.error(`Error fetching product details for ${productId}:`, error);
    res.status(500).json({ message: 'Error retrieving product details.' });
  }
}) as RequestHandler);

// Export the router
export default router;
