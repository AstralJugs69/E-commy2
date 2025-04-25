import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client'; // Import Prisma type
import { z } from 'zod';
import { isUser } from '../middleware/authMiddleware';
import { getPaginationParams, createPaginatedResponse } from '../utils/pagination';

const router = Router();
const prisma = new PrismaClient();

// Define Zod schemas for order validation
// Ensure Product includes necessary fields for cart context
const cartItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  // Price validation might be better handled by fetching product price server-side
  // For now, assume price sent from frontend is correct for the item
  price: z.number().positive({ message: "Item price must be positive" }),
  // Include potentially other needed fields like name, imageUrl if needed from cart
  name: z.string().optional(), // Optional: name might be fetched server-side
  imageUrl: z.string().optional(),
});

// Location schema for geolocation data
const locationSchema = z.object({
  lat: z.number(),
  lng: z.number()
}).optional();

const createOrderSchema = z.object({
  items: z.array(cartItemSchema).min(1, { message: "At least one product is required" }),
  deliveryLocationId: z.number().int().positive({ message: "Valid Delivery Location ID is required" }),
  totalAmount: z.number().positive({ message: "Total amount must be positive" }),
  location: locationSchema // Add location field to schema
});

// POST /api/orders - Create a new order
router.post('/', isUser, async (req: Request, res: Response) => {
  try {
    // Validate request body using Zod schema
    const validationResult = createOrderSchema.safeParse(req.body);
    if (!validationResult.success) {
      console.error("Order validation failed:", validationResult.error.flatten());
      res.status(400).json({
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors // Send detailed errors
      });
      return;
    }

    const { items, deliveryLocationId, totalAmount, location } = validationResult.data;
    const userId = req.user?.userId;

    if (!userId) {
      // This should technically be caught by isUser, but double-check
      res.status(401).json({ message: "User ID not found in token" });
      return;
    }

    // Create the order and order items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // --- Verify DeliveryLocation exists and belongs to the user ---
      console.log(`Verifying delivery location ID ${deliveryLocationId} belongs to user ${userId}`);
      await tx.deliveryLocation.findFirstOrThrow({
        where: {
          id: deliveryLocationId,
          userId: userId, // Ensure it belongs to the user placing the order
        }
      }).catch(() => {
        // Throw specific error if location not found or doesn't belong to user
        throw new Error(`Invalid Delivery Location ID: ${deliveryLocationId}`);
      });
      console.log(`Delivery location verification passed for ID: ${deliveryLocationId}`);

      // --- Stock Check ---
      console.log("Checking stock for items:", items);
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true, name: true }
        });
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found.`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
        }
        console.log(`Stock OK for ${product.name} (ID: ${item.productId}) - Available: ${product.stock}, Requested: ${item.quantity}`);
      }
      console.log("Stock check passed for all items.");
      // --- End Stock Check ---

      // --- Assign Available Phone Number ---
      console.log("Finding available phone number for order...");
      const availablePhone = await tx.phoneNumber.findFirst({
        where: {
          status: 'Available'
        },
        select: { id: true, numberString: true }
      });
      
      if (!availablePhone) {
        console.warn("No available phone numbers found for order creation!");
        throw new Error('No verification phone lines are currently available. Please try again later.');
      }
      
      // Mark the phone number as busy - this happens atomically within the transaction
      await tx.phoneNumber.update({
        where: { id: availablePhone.id },
        data: { status: 'Busy' }
      });
      console.log(`Marked phone number ${availablePhone.numberString} (ID: ${availablePhone.id}) as Busy for new order`);
      // --- End Phone Number Assignment ---

      // --- Create Order ---
      console.log("Creating order record...");
      const newOrder = await tx.order.create({
        data: {
          userId: userId,
          status: 'Pending Call', // Initial status
          totalAmount: totalAmount,
          deliveryLocationId: deliveryLocationId, // Link to the chosen delivery location
          latitude: location?.lat || null, // Store latitude if available
          longitude: location?.lng || null, // Store longitude if available
          assignedPhoneNumberId: availablePhone.id, // Link the assigned phone number to the order
        },
        include: { // Include necessary relationships for the WebSocket event
          deliveryLocation: {
            select: {
              name: true,
              phone: true,
              district: true
            }
          }
        }
      });
      console.log(`Order created with ID: ${newOrder.id}`);

      // --- Create OrderItems and Decrement Stock ---
      for (const item of items) {
        // Explicitly fetch the current product name to ensure it's stored correctly
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { name: true }
        });
        
        const productName = product?.name || item.name || `Product ${item.productId}`;
        
        console.log(`Creating order item for product ID: ${item.productId}, name: "${productName}", quantity: ${item.quantity}`);
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            productName: productName, // Use the explicitly fetched name
            quantity: item.quantity,
            price: item.price, // Price at time of order (from validated cart item)
          },
        });

        // Decrement stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        console.log(`Decremented stock for product ${item.productId} by ${item.quantity}`);
      }

      return newOrder; // Return the created order object
    }); // End transaction

    // Transaction successful if it reaches here
    console.log(`Order ${order.id} created successfully.`);
    
    // Process the order to include customer name for socket emission
    const processedOrder = {
      ...order,
      customerName: order.deliveryLocation?.name || 'N/A'
    };
    
    // Emit WebSocket event to notify admin clients of the new order
    if ((global as any).socketIO) {
      (global as any).socketIO.to('admin_dashboard').emit('new_order_created', processedOrder);
      console.log(`Emitted new_order_created event for order #${order.id} to admin_dashboard`);
    }
    
    res.status(201).json({
      message: "Order created successfully",
      orderId: order.id, // Return the order ID
    });

  } catch (error: any) {
    // Check for specific errors thrown from transaction
    if (error.message?.startsWith('Insufficient stock') || 
        error.message?.startsWith('Product with ID') ||
        error.message?.startsWith('Invalid Delivery Location ID')) {
       console.warn(`Order creation failed due to validation: ${error.message}`);
       res.status(400).json({ message: error.message }); // Return specific error
       return;
    }
    // Handle other errors (DB errors, etc.)
    console.error("Error creating order:", error);
    res.status(500).json({ message: 'An internal server error occurred during order creation' });
  }
});

