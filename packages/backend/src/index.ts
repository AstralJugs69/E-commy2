import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { rateLimit } from 'express-rate-limit';
import compression from 'compression';
import productRoutes from './routes/productRoutes';
import adminRoutes from './routes/adminRoutes';
import productAdminRoutes from './routes/productAdminRoutes';
import orderRoutes from './routes/orderRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import categoryAdminRoutes from './routes/categoryAdminRoutes';
import categoryRoutes from './routes/categoryRoutes';
import uploadRoutes from './routes/uploadRoutes';
import reviewRoutes from './routes/reviewRoutes';
import reportsAdminRoutes from './routes/reportsAdminRoutes';
import cartRoutes from './routes/cartRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import addressRoutes from './routes/addressRoutes';
import districtRoutes from './routes/districtRoutes';

dotenv.config(); // Load .env file variables

const app = express();
const port = process.env.PORT || 3001; // Use port from .env or default to 3001

// Rate limiting middleware
// General API rate limiter - 50 requests per 40 seconds
const generalLimiter = rateLimit({
  windowMs: 40 * 1000, // 40 seconds
  max: 50, // Limit each IP to 50 requests per windowMs
  message: 'Too many requests from this IP, please try again after 40 seconds',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Write operations rate limiter - 20 requests per 40 seconds
const writeLimiter = rateLimit({
  windowMs: 40 * 1000, // 40 seconds
  max: 20, // Limit each IP to 20 requests per windowMs
  message: 'Too many write operations from this IP, please try again after 40 seconds',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors()); // Allow requests from frontend (configure origin later for security)
app.use(express.json()); // Parse JSON request bodies
app.use(compression()); // Apply compression middleware to all routes

// Apply general rate limiter to all requests
app.use(generalLimiter);

// Serve Static Files
app.use(express.static(path.join(__dirname, '..', 'public')));
// Example: A file at public/uploads/image.jpg will be accessible via http://localhost:3001/uploads/image.jpg

// Basic Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Hybrid E-commerce Backend API is running!');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/products', productAdminRoutes);
app.use('/api/admin/categories', categoryAdminRoutes);
app.use('/api/admin/upload', uploadRoutes);
app.use('/api/admin/reports', reportsAdminRoutes);
app.use('/api/orders', writeLimiter, orderRoutes);
app.use('/api/reviews', writeLimiter, reviewRoutes);
app.use('/api/cart', writeLimiter, cartRoutes);
app.use('/api/wishlist', writeLimiter, wishlistRoutes);
app.use('/api/addresses', writeLimiter, addressRoutes);
app.use('/api/districts', districtRoutes);

// Start Server
const server = app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
}).on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${port} is already in use. Trying alternative port...`);
    // Try an alternative port by incrementing the current port
    const alternativePort = Number(port) + 1;
    app.listen(alternativePort, () => {
      console.log(`Backend server listening on alternative port http://localhost:${alternativePort}`);
    });
  } else {
    console.error('Server error:', err.message);
  }
}); 