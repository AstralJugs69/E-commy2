import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
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

// Middleware
app.use(cors()); // Allow requests from frontend (configure origin later for security)
app.use(express.json()); // Parse JSON request bodies

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
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', addressRoutes);
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