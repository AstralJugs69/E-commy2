# E-Commy Backend

## Environment Setup

Create a `.env` file in the packages/backend directory with the following variables:

```
# Database connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce"

# Cloudinary configuration
CLOUDINARY_CLOUD_NAME=dco9dq5a4
CLOUDINARY_API_KEY=116735482649165
CLOUDINARY_API_SECRET=uwmsnm63pkG3DLEnnfVljbgqL2A

# Server settings
PORT=3001
JWT_SECRET=yoursecretkey

# Frontend URLs (for CORS)
ADMIN_FRONTEND_URL=http://localhost:5173
CUSTOMER_FRONTEND_URL=http://localhost:3000
```

## Image Upload Changes

The backend now uses Cloudinary for image storage instead of local file storage. Key changes:

1. Images are uploaded directly to Cloudinary after processing with Sharp
2. All image URLs in the database are now complete Cloudinary URLs
3. No more local file storage for images in the public/uploads directory

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Production

```bash
# Build for production
npm run build

# Start production server
npm start
``` 