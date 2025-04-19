import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { isUser } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Zod schema for creating a delivery location
const deliveryLocationSchema = z.object({
    name: z.string().min(1, { message: "Location name is required" }),
    phone: z.string().min(1, { message: "Phone number is required" }),
    district: z.string().min(1, { message: "District is required" }),
    isDefault: z.boolean().optional().default(false),
});

// Zod schema for updating a delivery location (all fields optional)
const updateDeliveryLocationSchema = deliveryLocationSchema.partial();

// Middleware to ensure user is authenticated
router.use(isUser);

// POST /api/addresses - Create a new delivery location
router.post('/', async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
        // Should be caught by isUser, but safeguard
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    const validationResult = deliveryLocationSchema.safeParse(req.body);
    if (!validationResult.success) {
        res.status(400).json({
            message: 'Validation failed',
            errors: validationResult.error.flatten().fieldErrors,
        });
        return;
    }

    try {
        // Check if user already has 2 or more delivery locations
        const existingLocationsCount = await prisma.deliveryLocation.count({
            where: { userId }
        });

        if (existingLocationsCount >= 2) {
            res.status(400).json({ 
                message: 'Maximum limit of 2 delivery locations reached'
            });
            return;
        }

        const { isDefault, ...locationData } = validationResult.data;

        let newLocation;
        // Create data matching the Prisma schema
        const createData = {
            userId: userId,
            name: locationData.name,
            phone: locationData.phone,
            district: locationData.district,
            isDefault: isDefault ?? false
        };

        if (isDefault) {
            // If setting as default, use a transaction to unset other defaults
            [newLocation] = await prisma.$transaction([
                prisma.deliveryLocation.create({
                    data: createData,
                }),
                prisma.deliveryLocation.updateMany({
                    where: { userId, NOT: { id: undefined } }, // This will be replaced by the new ID
                    data: { isDefault: false },
                }),
            ]);
            // Update the 'NOT' condition with the actual ID after creation
            await prisma.deliveryLocation.updateMany({
                 where: { userId, NOT: { id: newLocation.id } },
                 data: { isDefault: false },
            });

        } else {
            // Otherwise, just create the delivery location
            newLocation = await prisma.deliveryLocation.create({
                data: createData,
            });
        }

        res.status(201).json(newLocation);
    } catch (error) {
        console.error('Error creating delivery location:', error);
        res.status(500).json({ message: 'Failed to create delivery location' });
    }
});

// GET /api/addresses - List all delivery locations for the user
router.get('/', async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        const locations = await prisma.deliveryLocation.findMany({
            where: { userId },
            orderBy: { isDefault: 'desc' }, // Show default first
        });
        
        res.status(200).json(locations);
    } catch (error) {
        console.error('Error fetching delivery locations:', error);
        res.status(500).json({ message: 'Failed to fetch delivery locations' });
    }
});

// Middleware for location ID validation
const validateLocationId = (req: Request, res: Response, next: Function) => {
    const locationIdInt = parseInt(req.params.locationId, 10);
    if (isNaN(locationIdInt)) {
        res.status(400).json({ message: 'Invalid delivery location ID format' });
        return;
    }
    // Attach validated ID to request object for later use
    (req as any).locationIdInt = locationIdInt;
    next();
};


