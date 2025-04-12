import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { isUser } from '../middleware/authMiddleware';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';

const router = Router();
const prisma = new PrismaClient();

// Define Zod schemas for order validation
const cartItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive()
});

const createOrderSchema = z.object({
  customerName: z.string().min(1, { message: "Customer name is required" }),
  customerPhone: z.string().min(1, { message: "Customer phone is required" }),
  addressText: z.string().min(1, { message: "Address is required" }),
  latitude: z.number({ message: "Latitude must be a number" }),
  longitude: z.number({ message: "Longitude must be a number" }),
  cartItems: z.array(cartItemSchema).min(1, { message: "At least one product is required" })
});

// POST /api/orders - Create a new order
router.post('/', isUser, async (req: Request, res: Response) => {
  // 1. Validate request body using Zod schema
  const validationResult = createOrderSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ 
      message: "Validation failed", 
      errors: validationResult.error.errors 
    });
    return;
  }
  
  const { customerName, customerPhone, addressText, latitude, longitude, cartItems } = validationResult.data;

  // 2. Extract userId from JWT payload (attached by isUser middleware)
  // For testing purposes, use userId 1 if not found in token
  const userId = req.user?.userId || 1;
  
  let locationCheckResult = "Outside Zone"; // Default result
  let zoneName = null;

  try {
    // 3. Fetch all service area polygons from DB
    const serviceAreas = await prisma.serviceArea.findMany({
      select: { id: true, name: true, geoJsonPolygon: true }
    });

    console.log(`Found ${serviceAreas.length} service areas to check against.`);

    // 4. Create a Turf.js point from the provided coordinates
    const customerLocation = point([longitude, latitude]); // GeoJSON is [Lon, Lat]

    // 5. Iterate through service areas and perform point-in-polygon check
    for (const area of serviceAreas) {
      try {
        const polygon = JSON.parse(area.geoJsonPolygon); // Parse the stored string
        console.log(`Checking against area ${area.id} (${area.name})`);
        
        // Ensure it's a valid Polygon or MultiPolygon GeoJSON structure before checking
        if (polygon && (polygon.type === 'Polygon' || polygon.type === 'MultiPolygon') && polygon.coordinates) {
          const result = booleanPointInPolygon(customerLocation, polygon);
          console.log(`Point-in-polygon check for area ${area.id}: ${result}`);
          
          if (result) {
            locationCheckResult = `Inside Zone`;
            zoneName = area.name; // Store the zone name for reference
            console.log(`Point is inside area ${area.id} (${area.name})`);
            break; // Found a containing zone, no need to check others
          }
        } else {
          console.warn(`Invalid GeoJSON structure for ServiceArea ID ${area.id}`);
        }
      } catch (parseError) {
        console.error(`Error parsing GeoJSON for ServiceArea ID ${area.id}:`, parseError);
        // We'll continue checking other zones rather than failing the order
      }
    }

    // 6. Save the order to the database using Prisma `create`
    const newOrder = await prisma.order.create({
      data: {
        userId: userId,
        customerName: customerName,
        customerPhone: customerPhone,
        addressText: addressText,
        latitude: latitude,
        longitude: longitude,
        status: 'Pending Call', // Initial status
        locationCheckResult: locationCheckResult,
        // Note: Storing cartItems simplified for MVP. Could be JSON string or separate table later.
        // For now, we are not storing cartItems details directly in the Order table based on current schema.
      },
      select: { id: true } // Only return the ID
    });

    // 7. Return 201 Created status with the new order ID
    res.status(201).json({ 
      orderId: newOrder.id,
      locationCheck: {
        result: locationCheckResult,
        zoneName: zoneName
      }
    });

  } catch (error) {
    // 8. Handle errors (DB errors, etc.)
    console.error("Error creating order:", error);
    res.status(500).json({ message: 'Error creating order' });
  }
});

export default router; 