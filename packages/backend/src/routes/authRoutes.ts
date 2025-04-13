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
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
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
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Compare provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      // Passwords don't match
      return res.status(401).json({ message: 'Invalid credentials' });
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
    // TODO: Hash the token before storing for enhanced security

    // Calculate expiry time (1 hour from now)
    const expires = new Date(Date.now() + 3600000);

    // Update user record with token and expiry
    await prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: resetToken, 
        passwordResetExpires: expires,
      },
    });

    // Simulate email sending by logging the link
    // Use environment variable for frontend URL, default to Vite default port
    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendBaseUrl}/reset-password/${resetToken}`;
    console.log(`Password Reset Requested for ${email}. Token: ${resetToken}. Link: ${resetUrl}`);

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

    const { token, password } = validationResult.data;

    // TODO: If hashing tokens, find user by hashedToken instead
    const user = await prisma.user.findUnique({
      where: { passwordResetToken: token },
    });

    // Check if token is valid and not expired
    const isTokenInvalid = !user || !user.passwordResetExpires || user.passwordResetExpires < new Date();

    if (isTokenInvalid) {
      // Clear the invalid/expired token fields if user exists
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordResetToken: null, passwordResetExpires: null },
        }).catch(err => console.error("Error clearing expired token:", err)); 
      }
      res.status(400).json({ message: "Password reset token is invalid or has expired." });
      return; // Exit function
    }

    // Hash the new password
    const newPasswordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Update password and clear reset token fields
    await prisma.user.update({
      where: { id: user.id }, 
      data: {
        passwordHash: newPasswordHash,
        passwordResetToken: null, 
        passwordResetExpires: null, 
      },
    });

    // Send success message
    res.status(200).json({ message: "Password has been reset successfully." });
    // No return needed here

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
    // No return needed here
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

export default router; 