// PUT /api/addresses/:locationId - Update an existing delivery location
router.put('/:locationId', validateLocationId, async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const locationIdInt = (req as any).locationIdInt;
    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    const validationResult = updateDeliveryLocationSchema.safeParse(req.body);
    if (!validationResult.success) {
        res.status(400).json({
            message: 'Validation failed',
            errors: validationResult.error.flatten().fieldErrors,
        });
        return;
    }

    // Check if the request body is empty
    if (Object.keys(validationResult.data).length === 0) {
        res.status(400).json({ message: 'No fields provided for update' });
        return;
    }

    const { isDefault, ...locationData } = validationResult.data;

    try {
        let updatedLocation;
        // Prepare update data, ensuring correct field names from schema
        const updatePayload: any = {};
        if (locationData.name !== undefined) updatePayload.name = locationData.name;
        if (locationData.phone !== undefined) updatePayload.phone = locationData.phone;
        if (locationData.district !== undefined) updatePayload.district = locationData.district;

        if (isDefault === true) {
            // Use transaction to set this one as default and unset others
             [, updatedLocation] = await prisma.$transaction([
                prisma.deliveryLocation.updateMany({
                    where: { userId, NOT: { id: locationIdInt } },
                    data: { isDefault: false },
                }),
                prisma.deliveryLocation.update({
                    where: { id: locationIdInt, userId }, // Ensure user owns the delivery location
                    data: { ...updatePayload, isDefault: true },
                }),
            ]);
        } else if (isDefault === false) {
             // Explicitly setting isDefault to false
             updatedLocation = await prisma.deliveryLocation.update({
                 where: { id: locationIdInt, userId },
                 data: { ...updatePayload, isDefault: false },
             });
        }
        else {
            // isDefault not provided or undefined, just update other fields
            updatedLocation = await prisma.deliveryLocation.update({
                where: { id: locationIdInt, userId },
                data: updatePayload, // isDefault remains unchanged
            });
        }


        if (!updatedLocation) {
             // This case should ideally be handled by Prisma throwing P2025 if not found
             // If the transaction succeeded but updatedLocation is null/undefined, it indicates an issue.
             console.error(`Delivery location update transaction completed but result is empty for ID ${locationIdInt}`);
             res.status(404).json({ message: `Delivery location with ID ${locationIdInt} not found or does not belong to user.` });
             return;
        }

        res.status(200).json(updatedLocation);

    } catch (error: any) {
         if (error.code === 'P2025') { // Prisma error code for record not found
             res.status(404).json({ message: `Delivery location with ID ${locationIdInt} not found or does not belong to user.` });
         } else {
            console.error(`Error updating delivery location ${locationIdInt}:`, error);
            res.status(500).json({ message: 'Failed to update delivery location' });
         }
    }
});

// DELETE /api/addresses/:locationId - Delete a delivery location
router.delete('/:locationId', validateLocationId, async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const locationIdInt = (req as any).locationIdInt;
     if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        await prisma.deliveryLocation.delete({
            where: { id: locationIdInt, userId }, // Ensure user owns the delivery location
        });
        res.status(204).send(); // No content on successful deletion
    } catch (error: any) {
         if (error.code === 'P2025') { // Prisma error code for record not found
             res.status(404).json({ message: `Delivery location with ID ${locationIdInt} not found or does not belong to user.` });
         } else {
            console.error(`Error deleting delivery location ${locationIdInt}:`, error);
            res.status(500).json({ message: 'Failed to delete delivery location' });
         }
    }
});

// POST /api/addresses/:locationId/set-default - Set a delivery location as default
router.post('/:locationId/set-default', validateLocationId, async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const locationIdInt = (req as any).locationIdInt;
    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        // Use transaction to set the specified delivery location as default and unset others
        const [, updatedLocation] = await prisma.$transaction([
            prisma.deliveryLocation.updateMany({
                where: { userId, NOT: { id: locationIdInt } },
                data: { isDefault: false },
            }),
            prisma.deliveryLocation.update({
                where: { id: locationIdInt, userId }, // Ensure user owns the delivery location
                data: { isDefault: true },
            }),
        ]);

        res.status(200).json(updatedLocation);
    } catch (error: any) {
        if (error.code === 'P2025') { // Prisma error code for record not found
            res.status(404).json({ message: `Delivery location with ID ${locationIdInt} not found or does not belong to user.` });
        } else {
            console.error(`Error setting default delivery location ${locationIdInt}:`, error);
            res.status(500).json({ message: 'Failed to set default delivery location' });
        }
    }
});


export default router; 