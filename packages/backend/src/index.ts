import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config(); // Load .env file variables

const app = express();
const port = process.env.PORT || 3001; // Use port from .env or default to 3001

// Middleware
app.use(cors()); // Allow requests from frontend (configure origin later for security)
app.use(express.json()); // Parse JSON request bodies

// Basic Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Hybrid E-commerce Backend API is running!');
});

// --- Placeholder for future API routes ---
// app.use('/api/auth', authRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/admin', adminRoutes);

// Start Server
app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
}); 