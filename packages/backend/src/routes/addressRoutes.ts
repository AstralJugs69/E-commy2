import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { isUser } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Zod schema for creating an address (all fields required except isDefault)
const addressSchema = z.object({
    fullName: z.string().min(1, { message: "Full name is required" }),
    phone: z.string().min(1, { message: "Phone number is required" }),
    address: z.string().min(1, { message: "Address line is required" }),
    city: z.string().min(1, { message: "City is required" }),
    zipCode: z.string().min(1, { message: "Zip code is required" }),
    country: z.string().min(1, { message: "Country is required" }),
    isDefault: z.boolean().optional().default(false),
});

// Zod schema for updating an address (all fields optional)
const updateAddressSchema = addressSchema.partial();

// Middleware to ensure user is authenticated
router.use(isUser);

// POST /api/addresses - Create a new address
router.post('/', async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
        // Should be caught by isUser, but safeguard
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    const validationResult = addressSchema.safeParse(req.body);
    if (!validationResult.success) {
        res.status(400).json({
            message: 'Validation failed',
            errors: validationResult.error.flatten().fieldErrors,
        });
        return;
    }

    const { isDefault, ...addressData } = validationResult.data;

    try {
        let newAddress;
        // Map field names correctly to match the Prisma schema
        const createData = {
            userId: userId,
            fullName: addressData.fullName,
            phone: addressData.phone,       // Correct field name
            address: addressData.address,   // Correct field name
            city: addressData.city,
            zipCode: addressData.zipCode,   // Correct field name
            country: addressData.country,
            isDefault: isDefault ?? false
        };

        if (isDefault) {
            // If setting as default, use a transaction to unset other defaults
            [newAddress] = await prisma.$transaction([
                prisma.address.create({
                    data: createData, // Now using correct field names
                }),
                prisma.address.updateMany({
                    where: { userId, NOT: { id: undefined } }, // This will be replaced by the new ID
                    data: { isDefault: false },
                }),
            ]);
            // Update the 'NOT' condition with the actual ID after creation
            await prisma.address.updateMany({
                 where: { userId, NOT: { id: newAddress.id } },
                 data: { isDefault: false },
            });

        } else {
            // Otherwise, just create the address
            newAddress = await prisma.address.create({
                data: createData, // Now using correct field names
            });
        }

        res.status(201).json(newAddress);
    } catch (error) {
        console.error('Error creating address:', error);
        // Check if it's the TS error we were seeing before
        if (error instanceof TypeError && error.message.includes('AddressUncheckedCreateInput')) {
             res.status(500).json({ message: 'Internal server error: Address creation type mismatch.' });
        } else {
             res.status(500).json({ message: 'Failed to create address' });
        }
    }
});

// GET /api/addresses - List all addresses for the user
router.get('/', async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        const addresses = await prisma.address.findMany({
            where: { userId },
            orderBy: { isDefault: 'desc' }, // Show default first
        });
        res.status(200).json(addresses);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ message: 'Failed to fetch addresses' });
    }
});

// Middleware for address ID validation
const validateAddressId = (req: Request, res: Response, next: Function) => {
    const addressIdInt = parseInt(req.params.addressId, 10);
    if (isNaN(addressIdInt)) {
        res.status(400).json({ message: 'Invalid address ID format' });
        return;
    }
    // Attach validated ID to request object for later use
    (req as any).addressIdInt = addressIdInt;
    next();
};


