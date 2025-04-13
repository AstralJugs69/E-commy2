import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import productRoutes from './routes/productRoutes';
import adminRoutes from './routes/adminRoutes';
import productAdminRoutes from './routes/productAdminRoutes';
import orderRoutes from './routes/orderRoutes';
import authRoutes from './routes/authRoutes';
import categoryAdminRoutes from './routes/categoryAdminRoutes';
import categoryRoutes from './routes/categoryRoutes';
import uploadRoutes from './routes/uploadRoutes';

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
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/products', productAdminRoutes);
app.use('/api/admin/categories', categoryAdminRoutes);
app.use('/api/admin/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);

// Start Server
app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
}); 