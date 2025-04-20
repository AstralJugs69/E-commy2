import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod'; // Import Zod for validation
import { isAdmin } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/admin/stats - Fetch dashboard statistics
router.get('/stats', isAdmin, async (req: Request, res: Response) => {
    console.log('GET /api/admin/stats route hit');
    try {
        const [ // Use Promise.all with prisma.$transaction for potentially better type inference
            totalOrders,
            pendingOrders,
            verifiedOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders,
            totalProducts,
            totalUsers,
            availablePhones,
            totalZones,
            revenueResult,
            ordersLast7Days
        ] = await prisma.$transaction([
            prisma.order.count(),
            prisma.order.count({ where: { status: 'Pending Call' } }),
            prisma.order.count({ where: { status: 'Verified' } }),
            prisma.order.count({ where: { status: 'Processing' } }),
            prisma.order.count({ where: { status: 'Shipped' } }),
            prisma.order.count({ where: { status: 'Delivered' } }),
            prisma.order.count({ where: { status: 'Cancelled' } }),
            prisma.product.count(),
            prisma.user.count(),
            prisma.phoneNumber.count({ where: { status: 'Available' } }),
            prisma.serviceArea.count(),
            // Calculate total revenue (excluding cancelled orders)
            prisma.order.aggregate({
                _sum: { totalAmount: true },
                where: { 
                    status: { 
                        notIn: ['Cancelled', 'Pending Call'] 
                    } 
                }
            }),
            // Count orders from the last 7 days
            prisma.order.count({
                where: {
                    createdAt: { 
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
                    }
                }
            })
        ]);

        // Fetch the latest 5 orders for dashboard display
        const recentOrders = await prisma.order.findMany({
            take: 5, // Limit to latest 5
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                status: true,
                totalAmount: true,
                createdAt: true,
                deliveryLocation: {
                    select: {
                        name: true,
                        phone: true,
                        district: true
                    }
                }
            }
        });

        // Process to extract customer name from delivery location
        const processedRecentOrders = recentOrders.map(order => {
             let customerName = '(N/A)';
             if (order.deliveryLocation) {
                  customerName = order.deliveryLocation.name || customerName;
             }
             return {
                 id: order.id,
                 customerName: customerName, // Add extracted name
                 status: order.status,
                 totalAmount: order.totalAmount,
                 createdAt: order.createdAt
             };
        });

        const stats = {
            totalOrders,
            pendingOrders,
            verifiedOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            cancelledOrders,
            totalProducts,
            totalUsers,
            availablePhones,
            totalZones,
            totalRevenue: revenueResult._sum.totalAmount ?? 0, // Handle null case
            ordersLast7Days,
            recentOrders: processedRecentOrders // Add recent orders
        };

        console.log('Admin stats fetched:', stats);
        res.status(200).json(stats);

    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ message: 'Failed to fetch dashboard statistics.' });
    }
});

