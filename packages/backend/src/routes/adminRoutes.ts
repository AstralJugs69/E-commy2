import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod'; // Import Zod for validation
import { isAdmin } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/admin/phonenumbers - Fetch all phone numbers
router.get('/phonenumbers', isAdmin, async (req: Request, res: Response) => {
  try {
    // Fetch all records from the PhoneNumber table
    const phoneNumbers = await prisma.phoneNumber.findMany({
      // Select only the necessary fields for the admin view
      select: {
        id: true,
        numberString: true,
        status: true
      }
    });
    
    // Return the list as JSON
    res.status(200).json(phoneNumbers);
  } catch (error) {
    // Handle potential database errors
    console.error("Error fetching phone numbers:", error);
    res.status(500).json({ message: 'Error fetching phone numbers' });
  }
});

// POST /api/admin/phonenumbers/:id/status - Update a phone number's status
router.post('/phonenumbers/:id/status', isAdmin, async (req: Request, res: Response) => {
  // 1. Get the phone number ID from route parameters
  const { id } = req.params;
  // 2. Get the new status from the request body
  const { status } = req.body;

  // 3. Basic Input Validation
  const allowedStatuses = ['Available', 'Busy', 'Offline'];
  if (!status || !allowedStatuses.includes(status)) {
    res.status(400).json({ 
      message: 'Invalid status provided. Must be one of: ' + allowedStatuses.join(', ') 
    });
    return;
  }

  const phoneNumberId = parseInt(id, 10);
  if (isNaN(phoneNumberId)) {
    res.status(400).json({ message: 'Invalid phone number ID.' });
    return;
  }

  try {
    // 4. Update the phone number's status in the database
    const updatedPhoneNumber = await prisma.phoneNumber.update({
      where: { id: phoneNumberId },
      data: { status },
      select: { 
        id: true, 
        numberString: true, 
        status: true 
      }
    });

    // 5. Return the updated phone number
    res.status(200).json(updatedPhoneNumber);

  } catch (error: any) {
    // 6. Handle potential errors
    if (error.code === 'P2025') { // Prisma code for record not found
      res.status(404).json({ 
        message: `Phone number with ID ${phoneNumberId} not found.` 
      });
      return;
    }
    console.error(`Error updating phone number ${phoneNumberId} status:`, error);
    res.status(500).json({ message: 'Error updating phone number status' });
  }
});

// GET /api/admin/serviceareas - Fetch all service areas
router.get('/serviceareas', isAdmin, async (req: Request, res: Response) => {
  try {
    // 1. Fetch all records from the ServiceArea table
    const serviceAreas = await prisma.serviceArea.findMany({
      // 2. Select the fields needed: id, name, geoJsonPolygon
      select: {
        id: true,
        name: true,
        geoJsonPolygon: true // The string representation
      }
    });
    
    // 3. Return the list as JSON
    res.status(200).json(serviceAreas);
  } catch (error) {
    // 4. Handle potential database errors
    console.error("Error fetching service areas:", error);
    res.status(500).json({ message: 'Error fetching service areas' });
  }
});

// Define a Zod schema for input validation
const createServiceAreaSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  geoJsonPolygon: z.string().min(10, { message: "GeoJSON Polygon string is required and must be valid" }) // Basic check
  // Add more specific GeoJSON validation later if needed
});

// POST /api/admin/serviceareas - Create a new service area
router.post('/serviceareas', isAdmin, async (req: Request, res: Response) => {
  // 1. Validate Request Body using Zod
  const validationResult = createServiceAreaSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ 
      message: "Validation failed", 
      errors: validationResult.error.errors 
    });
    return;
  }

  // Extract validated data
  const { name, geoJsonPolygon } = validationResult.data;

  // Optional: Add further validation to check if geoJsonPolygon is valid JSON
  try {
    JSON.parse(geoJsonPolygon);
  } catch (e) {
    res.status(400).json({ 
      message: 'geoJsonPolygon field does not contain valid JSON string.' 
    });
    return;
  }

  try {
    // 2. Use Prisma client's `create` method to add a new ServiceArea record
    const newServiceArea = await prisma.serviceArea.create({
      data: {
        name,
        geoJsonPolygon
      },
      select: { // Select fields to return
        id: true,
        name: true,
        geoJsonPolygon: true
      }
    });

    // 3. Return the newly created service area object as JSON with a 201 Created status
    res.status(201).json(newServiceArea);

  } catch (error: any) {
    // 4. Handle potential errors
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      res.status(409).json({ 
        message: `Service area with name '${name}' already exists.` 
      });
      return;
    }
    console.error("Error creating service area:", error);
    res.status(500).json({ message: 'Error creating service area' });
  }
});

export default router; 