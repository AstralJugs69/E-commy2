import { Router, Request, Response, RequestHandler } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * @route GET /api/products
 * @description Get all products with optional search and filtering
 * @access Public
 */
router.get('/', (async (req: Request, res: Response) => {
  try {
    console.log('GET /api/products route hit');
    console.log('Query params:', req.query);
    
    // Extract query parameters
    const search = req.query.search as string | undefined;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
    
    // Extract pagination parameters
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '12', 10); // Default limit 12
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
        return res.status(400).json({ message: 'Invalid pagination parameters.' });
    }
    const skip = (page - 1) * limit;
    
    // Build the where clause for filtering
    const whereClause: any = {};
    
    // Add search filter if provided
    if (search) {
      whereClause.name = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    // Add category filter if provided
    if (categoryId && !isNaN(categoryId)) {
      whereClause.categories = {
        some: {
          categoryId
        }
      };
    }
    
    // Get sorting configuration
    const orderByClause: any = {};
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
    
    // Fetch products with the constructed filters and pagination
    const products = await prisma.product.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        imageUrl: true,
        stock: true,
        averageRating: true,
        reviewCount: true,
        createdAt: true
      },
      orderBy: orderByClause,
      skip: skip,
      take: limit
    });
    
    console.log(`Found ${products.length} products (page ${page} of ${Math.ceil(totalProducts / limit)})`);
    
    // Return paginated response
    res.status(200).json({
      products: products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts: totalProducts
    });
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
router.get('/:productId', (async (req: Request, res: Response) => {
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
        imageUrl: true,
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
router.get('/:productId/reviews', (async (req: Request, res: Response) => {
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

// Export the router
export default router;
