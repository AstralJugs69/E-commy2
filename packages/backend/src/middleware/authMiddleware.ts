import { Request, Response, NextFunction } from 'express';
// Use require instead of import for jwt to avoid transpilation issues
const jwt = require('jsonwebtoken');
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Get JWT secret with a fallback for development
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_for_dev_only';

// Interface for the JWT payload
interface UserPayload {
  userId: number;
  email: string;
  role?: string;
  exp?: number;
}

// Extend the Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

// Admin authentication middleware
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  console.log('isAdmin middleware called');
  const authHeader = req.headers.authorization;
  
  // Check if Authorization header exists and starts with 'Bearer '
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]; // Extract token
    console.log('Token found, verifying...');
    console.log('JWT_SECRET exists:', !!JWT_SECRET); // Debug
    
    try {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token verified successfully:', decoded);
      
      // Attach decoded payload to request object
      req.user = decoded as UserPayload;
      
      // TODO (Future): Check if the decoded payload corresponds to an admin user in the DB.
      // For MVP V1, just verifying the token is enough to proceed.
      next(); // Token is valid (for MVP), proceed to the route handler
    } catch (error) {
      // Token verification failed (invalid or expired)
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
  } else {
    // No token provided
    console.log('No auth token provided in request');
    res.status(401).json({ message: 'Unauthorized: Token required' });
  }
};

// User authentication middleware - identical to isAdmin for now
// Will be differentiated in future for role-based access
export const isUser = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  // Check if Authorization header exists and starts with 'Bearer '
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]; // Extract token
    
    try {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Attach decoded payload to request object
      req.user = decoded as UserPayload;
      
      next(); // Token is valid, proceed to the route handler
    } catch (error) {
      // Token verification failed (invalid or expired)
      res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
  } else {
    // No token provided
    res.status(401).json({ message: 'Unauthorized: Token required' });
  }
}; 