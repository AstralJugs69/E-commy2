import { Router, Request, Response } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { isAdmin } from '../middleware/authMiddleware'; // Protect upload
import cloudinary from '../utils/cloudinaryConfig';
import { Readable } from 'stream';

const router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();

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

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer: Buffer, options: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        // Create a readable stream from the buffer
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);
        
        // Upload stream to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
        
        stream.pipe(uploadStream);
    });
};

/**
 * @route POST /api/admin/upload
 * @description Upload multiple product images (admin only, up to 5 files), resize them, and upload to Cloudinary
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
        
        // Files upload successful - now process with sharp and upload to Cloudinary
        const files = req.files as Express.Multer.File[];
        const processedImageUrls: string[] = [];
        
        try {
            // Process each file sequentially using Promise.all
            await Promise.all(files.map(async (file) => {
                try {
                    // Process image with sharp - resize and convert to webp format
                    const processedImageBuffer = await sharp(file.buffer)
                        .resize({ width: 800, withoutEnlargement: true })
                        .webp({ quality: 80 })
                        .toBuffer();
                    
                    // Upload processed image to Cloudinary
                    const uploadResult = await uploadToCloudinary(processedImageBuffer, {
                        folder: 'e-commy/products',
                        format: 'webp',
                        resource_type: 'image'
                    });
                    
                    // Add the Cloudinary URL to processed images list
                    processedImageUrls.push(uploadResult.secure_url);
                } catch (sharpError) {
                    console.error(`Error processing image ${file.originalname}:`, sharpError);
                    // Skip problematic file, don't add to processedImageUrls
                }
            }));
            
            res.status(201).json({ 
                message: 'Files uploaded and processed successfully',
                imageUrls: processedImageUrls
            });
        } catch (processingError) {
            console.error('Error during image processing or upload:', processingError);
            res.status(500).json({ 
                message: 'Error during image processing or upload',
                error: processingError instanceof Error ? processingError.message : 'Unknown error'
            });
        }
    });
});

export default router; 