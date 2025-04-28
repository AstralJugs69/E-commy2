# E-Commy Backend

## Environment Setup

Create a `.env` file in the packages/backend directory with the following variables:

```
# Database connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce"

# Cloudinary configuration (required for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server settings
PORT=3001
JWT_SECRET=yoursecretkey

# Frontend URLs (for CORS)
ADMIN_FRONTEND_URL=http://localhost:5173
CUSTOMER_FRONTEND_URL=http://localhost:3000
```

## Image Upload System

The backend uses Cloudinary for image storage with the following features:

1. Images are processed with Sharp for resizing and conversion to WebP format
2. Processed images are uploaded directly to Cloudinary
3. All image URLs in the database are now complete Cloudinary URLs
4. No local file storage is used for images

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

## Docker

The backend can run as a containerized service with:

```bash
# Build the container
docker build -t ecommy-backend .

# Run the container
docker run -p 10000:10000 --env-file .env ecommy-backend
```

For a complete deployment with database and frontends, use:

```bash
# From the project root
docker-compose up -d
``` 