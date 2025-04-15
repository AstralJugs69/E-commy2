import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { isAdmin } from '../middleware/authMiddleware'; // Protect upload

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req: any, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
        cb(null, uploadsDir);
    },
    filename: function (req: any, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
        // Generate a unique filename with timestamp and original extension
        const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniquePrefix + ext);
    }
});

// File filter to only allow specific image types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept only images
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.'));
    }
};

// Initialize multer upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
    fileFilter: fileFilter
});

/**
 * @route POST /api/admin/upload
 * @description Upload a file (admin only)
 * @access Admin
 */
router.post('/', isAdmin, (req: Request, res: Response) => {
    // Handle file upload with manually typed callback
    upload.single('productImage')(req as any, res as any, (err: any) => {
        if (err) {
            let errorMessage = 'File upload failed.';
            
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading
                if (err.code === 'LIMIT_FILE_SIZE') {
                    errorMessage = 'File too large. Maximum file size is 5MB.';
                }
            } else {
                // A different error occurred
                errorMessage = err.message;
            }
            
            res.status(400).json({ message: errorMessage });
            return;
        }
        
        // No file was uploaded
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded. Please select a file.' });
            return;
        }
        
        // File upload successful
        const relativeUrl = `/uploads/${req.file.filename}`; // Path relative to the 'public' dir
        res.status(201).json({ 
            message: 'File uploaded successfully',
            imageUrl: relativeUrl
        });
    });
});

export default router; 