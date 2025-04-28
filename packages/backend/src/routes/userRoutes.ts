import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { isUser } from '../middleware/authMiddleware';
import { staticCache, etagMiddleware } from '../middleware/cacheMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Zod schema for updating user profile
const updateProfileSchema = z.object({
    name: z.string().min(1).optional(), // Allow updating name
    // Add other editable fields if needed
});

/**
 * GET /api/users/me/profile - Get aggregated user profile with orders and addresses
 * Protected route - requires valid JWT token
 */
router.get('/me/profile', isUser, staticCache(60), etagMiddleware(), async (req: Request, res: Response) => {
    // Get user ID from token (isUser middleware adds user to req)
    if (!req.user || !req.user.userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    const userId = req.user.userId;

    try {
        // Fetch user profile with related data in a single query
        const userProfile = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                // Include delivery addresses
                deliveryLocations: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        district: true,
                        isDefault: true,
                        createdAt: true
                    },
                    orderBy: {
                        isDefault: 'desc' // Default address first
                    }
                },
                // Include recent orders (last 5)
                orders: {
                    select: {
                        id: true,
                        status: true,
                        totalAmount: true,
                        createdAt: true,
                        updatedAt: true,
                        // Include first item for each order
                        items: {
                            take: 1,
                            select: {
                                productName: true,
                                quantity: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 5 // Limit to 5 most recent orders
                },
                // Add aggregate count of orders by status
                _count: {
                    select: {
                        orders: true
                    }
                }
            }
        });

        if (!userProfile) {
            res.status(404).json({ message: 'User profile not found' });
            return;
        }

        // Count orders by status separately
        const orderStatusCounts = await prisma.order.groupBy({
            by: ['status'],
            where: {
                userId: userId
            },
            _count: {
                status: true
            }
        });

        // Convert to a more usable format
        const orderStats = orderStatusCounts.reduce((acc, curr) => {
            acc[curr.status] = curr._count.status;
            return acc;
        }, {} as Record<string, number>);

        // Calculate total spent (excluding cancelled orders)
        const totalSpent = await prisma.order.aggregate({
            where: {
                userId: userId,
                status: {
                    notIn: ['Cancelled', 'Pending Call']
                }
            },
            _sum: {
                totalAmount: true
            }
        });

        // Combine all data
        const profileData = {
            ...userProfile,
            orderStats,
            totalOrders: orderStats ? Object.values(orderStats).reduce((sum, count) => sum + count, 0) : 0,
            totalSpent: totalSpent._sum.totalAmount || 0
        };

        res.status(200).json(profileData);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'An internal server error occurred' });
    }
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