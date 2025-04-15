import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { isAdmin } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Define Zod schema for product creation
const productSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  price: z.number().positive({ message: "Price must be a positive number" }),
  description: z.string().optional(),
  stock: z.number().int().min(0, { message: "Stock cannot be negative" }).optional(),
  imageUrl: z.string().url({ message: "Invalid image URL" }).optional().or(z.literal('')), // Allow empty string
  categoryId: z.number().int().positive().optional().nullable(), // Allow null or positive int
});

// For updates, make all fields optional
const updateProductSchema = productSchema.partial();

// Define Zod schema for stock adjustment
const adjustStockSchema = z.object({
  adjustment: z.number().int({ message: "Adjustment must be an integer" }),
});

// GET /api/admin/products - Get all products with category info
router.get('/', isAdmin, async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true, // Include category ID
            name: true
          }
        }
      },
      orderBy: {
        id: 'desc' // Or name: 'asc' etc.
      }
    });

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products with categories:', error);
    res.status(500).json({ message: 'An error occurred while fetching products.' });
  }
});

// POST /api/admin/products - Create a new product
router.post('/', isAdmin, async (req: Request, res: Response) => {
  // Validate request body
  const validationResult = productSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: validationResult.error.flatten().fieldErrors // Send detailed errors
    });
    return;
  }

  // Prepare data, ensuring optional fields are handled correctly
  const { categoryId, stock, imageUrl, description, ...restData } = validationResult.data;
  const productData: Prisma.ProductCreateInput = {
      ...restData,
      description: description || null, // Set to null if undefined/empty
      imageUrl: imageUrl || null, // Set to null if undefined/empty
      stock: stock ?? 0, // Default stock to 0 if not provided
      // Connect to category only if categoryId is provided and valid
      ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
  };

  try {
    // Create product using Prisma
    const newProduct = await prisma.product.create({
      data: productData,
      include: { category: true } // Include category in response
    });

    // Return created product with 201 status
    res.status(201).json(newProduct);
  } catch (error: any) {
    // Check for specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') { // Unique constraint violation
            return res.status(409).json({ message: 'A product with this name/details might already exist.' });
        }
        if (error.code === 'P2003' || error.code === 'P2025') { // Foreign key constraint or related record not found (Category)
             console.error("Foreign key error:", error.meta);
             return res.status(400).json({ message: 'Invalid Category ID provided.' });
        }
    }

    console.error("Error creating product:", error);
    res.status(500).json({ message: 'An internal server error occurred while creating the product.' });
  }
});


// PUT /api/admin/products/:productId - Update an existing product
router.put('/:productId', isAdmin, async (req: Request, res: Response) => {
  // Validate productId parameter
  const productIdInt = parseInt(req.params.productId, 10);
  if (isNaN(productIdInt)) {
    res.status(400).json({ message: 'Invalid product ID' });
    return;
  }

  // Validate request body
  const validationResult = updateProductSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: validationResult.error.flatten().fieldErrors
    });
    return;
  }

  // Check if the request body is empty (no fields to update)
  if (Object.keys(validationResult.data).length === 0) {
    res.status(400).json({ message: 'No fields provided for update' });
    return;
  }

  // Prepare update data carefully
  const { categoryId, ...restData } = validationResult.data;
  const updateData: Prisma.ProductUpdateInput = { ...restData };

  // Handle optional fields explicitly setting null if empty string passed
  if ('description' in updateData) updateData.description = updateData.description || null;
  if ('imageUrl' in updateData) updateData.imageUrl = updateData.imageUrl || null;
  if ('stock' in updateData && updateData.stock === undefined) delete updateData.stock; // Don't update stock if undefined

  // Handle category connection/disconnection
  if (categoryId !== undefined) { // Check if categoryId was provided in the update request
      if (categoryId === null || categoryId === 0) { // Allow unsetting category
          updateData.category = { disconnect: true };
      } else {
          updateData.category = { connect: { id: categoryId } };
      }
  }


  try {
    // Update product using Prisma
    const updatedProduct = await prisma.product.update({
      where: { id: productIdInt },
      data: updateData,
      include: {
        category: true // Include category in response
      }
    });

    // Return updated product
    res.status(200).json(updatedProduct);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle "Not Found" error
        if (error.code === 'P2025') {
            return res.status(404).json({ message: `Product with ID ${productIdInt} not found.` });
        }
        // Handle foreign key constraint violation (invalid categoryId)
        if (error.code === 'P2003' || (error.code === 'P2025' && error.message.includes('constraint'))) {
             console.error("Foreign key error on update:", error.meta);
             return res.status(400).json({ message: 'Invalid Category ID provided for update.' });
        }
    }

    console.error(`Error updating product ${productIdInt}:`, error);
    res.status(500).json({ message: 'An internal server error occurred while updating the product.' });
  }
});


