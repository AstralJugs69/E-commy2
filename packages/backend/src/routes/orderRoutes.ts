import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client'; // Import Prisma type
import { z } from 'zod';
import { isUser } from '../middleware/authMiddleware';

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

const createOrderSchema = z.object({
  items: z.array(cartItemSchema).min(1, { message: "At least one product is required" }),
  deliveryLocationId: z.number().int().positive({ message: "Valid Delivery Location ID is required" }),
  totalAmount: z.number().positive({ message: "Total amount must be positive" })
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

    const { items, deliveryLocationId, totalAmount } = validationResult.data;
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

      // --- Create Order ---
      console.log("Creating order record...");
      const newOrder = await tx.order.create({
        data: {
          userId: userId,
          status: 'Pending Call', // Initial status
          totalAmount: totalAmount,
          deliveryLocationId: deliveryLocationId, // Link to the chosen delivery location
        },
      });
      console.log(`Order created with ID: ${newOrder.id}`);

      // --- Create OrderItems and Decrement Stock ---
      for (const item of items) {
        // Fetch product again inside transaction to ensure consistency? Or trust validation?
        // Let's trust validation and use name/price from request for simplicity now.
        // const product = await tx.product.findUniqueOrThrow({ where: { id: item.productId }, select: { name: true, price: true } });

        console.log(`Creating order item for product ID: ${item.productId}, quantity: ${item.quantity}`);
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            productName: item.name || `Product ${item.productId}`, // Use name from cart or default
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
        }
        // Optionally include user details if needed, but usually not required here
      }
    });

    if (!order) {
      // Return 404 if order not found OR doesn't belong to the user
      res.status(404).json({ message: "Order not found or access denied" });
      return;
    }

    // Map items to include necessary details
    const processedItems = order.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        productName: item.product?.name || item.productName || 'Unknown Product', // Use name from relation or stored name
        imageUrl: item.product?.images?.[0]?.url // Get first image URL from relation
    }));

    // Include the order data with processed items and delivery location
    const responseOrder = {
        ...order,
        items: processedItems,
        // Keep deliveryLocation as is from the query
    };

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
      }
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "An internal server error occurred" });
  }
});

// GET /api/orders/assign-number/:orderId - Assign a phone number to an order
router.get('/assign-number/:orderId', isUser, async (req: Request, res: Response) => {
  // 1. Extract and validate orderId from route parameters
  const { orderId } = req.params;
  const orderIdInt = parseInt(orderId, 10);
  if (isNaN(orderIdInt)) {
    res.status(400).json({ message: 'Invalid Order ID format.' });
    return;
  }

  // 2. Extract userId from JWT payload (attached by isUser middleware)
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: "User ID not found in token" });
    return;
  }

  try {
    // 3. Verify the order exists, belongs to the user, and is 'Pending Call'
    const order = await prisma.order.findUnique({
      where: {
        id: orderIdInt,
        // Ensure the order belongs to the authenticated user
        userId: userId,
      },
      select: { status: true, userId: true } // Select status for verification
    });

    if (!order) {
      // Use 404 to indicate not found or not belonging to user
      res.status(404).json({ message: 'Order not found or does not belong to user.' });
      return;
    }
    // Allow fetching number even if status moved past Pending Call,
    // but log if status is unexpected. Assignment should only happen once ideally.
    if (order.status !== 'Pending Call') {
       console.warn(`Assign number called for order ${orderIdInt} with status ${order.status}.`);
       // Allow proceeding for now, maybe number was already assigned.
       // return res.status(409).json({ message: `Order status is '${order.status}', not 'Pending Call'. Cannot assign number.` }); // 409 Conflict
    }

    // 4. Find the first available phone number
    // Simple strategy: Find the first one marked 'Available'.
    const availablePhone = await prisma.phoneNumber.findFirst({
      where: {
        status: 'Available'
      },
      select: { id: true, numberString: true }
    });

    // 5. Handle case where no phone number is available
    if (!availablePhone) {
      console.warn("No available phone numbers found for order ID:", orderIdInt);
      // Return 503 Service Unavailable
      res.status(503).json({ message: 'No verification phone lines are currently available. Please try again later.' });
      return;
    }

    // 6. Mark the phone number as busy (Consider if this should only happen once)
    // To prevent re-assigning/marking busy repeatedly, check if a number was already assigned
    // For now, we proceed with marking busy - needs refinement if called multiple times.
    await prisma.phoneNumber.update({
      where: { id: availablePhone.id },
      data: { status: 'Busy' }
    });
    console.log(`Marked phone number ${availablePhone.numberString} as Busy for order ${orderIdInt}`);

    // 7. Return the assigned phone number string
    res.status(200).json({ verificationPhoneNumber: availablePhone.numberString });

  } catch (error) {
    console.error(`Error assigning phone number for order ID ${orderIdInt}:`, error);
    res.status(500).json({ message: 'Error assigning verification phone number' });
  }
});

export default router;