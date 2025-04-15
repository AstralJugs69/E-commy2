import { Router, Request, Response, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { z } from 'zod';
import { isUser } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'hybrid_ecommerce_secret_key_for_development_only';
const SALT_ROUNDS = 10;

// Zod schema for password reset request
const requestResetSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

// Zod schema for resetting the password
const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: "Reset token is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // Path of error
});

// Zod schema for change password request
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters long" }),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
});

// POST /api/auth/register - Register new user
router.post('/register', (async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }
    
    // Validate password length
    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      res.status(409).json({ message: 'Email already registered' });
      return;
    }
    
    // Hash the password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash: passwordHash
      }
    });
    
    // Return success response
    res.status(201).json({ 
      message: 'User registered successfully',
      userId: newUser.id 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
}) as RequestHandler);

// POST /api/auth/login - Login user
router.post('/login', (async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    // Compare provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      // Passwords don't match
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return the token
    res.status(200).json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
}) as RequestHandler);

// POST /api/auth/request-password-reset
router.post('/request-password-reset', (async (req: Request, res: Response) => {
  const genericSuccessMessage = "If an account with that email exists, a password reset link has been sent.";

  try {
    // Validate request body
    const validationResult = requestResetSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.flatten().fieldErrors 
      });
      return; // Exit function
    }

    const { email } = validationResult.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // User not found, log and send generic success message
      console.log(`Password reset requested for non-existent email: ${email}`);
      res.status(200).json({ message: genericSuccessMessage });
      return; // Exit function
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    // Hash the token before storing
    const hashedToken = await bcrypt.hash(resetToken, SALT_ROUNDS);

    // Calculate expiry time (1 hour from now)
    const expires = new Date(Date.now() + 3600000);

    // Update user record with HASHED token and expiry
    await prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: hashedToken, // Store the HASH
        passwordResetExpires: expires,
      },
    });

    // Simulate email sending by logging the link
    // Use environment variable for frontend URL, default to Vite default port
    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const customerResetUrl = `http://localhost:3000/reset-password/${resetToken}`; // Customer FE Port - use PLAIN token in link
    const adminResetUrl = `http://localhost:5173/reset-password/${resetToken}`; // Admin FE Port - use PLAIN token in link
    
    console.log(`Password Reset Requested for ${email}. Token: ${resetToken}.`); // Log PLAIN token
    console.log(`   => Customer Link: ${customerResetUrl}`);
    console.log(`   => Admin Link: ${adminResetUrl}`);

    // Send generic success message
    res.status(200).json({ message: genericSuccessMessage });
    // No return needed here, function completes

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
    // No return needed here, function completes after sending error
  }
}) as RequestHandler); // Keep the type assertion

// POST /api/auth/reset-password
router.post('/reset-password', (async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = resetPasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.flatten().fieldErrors 
      });
      return; // Exit function
    }

    const { token: plainTokenFromRequest, password } = validationResult.data;

    // Find potential users with active reset tokens
    const potentialUsers = await prisma.user.findMany({
      where: {
        passwordResetToken: { not: null },
        passwordResetExpires: { not: null, gt: new Date() } // Check expiry
      },
      select: { id: true, passwordResetToken: true, passwordResetExpires: true } // Select needed fields
    });

    let user: { id: number; passwordResetToken: string | null; passwordResetExpires: Date | null; } | null = null;

    // Compare the provided token hash with stored hashes
    for (const potentialUser of potentialUsers) {
      if (potentialUser.passwordResetToken) {
        // Compare the PLAIN token from request with the STORED HASH
        const isTokenMatch = await bcrypt.compare(plainTokenFromRequest, potentialUser.passwordResetToken);
        if (isTokenMatch) {
          user = potentialUser; // Found the matching user
          break;
        }
      }
    }

    // If user is not found or tokens don't match
    if (!user) {
      res.status(400).json({ message: "Password reset token is invalid or has expired." });
      return;
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Update user with new password and clear reset fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Return success
    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
}) as RequestHandler);

// POST /api/auth/change-password - Change password for authenticated user
router.post('/change-password', isUser, (async (req: Request, res: Response) => {
  try {
    // Get user ID from req.user (added by isUser middleware)
    if (!req.user || !req.user.userId) {
      res.status(401).json({ message: "User not authenticated." });
      return;
    }
    const userId = req.user.userId;

    // Validate request body
    const validationResult = changePasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors
      });
      return;
    }

    const { currentPassword, newPassword } = validationResult.data;

    // Fetch user from database
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId }
    }).catch(error => {
      console.error('Error fetching user:', error);
      throw new Error('User not found');
    });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: "Incorrect current password." });
      return;
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update user record with new password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });

    // Return success response
    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
}) as RequestHandler);

// GET /api/auth/me - Get authenticated user info from token
router.get('/me', isUser, (async (req: Request, res: Response) => {
  // isUser middleware already attached user info if token was valid
  if (!req.user) {
    // This case should technically be caught by isUser, but good to double check
    res.status(401).json({ message: "User data not found in token." });
    return;
  }

  // Return only necessary, non-sensitive info from the token payload
  const userInfo = {
    id: req.user.userId,
    email: req.user.email
    // Add other safe fields from token if needed later (e.g., name if added to token)
  };

  res.status(200).json(userInfo);
}) as RequestHandler);

// GET /api/auth/validate-token - Validate token and get user info
router.get('/validate-token', isUser, (async (req: Request, res: Response) => {
  try {
    // Use user info from middleware
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(400).json({ message: 'User ID not found in token' });
      return;
    }
    
    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    });
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Return user info
    res.status(200).json(user);
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
}) as RequestHandler);

export default router; 