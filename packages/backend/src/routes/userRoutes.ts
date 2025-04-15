import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { isUser } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Zod schema for updating user profile
const updateProfileSchema = z.object({
    name: z.string().min(1).optional(), // Allow updating name
    // Add other editable fields later if needed
});

/**
 * PUT /api/users/me - Update authenticated user's profile
 * Protected route - requires valid JWT token
 */
router.put('/me', isUser, async (req: Request, res: Response) => {
    // Get user ID from token (isUser middleware adds user to req)
    if (!req.user || !req.user.userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }
    
    const userId = req.user.userId;
    
    try {
        // Validate request body
        const validationResult = updateProfileSchema.safeParse(req.body);
        if (!validationResult.success) {
            res.status(400).json({
                message: 'Validation failed',
                errors: validationResult.error.flatten().fieldErrors
            });
            return;
        }
        
        const { name } = validationResult.data;
        
        // Prepare update data (only include fields that are present in the request)
        const updateData: { name?: string } = {};
        if (name !== undefined) {
            updateData.name = name;
        }
        
        // Check if there's anything to update
        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ message: 'No valid fields to update' });
            return;
        }
        
        // Update user in database
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true
            }
        });
        
        // Return updated user profile
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user profile:', error);
        
        // Check for Prisma errors
        if (error instanceof Error) {
            // Handle common Prisma errors
            if (error.message.includes('Record to update not found')) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
        }
        
        res.status(500).json({ message: 'An internal server error occurred' });
    }
});

export default router; 