import { Router, Request, Response, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { isAdmin } from '../middleware/authMiddleware';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Zod schema for date parameters validation
const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/**
 * @route GET /api/admin/reports/sales-over-time
 * @description Get aggregated sales data over a period
 * @access Admin only
 */
router.get('/sales-over-time', isAdmin, (async (req: Request, res: Response) => {
  try {
    // Parse and validate query parameters
    const validationResult = dateRangeSchema.safeParse(req.query);
    
    if (!validationResult.success) {
      res.status(400).json({
        message: 'Invalid date parameters',
        errors: validationResult.error.flatten().fieldErrors,
      });
      return;
    }
    
    // Extract parameters with defaults
    let { startDate, endDate } = validationResult.data;
    
    // Default to last 30 days if dates not provided
    const endDateObj = endDate ? new Date(endDate) : new Date();
    const startDateObj = startDate 
      ? new Date(startDate) 
      : new Date(endDateObj.getTime() - 30 * 24 * 60 * 60 * 1000);
      
    // Validate dates are parseable
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      res.status(400).json({
        message: 'Invalid date format. Please use ISO date string (YYYY-MM-DD).',
      });
      return;
    }
    
    // Using raw SQL for date grouping since Prisma doesn't directly support date truncation
    const salesData = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', "createdAt")::date as date,
        SUM("totalAmount") as "totalSales"
      FROM "Order"
      WHERE 
        "createdAt" >= ${startDateObj} AND 
        "createdAt" <= ${endDateObj} AND
        "status" NOT IN ('Cancelled')
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date ASC
    `;
    
    // Convert BigInt values to regular numbers for JSON serialization
    const serializedData = (salesData as any[]).map(item => ({
      date: item.date,
      totalSales: typeof item.totalSales === 'bigint' ? Number(item.totalSales) : item.totalSales
    }));
    
    res.status(200).json(serializedData);
  } catch (error) {
    console.error('Error fetching sales data:', error);
    res.status(500).json({ message: 'An error occurred while generating the sales report.' });
  }
}) as RequestHandler);

/**
 * @route GET /api/admin/reports/users-over-time
 * @description Get new user registration data over a period
 * @access Admin only
 */
router.get('/users-over-time', isAdmin, (async (req: Request, res: Response) => {
  try {
    // Parse and validate query parameters
    const validationResult = dateRangeSchema.safeParse(req.query);
    
    if (!validationResult.success) {
      res.status(400).json({
        message: 'Invalid date parameters',
        errors: validationResult.error.flatten().fieldErrors,
      });
      return;
    }
    
    // Extract parameters with defaults
    let { startDate, endDate } = validationResult.data;
    
    // Default to last 30 days if dates not provided
    const endDateObj = endDate ? new Date(endDate) : new Date();
    const startDateObj = startDate 
      ? new Date(startDate) 
      : new Date(endDateObj.getTime() - 30 * 24 * 60 * 60 * 1000);
      
    // Validate dates are parseable
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      res.status(400).json({
        message: 'Invalid date format. Please use ISO date string (YYYY-MM-DD).',
      });
      return;
    }
    
    console.log('Fetching user data with date range:', {
      startDate: startDateObj.toISOString(),
      endDate: endDateObj.toISOString()
    });
    
    // Simpler approach: Just count users per day directly with SQL
    try {
      const userData = await prisma.$queryRaw`
        WITH days AS (
          SELECT d::date as date
          FROM generate_series(
            ${startDateObj}::date, 
            ${endDateObj}::date, 
            '1 day'::interval
          ) d
        ),
        user_counts AS (
          SELECT 
            DATE_TRUNC('day', "createdAt")::date as date,
            COUNT(*) as count
          FROM "User"
          WHERE 
            "createdAt" >= ${startDateObj} AND 
            "createdAt" <= ${endDateObj}
          GROUP BY DATE_TRUNC('day', "createdAt")
        )
        SELECT 
          days.date,
          COALESCE(user_counts.count, 0) as "newUsers"
        FROM 
          days
        LEFT JOIN 
          user_counts ON days.date = user_counts.date
        ORDER BY 
          days.date
      `;
      
      // Convert any BigInt values to regular numbers for JSON serialization
      const serializedData = (userData as any[]).map(item => ({
        date: item.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        newUsers: typeof item.newUsers === 'bigint' ? Number(item.newUsers) : item.newUsers
      }));
      
      console.log('Returning user data with', serializedData.length, 'entries');
      res.status(200).json(serializedData);
    } catch (queryError) {
      console.error('Database query error:', queryError);
      res.status(500).json({ 
        message: 'Database query error', 
        error: queryError instanceof Error ? queryError.message : String(queryError)
      });
    }
  } catch (error) {
    console.error('Error fetching user registration data:', error);
    res.status(500).json({ 
      message: 'An error occurred while generating the user report.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}) as RequestHandler);

export default router; 