// POST /api/admin/products/:productId/adjust-stock - Adjust product stock
router.post('/:productId/adjust-stock', isAdmin, async (req: Request, res: Response) => {
    const productIdInt = parseInt(req.params.productId, 10);
    if (isNaN(productIdInt)) {
        res.status(400).json({ message: 'Invalid product ID' });
        return;
    }

    const validationResult = adjustStockSchema.safeParse(req.body);
    if (!validationResult.success) {
        res.status(400).json({
            message: "Validation failed",
            errors: validationResult.error.flatten().fieldErrors
        });
        return;
    }
    const { adjustment } = validationResult.data;

    if (adjustment === 0) { // No change needed
         // Fetch current product data if no adjustment needed
         try {
            const product = await prisma.product.findUnique({
                where: { id: productIdInt },
                select: { id: true, name: true, stock: true }
            });
            if (!product) {
                res.status(404).json({ message: `Product with ID ${productIdInt} not found.` });
                return;
            }
            res.status(200).json(product); // Send current state
            return;
         } catch (error) {
            console.error(`Error fetching product ${productIdInt} for zero adjustment:`, error);
            res.status(500).json({ message: 'Error fetching product data.' });
            return;
         }
    }

    try {
        const updatedProduct = await prisma.$transaction(async (tx) => {
            const product = await tx.product.findUnique({
                where: { id: productIdInt },
                select: { stock: true, name: true } // Select name for error message
            });

            if (!product) {
                throw new Error('ProductNotFound'); // Custom error flag for transaction handling
            }

            const newStock = product.stock + adjustment;
            if (newStock < 0) {
                // Prevent stock from going negative
                throw new Error(`Stock cannot be negative. Current stock for '${product.name}': ${product.stock}, Adjustment: ${adjustment}`);
            }

            // Perform the update within the transaction
            return await tx.product.update({
                where: { id: productIdInt },
                data: { stock: newStock },
                select: { id: true, name: true, stock: true } // Select fields to return
            });
        });

        // Transaction successful, return updated product
        res.status(200).json(updatedProduct);

    } catch (error: any) {
        // Handle custom and specific errors
        if (error.message === 'ProductNotFound') {
            res.status(404).json({ message: `Product with ID ${productIdInt} not found.` });
            return;
        }
        if (error.message?.startsWith('Stock cannot be negative')) {
            res.status(400).json({ message: error.message });
            return;
        }
        // Handle general errors
        console.error(`Error adjusting stock for product ${productIdInt}:`, error);
        res.status(500).json({ message: 'Error adjusting stock.' });
    }
});

// DELETE /api/admin/products/:productId - Delete a product
router.delete('/:productId', isAdmin, async (req: Request, res: Response) => {
  // Validate productId parameter
  const productIdInt = parseInt(req.params.productId, 10);
  if (isNaN(productIdInt)) {
    res.status(400).json({ message: 'Invalid product ID' });
    return;
  }

  try {
    // Delete product using Prisma
    // Prisma automatically handles relation checks based on schema (onDelete behavior)
    // If OrderItem relation has onDelete: Cascade/SetNull/Restrict, it behaves accordingly.
    // If it has Restrict (default if not specified), Prisma will throw P2003 if items exist.
    await prisma.product.delete({
      where: { id: productIdInt }
    });

    // Return 204 No Content on successful deletion
    res.status(204).send();
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle "Not Found" error
        if (error.code === 'P2025') {
            return res.status(404).json({ message: `Product with ID ${productIdInt} not found.` });
        }
        // Handle foreign key constraint violations (product referenced in OrderItem)
        if (error.code === 'P2003') {
             console.warn(`Attempted to delete product ${productIdInt} referenced in orders.`);
             return res.status(409).json({
                message: 'Cannot delete product because it is referenced in existing orders. Consider marking it as inactive instead.'
             });
        }
    }

    console.error(`Error deleting product ${productIdInt}:`, error);
    res.status(500).json({ message: 'An internal server error occurred while deleting the product.' });
  }
});


export default router;