// GET /api/admin/orders - Fetch all orders for admin view (now with status filter)
router.get('/orders', isAdmin, async (req: Request, res: Response) => {
  // Parse status filter - can be a single string or an array of strings
  const statusParam = req.query.status;
  const dateFilter = req.query.dateFilter as string | undefined; // 'today', 'all', etc.
  
  // Convert status parameter to array regardless of input type
  let statusFilters: string[] = [];
  
  if (statusParam) {
    if (Array.isArray(statusParam)) {
      // If it's already an array (e.g., ?status=Verified&status=Processing)
      statusFilters = statusParam.map(s => s as string).filter(s => s.trim() !== '');
    } else {
      // If it's a single string (e.g., ?status=Verified)
      const statusString = statusParam as string;
      if (statusString.trim() !== '') {
        statusFilters = [statusString.trim()];
      }
    }
  }
  
  console.log(`GET /api/admin/orders route hit. Status filters: ${statusFilters.join(', ')}, DateFilter: ${dateFilter}`);

  try {
    // Build dynamic where clause
    const whereClause: Prisma.OrderWhereInput = {}; // Initialize empty where clause

    if (statusFilters.length > 0) {
      // Add status condition if filters are provided
      whereClause.status = {
        in: statusFilters
      };
      console.log(`Applying status filters: ${statusFilters.join(', ')}`);
    }

    // Add date filtering
    if (dateFilter === 'today') {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0); // Start of today
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999); // End of today

        whereClause.createdAt = {
            gte: todayStart,
            lte: todayEnd,
        };
        console.log(`Applying date filter: today (${todayStart.toISOString()} to ${todayEnd.toISOString()})`);
    }
    // Add 'all' case or specific date range handling later if needed
    // Default behavior (if no dateFilter or dateFilter=='all') is no date filtering

    // Fetch orders from the database with relevant fields
    console.log('Fetching orders from database with where clause:', whereClause);
    const orders = await prisma.order.findMany({
      where: whereClause, // Apply the dynamic where clause
      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        deliveryLocationId: true,
        deliveryLocation: {
          select: {
            name: true,
            phone: true,
            district: true
          }
        },
        user: {
          select: {
            email: true
          }
        },
        items: {
          select: {
            id: true,
            productName: true,
            quantity: true,
            price: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc' 
      }
    });

    // Process orders to extract customer information from delivery location
    const processedOrders = orders.map(order => {
      let customerName = '(N/A)';
      let customerPhone = '';
      let deliveryDistrict = '';
      
      // Extract customer information from delivery location
      if (order.deliveryLocation) {
        customerName = order.deliveryLocation.name || customerName;
        customerPhone = order.deliveryLocation.phone || '';
        deliveryDistrict = order.deliveryLocation.district || '';
      }
      
      return {
        ...order,
        customerName,
        deliveryInfo: {
          name: customerName,
          phone: customerPhone,
          district: deliveryDistrict
        }
      };
    });

    console.log(`Found ${orders.length} orders matching filter.`);
    // Return the processed list within an object with 'orders' property
    res.status(200).json({ orders: processedOrders });
  } catch (error) {
    // Handle potential database errors
    console.error("Error fetching orders for admin:", error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

// POST & PUT /api/admin/orders/:orderId/status - Update an order's status
// Support both POST and PUT methods for backward compatibility
router.put('/orders/:orderId/status', isAdmin, async (req: Request, res: Response) => {
  // Define allowed statuses
  const allowedOrderStatuses = ["Pending Call", "Verified", "Processing", "Shipped", "Delivered", "Cancelled"];
  
  // Define validation schema using Zod
  const updateOrderStatusSchema = z.object({
    status: z.string().refine(val => allowedOrderStatuses.includes(val), {
      message: `Status must be one of: ${allowedOrderStatuses.join(', ')}`
    })
  });

  // 1. Validate orderId param (convert to int, check NaN)
  const orderIdInt = parseInt(req.params.orderId, 10);
  if (isNaN(orderIdInt)) {
    res.status(400).json({ message: 'Invalid order ID' });
    return;
  }

  // 2. Validate request body using Zod schema
  const validationResult = updateOrderStatusSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ 
      message: 'Validation failed', 
      errors: validationResult.error.errors 
    });
    return;
  }
  
  const { status: newStatus } = validationResult.data;

  try {
    // 3. Use Prisma `update` to change the status of the specified order
    const updatedOrder = await prisma.order.update({
      where: { id: orderIdInt },
      data: { status: newStatus },
      select: { // Return updated order status and ID
        id: true,
        status: true
      }
    });
    
    // 4. Return 200 OK with updated status
    res.status(200).json(updatedOrder);
  } catch (error: any) {
    // 5. Handle errors (Prisma P2025 for Not Found -> return 404, other errors -> 500)
    if (error.code === 'P2025') {
      res.status(404).json({ message: `Order with ID ${orderIdInt} not found` });
      return;
    }
    console.error(`Error updating order ${orderIdInt} status:`, error);
    res.status(500).json({ message: 'An error occurred while updating the order status' });
  }
});

// Also keep the original POST endpoint for backward compatibility
router.post('/orders/:orderId/status', isAdmin, async (req: Request, res: Response) => {
  // Define allowed statuses
  const allowedOrderStatuses = ["Pending Call", "Verified", "Processing", "Shipped", "Delivered", "Cancelled"];
  
  // Define validation schema using Zod
  const updateOrderStatusSchema = z.object({
    status: z.string().refine(val => allowedOrderStatuses.includes(val), {
      message: `Status must be one of: ${allowedOrderStatuses.join(', ')}`
    })
  });

  // 1. Validate orderId param (convert to int, check NaN)
  const orderIdInt = parseInt(req.params.orderId, 10);
  if (isNaN(orderIdInt)) {
    res.status(400).json({ message: 'Invalid order ID' });
    return;
  }

  // 2. Validate request body using Zod schema
  const validationResult = updateOrderStatusSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ 
      message: 'Validation failed', 
      errors: validationResult.error.errors 
    });
    return;
  }
  
  const { status: newStatus } = validationResult.data;

  try {
    // 3. Use Prisma `update` to change the status of the specified order
    const updatedOrder = await prisma.order.update({
      where: { id: orderIdInt },
      data: { status: newStatus },
      select: { // Return updated order status and ID
        id: true,
        status: true
      }
    });
    
    // 4. Return 200 OK with updated status
    res.status(200).json(updatedOrder);
  } catch (error: any) {
    // 5. Handle errors (Prisma P2025 for Not Found -> return 404, other errors -> 500)
    if (error.code === 'P2025') {
      res.status(404).json({ message: `Order with ID ${orderIdInt} not found` });
      return;
    }
    console.error(`Error updating order ${orderIdInt} status:`, error);
    res.status(500).json({ message: 'An error occurred while updating the order status' });
  }
});