// GET /api/orders/:id - Get an order by ID (for the authenticated user)
router.get('/:id', isUser, async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) {
      res.status(400).json({ message: "Invalid order ID" });
      return;
    }

    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "User ID not found in token" });
      return;
    }

    console.log(`Fetching order ${orderId} for user ${userId}...`);

    // Fetch the order with its items, ensure it belongs to the user
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: userId // Security check: only fetch user's own order
      },
      include: {
        items: { // Include order items
           include: { // Include product details for each item
              product: {
                 select: { name: true, images: true } // Select needed product fields
              }
           }
        },
        deliveryLocation: { // Include the delivery location details
          select: {
            name: true,
            district: true,
            phone: true,
            isDefault: true // Added isDefault field to be returned to the frontend
          }
        },
        assignedPhoneNumber: { // Include the assigned phone number
          select: {
            numberString: true
          }
        }
        // Optionally include user details if needed, but usually not required here
      }
    });

    if (!order) {
      // Return 404 if order not found OR doesn't belong to the user
      res.status(404).json({ message: "Order not found or access denied" });
      return;
    }

    console.log(`Order ${orderId} found, processing details...`);
    console.log(`Order has ${order.items?.length || 0} items`);
    console.log(`Delivery location:`, order.deliveryLocation || 'Not available');
    console.log(`Assigned phone:`, order.assignedPhoneNumber || 'Not available');

    // Map items to include necessary details
    const processedItems = order.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        productName: item.product?.name || item.productName || 'Unknown Product', // Use name from relation or stored name
        imageUrl: item.product?.images?.[0]?.url // Get first image URL from relation
    }));

    // Include the order data with processed items, delivery location, and phone number
    const responseOrder = {
        ...order,
        items: processedItems,
        verificationPhoneNumber: order.assignedPhoneNumber?.numberString || null,
        // Keep deliveryLocation as is from the query
    };

    console.log(`Returning order details with verification number: ${responseOrder.verificationPhoneNumber || 'None'}`);
    res.status(200).json(responseOrder);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "An internal server error occurred" });
  }
});

// GET /api/orders - Get all orders for the authenticated user
router.get('/', isUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "User ID not found in token" });
      return;
    }

    // Get pagination parameters from request
    const paginationParams = getPaginationParams(req);
    
    // Count total orders for pagination
    const totalOrdersCount = await prisma.order.count({
      where: { userId }
    });

    // Fetch all orders for the user, select necessary fields for list view
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { // Select only fields needed for the history list
          id: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          // Optional: include first item details if needed for UI
          items: {
              take: 1, // Take only the first item for summary display
              select: { 
                productName: true,
                productId: true
              }
          }
      },
      skip: paginationParams.skip,
      take: paginationParams.limit
    });

    // Create paginated response
    const paginatedResponse = createPaginatedResponse(orders, totalOrdersCount, paginationParams);
    
    // Return the paginated response
    res.status(200).json(paginatedResponse);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "An internal server error occurred" });
  }
});

export default router;