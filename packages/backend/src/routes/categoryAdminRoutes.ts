import { Router, Request, Response, RequestHandler } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { isAdmin } from '../middleware/authMiddleware';
import { getPaginationParams, createPaginatedResponse } from '../utils/pagination';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const categorySchema = z.object({
  name: z.string().min(1, { message: "Category name is required" }).max(100),
  description: z.string().optional(),
  imageUrl: z.string().url({ message: "Invalid URL format" }).optional().or(z.literal('')), // Allow empty string or valid URL
});

const updateCategorySchema = categorySchema.partial();

/**
 * @route POST /api/admin/categories
 * @description Create a new category
 * @access Admin
 */
router.post('/', isAdmin, (async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = categorySchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors
      });
      return;
    }

    const { name, description, imageUrl } = validationResult.data;

    // Prevent manual creation of "All" system category
    if (name === "All") {
      res.status(400).json({ message: "Cannot manually create the 'All' system category." });
      return;
    }

    // Create the category with type safety
    const categoryData: Prisma.CategoryCreateInput = {
      name,
      description: description || null, // Ensure null if empty/undefined
      imageUrl: imageUrl || null // Ensure null if empty/undefined
    };

    const newCategory = await prisma.category.create({
      data: categoryData
    });

    res.status(201).json(newCategory);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 is the error code for unique constraint violation
      if (error.code === 'P2002') {
        res.status(409).json({ message: 'A category with this name already exists.' });
        return;
      }
    }

    console.error('Error creating category:', error);
    res.status(500).json({ message: 'An error occurred while creating the category.' });
  }
}) as RequestHandler);

/**
 * @route GET /api/admin/categories
 * @description Get all categories with pagination, sorting, and filtering
 * @access Admin
 */
router.get('/', isAdmin, (async (req: Request, res: Response) => {
  try {
    // Extract query parameters
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'name';
    const sortOrder = typeof req.query.sortOrder === 'string' ? req.query.sortOrder.toLowerCase() : 'asc';
    
    // Get pagination parameters (default limit of 15 for admin)
    const paginationParams = getPaginationParams(req, 15);
    
    // Build the where clause for filtering
    const whereClause: Prisma.CategoryWhereInput = {};
    if (search) {
      whereClause.name = { contains: search, mode: 'insensitive' };
    }
    
    // Build the orderBy clause for sorting
    const orderByClause: Prisma.CategoryOrderByWithRelationInput = {};
    
    // Validate sortBy against allowed fields
    const allowedSortFields = ['id', 'name'];
    const validatedSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    
    // Validate sortOrder
    const validatedSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';
    
    // Set the orderBy clause dynamically
    orderByClause[validatedSortBy as keyof Prisma.CategoryOrderByWithRelationInput] = validatedSortOrder;
    
    // Execute the queries in parallel
    const [totalItems, categories] = await prisma.$transaction([
      prisma.category.count({ where: whereClause }),
      prisma.category.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          description: true,
          imageUrl: true,
          isSystemCategory: true,
        },
        orderBy: orderByClause,
        skip: paginationParams.skip,
        take: paginationParams.limit
      })
    ]);
    
    // Create and return the paginated response
    const paginatedResponse = createPaginatedResponse(categories, totalItems, paginationParams);
    res.status(200).json(paginatedResponse);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'An error occurred while fetching categories.' });
  }
}) as RequestHandler);

/**
 * @route PUT /api/admin/categories/:categoryId
 * @description Update a category
 * @access Admin
 */
router.put('/:categoryId', isAdmin, (async (req: Request, res: Response) => {
  try {
    // Validate ID param
    const categoryId = parseInt(req.params.categoryId);
    if (isNaN(categoryId)) {
      res.status(400).json({ message: 'Invalid category ID.' });
      return;
    }

    // Validate request body
    const validationResult = updateCategorySchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors
      });
      return;
    }

    // Fetch the existing category to check its system flag and name
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { isSystemCategory: true, name: true }
    });

    if (!existingCategory) {
      res.status(404).json({ message: 'Category not found.' });
      return;
    }

    // Check if trying to change the name of a system category
    if (existingCategory.isSystemCategory && 
        validationResult.data.name !== undefined && 
        validationResult.data.name !== existingCategory.name) {
      res.status(400).json({ message: 'Cannot change the name of a system category.' });
      return;
    }

    // Create update data with proper typing
    const updateData: Prisma.CategoryUpdateInput = {};

    if (validationResult.data.name !== undefined) {
      updateData.name = validationResult.data.name;
    }

    if (validationResult.data.description !== undefined) {
      updateData.description = validationResult.data.description || null; // Set to null if empty string
    }

    if (validationResult.data.imageUrl !== undefined) {
      updateData.imageUrl = validationResult.data.imageUrl || null; // Set to null if empty string
    }

    // Update the category
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: updateData
    });

    res.status(200).json(updatedCategory);
  } catch (error: any) {
    // Handle specific errors first
    if (error?.status === 404) {
        return res.status(404).json({ message: error.message });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002 is the error code for unique constraint violation
      if (error.code === 'P2002') {
        res.status(409).json({ message: 'A category with this name already exists.' });
        return;
      }
    }

    console.error('Error updating category:', error);
    res.status(500).json({ message: 'An error occurred while updating the category.' });
  }
}) as RequestHandler);

/**
 * @route DELETE /api/admin/categories/:categoryId
 * @description Delete a category
 * @access Admin
 */
router.delete('/:categoryId', isAdmin, (async (req: Request, res: Response) => {
  try {
    // Validate ID param
    const categoryId = parseInt(req.params.categoryId);
    if (isNaN(categoryId)) {
      res.status(400).json({ message: 'Invalid category ID.' });
      return;
    }

    // Check if category exists and if it has products in one go
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { 
        _count: { 
          select: { 
            products: true 
          } 
        } 
      }
    });

    if (!existingCategory) {
      res.status(404).json({ message: 'Category not found.' });
      return;
    }

    // Prevent deletion of system categories
    if (existingCategory.isSystemCategory) {
      res.status(400).json({ message: "Cannot delete a system category." });
      return;
    }

    // Check if category has associated products
    if (existingCategory._count.products > 0) {
      res.status(409).json({ message: `Cannot delete category "${existingCategory.name}" as it has ${existingCategory._count.products} associated products.` });
      return;
    }

    // Delete the category
    await prisma.category.delete({
      where: { id: categoryId }
    });

    res.status(204).send();
  } catch (error: any) {
    // Check for specific Prisma errors if needed, though findUnique handles not found
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
       // P2003 might still happen if relations change, though the check above should prevent it
       if (error.code === 'P2003') {
         return res.status(409).json({ message: 'Cannot delete category due to existing references.' });
       }
    }

    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'An error occurred while deleting the category.' });
  }
}) as RequestHandler);

export default router;