// GET /api/admin/orders/:orderId - Fetch a single order by ID with details
router.get('/orders/:orderId', isAdmin, async (req: Request, res: Response) => {
  // 1. Validate orderId param (convert to int, check NaN)
  const orderIdInt = parseInt(req.params.orderId, 10);
  if (isNaN(orderIdInt)) {
    res.status(400).json({ message: 'Invalid order ID' });
    return;
  }

  try {
    // 2. Use Prisma to find the order with the specified ID
    const orderDetails = await prisma.order.findUnique({
      where: { id: orderIdInt },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        updatedAt: true,
        latitude: true,
        longitude: true,
        user: {
          select: { email: true }
        },
        // Include delivery location details
        deliveryLocation: {
          select: {
            name: true,
            phone: true,
            district: true
          }
        },
        // Include the items associated with this order
        items: {
          include: {
            product: {
              select: { name: true, price: true }
            }
          }
        }
      }
    });

    // 3. Handle case where order is not found
    if (!orderDetails) {
      res.status(404).json({ message: `Order with ID ${orderIdInt} not found` });
      return;
    }

    // 4. Return 200 OK with the detailed order object
    res.status(200).json(orderDetails);
  } catch (error) {
    // 5. Handle potential errors (e.g., database errors)
    console.error(`Error fetching order ${orderIdInt}:`, error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

// Zod schema for validating new phone number input
const createPhoneNumberSchema = z.object({
  numberString: z.string().min(5, { message: "Phone number seems too short" }), // Basic length check
  // status: z.enum(['Available', 'Busy', 'Offline']).optional() // Optional initial status, defaults to 'Offline' via Prisma
});

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
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

// POST /api/admin/phonenumbers - Create a new phone number
router.post('/phonenumbers', isAdmin, async (req: Request, res: Response) => {
  // Validate request body using Zod
  const validationResult = createPhoneNumberSchema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ 
      message: "Validation failed", 
      errors: validationResult.error.errors 
    });
    return;
  }

  // Extract validated data
  const validatedData = validationResult.data;

  try {
    // Use Prisma to create a new phone number
    const newPhoneNumber = await prisma.phoneNumber.create({
      data: validatedData, // Status will default to 'Offline' based on the schema default
      select: {
        id: true,
        numberString: true,
        status: true
      }
    });

    // Return the newly created phone number with 201 Created status
    res.status(201).json(newPhoneNumber);
  } catch (error: any) {
    // Handle unique constraint violation on numberString
    if (error.code === 'P2002' && error.meta?.target?.includes('numberString')) {
      res.status(409).json({ message: "This phone number already exists." });
      return;
    }
    
    // Handle other errors
    console.error("Error creating phone number:", error);
    res.status(500).json({ message: 'An internal server error occurred' });
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
    res.status(500).json({ message: 'An internal server error occurred' });
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
    res.status(500).json({ message: 'An internal server error occurred' });
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
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

// GET /api/admin/users - Fetch all users with order counts
router.get('/users', isAdmin, async (req: Request, res: Response) => {
  try {
    // Fetch users from the database with order counts and relevant orders for total spent calculation
    const usersWithAggregates = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        _count: { // Include the count of related records
          select: { orders: true } // Select the count of orders for each user
        },
        orders: { // Include orders for aggregation (only relevant fields)
          where: {
            // Define which statuses count towards "Total Spent"
            status: { in: ['Verified', 'Processing', 'Shipped', 'Delivered'] }
          },
          select: {
            totalAmount: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Manually calculate total spent for each user
    const users = usersWithAggregates.map(user => {
      const totalSpent = user.orders.reduce((sum, order) => sum + order.totalAmount, 0);
      // Return a new object without the full orders array, just the calculated total
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { orders, ...userWithoutOrders } = user; // Exclude the orders array from final response
      return {
        ...userWithoutOrders,
        totalSpent: totalSpent
      };
    });
    
    // Return the processed user list as JSON
    res.status(200).json(users);
  } catch (error) {
    // Handle potential database errors
    console.error("Error fetching users:", error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

// GET /api/admin/users/:userId - Fetch user details with order history
router.get('/users/:userId', isAdmin, async (req: Request, res: Response) => {
  // Validate userId param (convert to int, check NaN)
  const userIdInt = parseInt(req.params.userId, 10);
  if (isNaN(userIdInt)) {
    res.status(400).json({ message: 'Invalid user ID' });
    return;
  }

  try {
    // Fetch user details with their order history
    const userDetails = await prisma.user.findUnique({
      where: { id: userIdInt },
      select: {
        id: true,
        email: true,
        createdAt: true,
        orders: { // Include related orders
          select: {
            id: true,
            status: true,
            totalAmount: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }
        // Do NOT select passwordHash or reset tokens!
      }
    });

    if (!userDetails) {
      res.status(404).json({ message: `User with ID ${userIdInt} not found.` });
      return;
    }
    
    res.status(200).json(userDetails);
  } catch (error) {
    console.error(`Error fetching user ${userIdInt} details:`, error);
    res.status(500).json({ message: 'An error occurred while fetching user details' });
  }
});

// Simple test route to verify the admin routes are accessible
router.get('/test', (req: Request, res: Response) => {
  console.log('GET /api/admin/test route hit');
  res.status(200).json({ message: 'Admin routes are working' });
});

export default router; 