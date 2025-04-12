import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_for_dev_only'; // Use environment variable or default for development

// Auth middleware to protect admin routes
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  // Check if Authorization header exists and starts with 'Bearer '
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]; // Extract token
    try {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET);
      // TODO (Future): Check if the decoded payload corresponds to an admin user in the DB.
      // For MVP V1, just verifying the token is enough to proceed.
      // req.user = decoded; // Optional: Attach decoded payload to request object
      next(); // Token is valid (for MVP), proceed to the route handler
    } catch (error) {
      // Token verification failed (invalid or expired)
      res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
  } else {
    // No token provided
    res.status(401).json({ message: 'Unauthorized: Token required' });
  }
};

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

export default router; 