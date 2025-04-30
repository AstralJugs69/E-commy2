import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod'; // Import Zod for validation
import { isAdmin } from '../middleware/authMiddleware';
import { getPaginationParams, createPaginatedResponse } from '../utils/pagination';
import ethiopianCities, { City } from '../data/ethiopianCities';
import { isInEthiopia, generateCityPolygon } from '../utils/geoUtils';

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
  try {
    // Extract query parameters
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt';
    const sortOrder = typeof req.query.sortOrder === 'string' ? req.query.sortOrder.toLowerCase() : 'desc';
  const statusParam = req.query.status;
  const dateFilter = req.query.dateFilter as string | undefined; // 'today', 'all', etc.
  
    // Get pagination parameters (default limit of 15 for admin)
    const paginationParams = getPaginationParams(req, 15);
  
    // Build the where clause for filtering
    const whereClause: Prisma.OrderWhereInput = {};
  
    // Handle status filter - convert to array regardless of input type
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

    if (statusFilters.length > 0) {
      whereClause.status = {
        in: statusFilters
      };
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
    } else if (dateFilter === 'last7days') {
      const last7DaysStart = new Date();
      last7DaysStart.setDate(last7DaysStart.getDate() - 7);
      last7DaysStart.setHours(0, 0, 0, 0);
      
      whereClause.createdAt = {
        gte: last7DaysStart,
      };
    } else if (dateFilter === 'last30days') {
      const last30DaysStart = new Date();
      last30DaysStart.setDate(last30DaysStart.getDate() - 30);
      last30DaysStart.setHours(0, 0, 0, 0);
      
      whereClause.createdAt = {
        gte: last30DaysStart,
      };
    }
    
    // Add search filtering
    if (search) {
      const searchConditions: Prisma.OrderWhereInput[] = [
        { 
          user: { 
            email: { 
              contains: search, 
              mode: 'insensitive' 
            } 
          } 
        },
        { 
          deliveryLocation: { 
            name: { 
              contains: search, 
              mode: 'insensitive' 
            } 
          } 
        },
        { 
          deliveryLocation: { 
            phone: { 
              contains: search, 
              mode: 'insensitive' 
            } 
          } 
        }
      ];
      
      // Try to convert search to a number for order ID search
      try {
        const searchId = parseInt(search, 10);
        if (!isNaN(searchId)) {
          searchConditions.push({ id: searchId });
        }
      } catch (e) {
        // Ignore parsing errors - just don't add the ID condition
      }
      
      whereClause.OR = searchConditions;
    }
    
    // Define allowed sort fields
    const allowedSortFields = ['id', 'totalAmount', 'createdAt', 'status'];
    
    // Validate sortBy and sortOrder
    const validatedSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const validatedSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';
    
    // Build the orderBy clause for database-sortable fields
    const orderByClause: Prisma.OrderOrderByWithRelationInput = {};
    orderByClause[validatedSortBy as keyof Prisma.OrderOrderByWithRelationInput] = validatedSortOrder;
    
    console.log('Fetching orders with filters:', {
      search,
      sortBy: validatedSortBy,
      sortOrder: validatedSortOrder,
      status: statusFilters,
      dateFilter,
      page: paginationParams.page,
      limit: paginationParams.limit
    });

    // First, count total matching orders
    const totalOrdersCount = await prisma.order.count({
      where: whereClause
    });

    // Fetch orders from the database with minimal fields for list view
    const orders = await prisma.order.findMany({
      where: whereClause,
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
        },
        user: {
          select: {
            email: true
          }
        }
      },
      orderBy: orderByClause,
      skip: paginationParams.skip,
      take: paginationParams.limit
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
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        customerName,
        customerPhone,
        deliveryDistrict,
        userEmail: order.user?.email || ''
      };
    });

    console.log(`Found ${orders.length} orders matching filter (page ${paginationParams.page} of ${Math.ceil(totalOrdersCount / paginationParams.limit)})`);
    
    // Create standardized paginated response
    const paginatedResponse = createPaginatedResponse(processedOrders, totalOrdersCount, paginationParams);
    
    // Return the paginated response
    res.status(200).json(paginatedResponse);
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
        status: true,
        totalAmount: true,
        createdAt: true,
        updatedAt: true,
        deliveryLocation: {
          select: {
            name: true,
            phone: true,
            district: true
          }
        }
      }
    });
    
    // Process the order to include customer name for socket emission
    const processedOrder = {
      ...updatedOrder,
      customerName: updatedOrder.deliveryLocation?.name || 'N/A'
    };
    
    // Emit WebSocket event to notify clients of the status change
    if ((global as any).socketIO) {
      (global as any).socketIO.to('admin_dashboard').emit('order_status_updated', processedOrder);
      console.log(`Emitted order_status_updated event for order #${orderIdInt} to admin_dashboard`);
    }
    
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
        status: true,
        totalAmount: true,
        createdAt: true,
        updatedAt: true,
        deliveryLocation: {
          select: {
            name: true,
            phone: true,
            district: true
          }
        }
      }
    });
    
    // Process the order to include customer name for socket emission
    const processedOrder = {
      ...updatedOrder,
      customerName: updatedOrder.deliveryLocation?.name || 'N/A'
    };
    
    // Emit WebSocket event to notify clients of the status change
    if ((global as any).socketIO) {
      (global as any).socketIO.to('admin_dashboard').emit('order_status_updated', processedOrder);
      console.log(`Emitted order_status_updated event for order #${orderIdInt} to admin_dashboard`);
    }
    
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
    // Extract query parameters
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const status = typeof req.query.status === 'string' ? req.query.status : '';
    const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'id';
    const sortOrder = typeof req.query.sortOrder === 'string' ? req.query.sortOrder.toLowerCase() : 'asc';
    
    // Get pagination parameters (default limit of 15 for admin)
    const paginationParams = getPaginationParams(req, 15);
    
    // Build the where clause for filtering
    const whereClause: Prisma.PhoneNumberWhereInput = {};
    
    // Add search filter if provided
    if (search) {
      whereClause.numberString = { contains: search, mode: 'insensitive' };
    }
    
    // Add status filter if provided and valid
    const allowedStatuses = ['Available', 'Busy', 'Offline'];
    if (status && allowedStatuses.includes(status)) {
      whereClause.status = status;
    }
    
    // Build the orderBy clause for sorting
    const orderByClause: Prisma.PhoneNumberOrderByWithRelationInput = {};
    
    // Validate sortBy against allowed fields
    const allowedSortFields = ['id', 'numberString', 'status'];
    const validatedSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';
    
    // Validate sortOrder
    const validatedSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';
    
    // Set the orderBy clause dynamically
    orderByClause[validatedSortBy as keyof Prisma.PhoneNumberOrderByWithRelationInput] = validatedSortOrder;
    
    // Execute the queries in parallel for better performance
    const [totalItems, phoneNumbers] = await prisma.$transaction([
      prisma.phoneNumber.count({ where: whereClause }),
      prisma.phoneNumber.findMany({
        where: whereClause,
        select: {
          id: true,
          numberString: true,
          status: true
        },
        orderBy: orderByClause,
        skip: paginationParams.skip,
        take: paginationParams.limit
      })
    ]);
    
    // Create paginated response
    const paginatedResponse = createPaginatedResponse(phoneNumbers, totalItems, paginationParams);
    
    // Return the paginated list as JSON
    res.status(200).json(paginatedResponse);
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
    // Extract query parameters
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt';
    const sortOrder = typeof req.query.sortOrder === 'string' ? req.query.sortOrder.toLowerCase() : 'desc';
    
    // Get pagination parameters (default limit of 15 for admin)
    const paginationParams = getPaginationParams(req, 15);
    
    // Build the where clause for filtering
    const whereClause: Prisma.UserWhereInput = {};
    if (search) {
      whereClause.email = { contains: search, mode: 'insensitive' };
    }
    
    // Define allowed database sort fields
    const allowedDbSortFields = ['id', 'email', 'createdAt'];
    
    // Validate sortBy and sortOrder
    const validatedDbSortBy = allowedDbSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const validatedSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';
    
    // Build the orderBy clause for database-sortable fields
    const orderByClause: Prisma.UserOrderByWithRelationInput = {};
    orderByClause[validatedDbSortBy as keyof Prisma.UserOrderByWithRelationInput] = validatedSortOrder;
    
    // Get total count
    const totalItems = await prisma.user.count({
      where: whereClause
    });
    
    // Fetch users for the current page
    const usersForPage = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        createdAt: true,
        _count: { // Include the count of related records
          select: { orders: true } // Select the count of orders for each user
        }
        },
      orderBy: orderByClause,
      skip: paginationParams.skip,
      take: paginationParams.limit
    });
    
    // Calculate totalSpent for each user on the current page
    const usersWithTotalSpent = await Promise.all(usersForPage.map(async (user) => {
      const result = await prisma.order.aggregate({
        _sum: { totalAmount: true },
          where: {
          userId: user.id,
            status: { in: ['Verified', 'Processing', 'Shipped', 'Delivered'] }
      }
    });
    
      const totalSpent = result._sum.totalAmount ?? 0;
      return {
        ...user,
        totalSpent
      };
    }));
    
    // Sort by complex fields if necessary (post-fetch sort)
    if (sortBy === 'orderCount') {
      usersWithTotalSpent.sort((a, b) => {
        const countA = a._count?.orders ?? 0;
        const countB = b._count?.orders ?? 0;
        return sortOrder === 'asc' ? countA - countB : countB - countA;
      });
    } else if (sortBy === 'totalSpent') {
      usersWithTotalSpent.sort((a, b) => {
        return sortOrder === 'asc' ? a.totalSpent - b.totalSpent : b.totalSpent - a.totalSpent;
      });
    }
    
    // Create the standardized paginated response
    const paginatedResponse = createPaginatedResponse(usersWithTotalSpent, totalItems, paginationParams);
    
    // Return the processed user list as JSON
    res.status(200).json(paginatedResponse);
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

