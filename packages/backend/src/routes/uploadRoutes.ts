import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
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
 * @description Upload multiple product images (admin only, up to 5 files), resize them, and convert to WebP
 * @access Admin
 */
router.post('/', isAdmin, (req: Request, res: Response) => {
    // Handle multiple file uploads with manually typed callback
    upload.array('productImages', 5)(req as any, res as any, async (err: any) => {
        if (err) {
            let errorMessage = 'File upload failed.';
            
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading
                if (err.code === 'LIMIT_FILE_SIZE') {
                    errorMessage = 'File too large. Maximum file size is 5MB.';
                } else if (err.code === 'LIMIT_FILE_COUNT') {
                    errorMessage = 'Too many files. Maximum is 5 files.';
                }
            } else {
                // A different error occurred
                errorMessage = err.message;
            }
            
            res.status(400).json({ message: errorMessage });
            return;
        }
        
        // No files were uploaded
        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
            res.status(400).json({ message: 'No files uploaded. Please select at least one file.' });
            return;
        }
        
        // Files upload successful - now process with sharp
        const files = req.files as Express.Multer.File[];
        const processedImageUrls: string[] = [];
        
        try {
            // Process each file sequentially using Promise.all
            await Promise.all(files.map(async (file) => {
                try {
                    // Define WebP output path
                    const fileNameWithoutExt = file.filename.replace(/\.[^/.]+$/, "");
                    const outputFileName = `${fileNameWithoutExt}.webp`;
                    const outputFilePath = path.join(uploadsDir, outputFileName);
                    
                    // Process image with sharp - resize and convert to WebP
                    await sharp(file.path)
                        .resize({ width: 800, withoutEnlargement: true })
                        .webp({ quality: 80 })
                        .toFile(outputFilePath);
                    
                    // Add to processed images list
                    processedImageUrls.push(`/uploads/${outputFileName}`);
                    
                    // Delete original file
                    fs.unlinkSync(file.path);
                } catch (sharpError) {
                    console.error(`Error processing image ${file.filename}:`, sharpError);
                    // Skip problematic file, don't add to processedImageUrls
                }
            }));
            
            res.status(201).json({ 
                message: 'Files uploaded and processed successfully',
                imageUrls: processedImageUrls
            });
        } catch (processingError) {
            console.error('Error during image processing:', processingError);
            res.status(500).json({ 
                message: 'Error during image processing',
                error: processingError instanceof Error ? processingError.message : 'Unknown error'
            });
        }
    });
});

export default router; 