// PUT /api/addresses/:addressId - Update an existing address
router.put('/:addressId', validateAddressId, async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const addressIdInt = (req as any).addressIdInt;
    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    const validationResult = updateAddressSchema.safeParse(req.body);
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

    const { isDefault, ...addressData } = validationResult.data;

    try {
        let updatedAddress;
        // Prepare update data, ensuring correct field names from schema
        const updatePayload: any = {};
        if (addressData.fullName !== undefined) updatePayload.fullName = addressData.fullName;
        if (addressData.phone !== undefined) updatePayload.phone = addressData.phone;
        if (addressData.address !== undefined) updatePayload.address = addressData.address;
        if (addressData.city !== undefined) updatePayload.city = addressData.city;
        if (addressData.zipCode !== undefined) updatePayload.zipCode = addressData.zipCode;
        if (addressData.country !== undefined) updatePayload.country = addressData.country;

        if (isDefault === true) {
            // Use transaction to set this one as default and unset others
             [, updatedAddress] = await prisma.$transaction([
                prisma.address.updateMany({
                    where: { userId, NOT: { id: addressIdInt } },
                    data: { isDefault: false },
                }),
                prisma.address.update({
                    where: { id: addressIdInt, userId }, // Ensure user owns the address
                    data: { ...updatePayload, isDefault: true },
                }),
            ]);
        } else if (isDefault === false) {
             // Explicitly setting isDefault to false
             updatedAddress = await prisma.address.update({
                 where: { id: addressIdInt, userId },
                 data: { ...updatePayload, isDefault: false },
             });
        }
        else {
            // isDefault not provided or undefined, just update other fields
            updatedAddress = await prisma.address.update({
                where: { id: addressIdInt, userId },
                data: updatePayload, // isDefault remains unchanged
            });
        }


        if (!updatedAddress) {
             // This case should ideally be handled by Prisma throwing P2025 if not found
             // If the transaction succeeded but updatedAddress is null/undefined, it indicates an issue.
             console.error(`Address update transaction completed but result is empty for ID ${addressIdInt}`);
             res.status(404).json({ message: `Address with ID ${addressIdInt} not found or does not belong to user.` });
             return;
        }

        res.status(200).json(updatedAddress);

    } catch (error: any) {
         if (error.code === 'P2025') { // Prisma error code for record not found
             res.status(404).json({ message: `Address with ID ${addressIdInt} not found or does not belong to user.` });
         } else {
            console.error(`Error updating address ${addressIdInt}:`, error);
            res.status(500).json({ message: 'Failed to update address' });
         }
    }
});

// DELETE /api/addresses/:addressId - Delete an address
router.delete('/:addressId', validateAddressId, async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const addressIdInt = (req as any).addressIdInt;
     if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        await prisma.address.delete({
            where: { id: addressIdInt, userId }, // Ensure user owns the address
        });
        res.status(204).send(); // No content on successful deletion
    } catch (error: any) {
         if (error.code === 'P2025') { // Prisma error code for record not found
             res.status(404).json({ message: `Address with ID ${addressIdInt} not found or does not belong to user.` });
         } else {
            console.error(`Error deleting address ${addressIdInt}:`, error);
            res.status(500).json({ message: 'Failed to delete address' });
         }
    }
});

// POST /api/addresses/:addressId/set-default - Set an address as default
router.post('/:addressId/set-default', validateAddressId, async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const addressIdInt = (req as any).addressIdInt;
    if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
    }

    try {
        // Use transaction to set the specified address as default and unset others
        const [, updatedAddress] = await prisma.$transaction([
            prisma.address.updateMany({
                where: { userId, NOT: { id: addressIdInt } },
                data: { isDefault: false },
            }),
            prisma.address.update({
                where: { id: addressIdInt, userId }, // Ensure user owns the address
                data: { isDefault: true },
            }),
        ]);

        // If the update threw P2025, the transaction would fail.
        // If it succeeded, we know the record existed and was updated.
        res.status(200).json(updatedAddress);

    } catch (error: any) {
         if (error.code === 'P2025') { // Handle record not found specifically
             res.status(404).json({ message: `Address with ID ${addressIdInt} not found or does not belong to user.` });
         } else {
             console.error(`Error setting default address ${addressIdInt}:`, error);
             res.status(500).json({ message: 'Failed to set default address' });
         }
    }
});


export default router;