// GET /api/admin/cities - Search Ethiopian cities
router.get('/cities', isAdmin, async (req: Request, res: Response) => {
  try {
    const { query, limit = 10, page = 1 } = req.query;
    
    // Filter cities based on search query if provided
    let filteredCities: City[] = [...ethiopianCities];
    
    if (query && typeof query === 'string') {
      const searchTerm = query.toLowerCase();
      filteredCities = ethiopianCities.filter(city => 
        city.name.toLowerCase().includes(searchTerm) || 
        city.region.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedCities = filteredCities.slice(startIndex, endIndex);
    
    // Return paginated results with metadata
    res.status(200).json({
      cities: paginatedCities,
      total: filteredCities.length,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(filteredCities.length / Number(limit))
    });
  } catch (error) {
    console.error('Error searching cities:', error);
    res.status(500).json({ message: 'Failed to search cities' });
  }
});

// POST /api/admin/serviceareas/from-city - Create service area from city
router.post('/serviceareas/from-city', isAdmin, async (req: Request, res: Response) => {
  // Validate request body
  const schema = z.object({
    cityId: z.number().int().positive(),
    name: z.string().min(1).optional(),
    radiusKm: z.number().positive().max(50).default(5) // Default 5km, max 50km
  });
  
  const validationResult = schema.safeParse(req.body);
  if (!validationResult.success) {
    res.status(400).json({ 
      message: "Validation failed", 
      errors: validationResult.error.errors 
    });
    return;
  }
  
  const { cityId, radiusKm, name } = validationResult.data;
  
  try {
    // Find the city
    const city = ethiopianCities.find(city => city.id === cityId);
    if (!city) {
      res.status(404).json({ message: `City with ID ${cityId} not found` });
      return;
    }
    
    // Validate coordinates are in Ethiopia
    if (!isInEthiopia(city.lat, city.lng)) {
      res.status(400).json({ message: "City coordinates are outside Ethiopia's boundaries" });
      return;
    }
    
    // Generate service area name if not provided
    const serviceAreaName = name || `${city.name} Service Zone`;
    
    // Create polygon based on city coordinates and radius
    const geoJsonPolygon = generateCityPolygon(city.lat, city.lng, radiusKm);
    
    // Create service area in database
    const newServiceArea = await prisma.serviceArea.create({
      data: {
        name: serviceAreaName,
        geoJsonPolygon
      },
      select: {
        id: true,
        name: true,
        geoJsonPolygon: true
      }
    });
    
    res.status(201).json({
      ...newServiceArea,
      city: {
        id: city.id,
        name: city.name,
        lat: city.lat,
        lng: city.lng
      },
      radiusKm
    });
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      res.status(409).json({ 
        message: `Service area with this name already exists.` 
      });
      return;
    }
    console.error("Error creating city-based service area:", error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
});

export default router; 