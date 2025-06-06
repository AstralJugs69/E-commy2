# E-Commy: Hybrid E-commerce Platform

A full-stack e-commerce platform with dedicated customer and admin interfaces.

## Live URLs
- Customer storefront: https://hybrid-store-customer.onrender.com
- Admin dashboard: https://hybrid-store-admin.onrender.com
- Backend API: https://hybrid-store-api.onrender.com

## Architecture

E-Commy is a monorepo with the following packages:
- `packages/backend`: Node.js/Express API with PostgreSQL database
- `packages/admin-frontend`: React admin dashboard 
- `packages/customer-frontend`: React customer storefront
- `packages/common`: Shared utilities and types

## Features

- Customer purchasing experience
- Admin product and order management
- Image uploads via Cloudinary
- Responsive design for mobile and desktop
- Containerized deployment

## Local Development

```bash
# Install dependencies
npm install

# Start backend
npm run dev:backend

# Start admin frontend
npm run dev:admin

# Start customer frontend
npm run dev:customer
```

## Docker Deployment

The entire application can be deployed using Docker Compose:

```bash
# Start all services
docker-compose up -d

# Access the applications at:
# - Customer frontend: http://localhost:3010
# - Admin frontend: http://localhost:3011
# - Backend API: http://localhost:10000
```

### Prerequisites for Docker deployment:
1. Docker and Docker Compose installed
2. Cloudinary account with API credentials
3. Environment variables set (see each package README)

## Environment Variables

Create a `.env` file in the project root with the following:

```
# Cloudinary (required for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

hsLH9vGtaV2ypFk

postgresql://postgres:hsLH9vGtaV2ypFk@ecommy-db-instance.c9cwsekeck95.me-south-1.rds.amazonaws.com:5432/ecommydb

ecommy-db-instance.c9cwsekeck95.me-south-1.rds.amazonaws.com

Private IPv4 addresses
172.31.8.213

Private IPv4 addresses
172.31.8.213

aws ecr get-login-password --region me-south-1 | docker login --username AWS --password-stdin 248662838699.dkr.ecr.me-south-1.amazonaws.com

docker pull 248662838699.dkr.ecr.me-south-1.amazonaws.com/ecommy-backend:latest

docker run -d \
  --name ecommy-backend-container \
  --restart always \
  -p 80:10000 \
  -e PORT="10000" \
  -e DATABASE_URL="postgresql://postgres:hsLH9vGtaV2ypFk@ecommy-db-instance.c9cwsekeck95.me-south-1.rds.amazonaws.com:5432/ecommydb" \
  -e JWT_SECRET="1606bfbe28f2585577212803a358b8c73fd7f8a70bc35a93f024ea9d35298123f7c0dde1a53ad016d7269f30ed46553022f18a829bc1886ce29657b485688411c79d8bbcd2342daf39a34349fb2b0e043794f618ace0ebd3b414070dabe43efdae93df82b6d198f90ef6d7ef98230cab6eefd9d065205e180354472cc2834c2f88167692987ffe9420f36eccd63b6c1b3432e6aee12857fea9b98cad5ffb3660f81c0b560e5bd0a22bc30086620a5c7f42086704ff6f91c278c79e3bfcd7ac97566db9108f6448c3764fcc4cd1e48b9d325c1b68f675269c364c677db2c3b8f92de0c4d8e09a950d968b308303c31f3947751936df768a7a5b0f4e6257dbb491" \
  -e CLOUDINARY_CLOUD_NAME="dco9dq5a4" \
  -e CLOUDINARY_API_KEY="161735482649165" \
  -e CLOUDINARY_API_SECRET="uwmsnm63pkG3DLEnnfVljbgqL2A" \
  -e CUSTOMER_FRONTEND_URL="https://feature-precise-location-gps.d1c66h619ubhru.amplifyapp.com/" \
  -e ADMIN_FRONTEND_URL="https://feature-precise-location-gps.d1fqnw9ylp7qr3.amplifyapp.com/" \
  -e CORS_ORIGIN="https://feature-precise-location-gps.d1c66h619ubhru.amplifyapp.com/ https://feature-precise-location-gps.d1fqnw9ylp7qr3.amplifyapp.com/" \
  -e NODE_ENV="production" \
  -e NODE_OPTIONS="--max-old-space-size=512"\
  248662838699.dkr.ecr.me-south-1.amazonaws.com/ecommy-backend:latest


http://YOUR_EC2_PUBLIC_IP/api

  JWT secret:1606bfbe28f2585577212803a358b8c73fd7f8a70bc35a93f024ea9d35298123f7c0dde1a53ad016d7269f30ed46553022f18a829bc1886ce29657b485688411c79d8bbcd2342daf39a34349fb2b0e043794f618ace0ebd3b414070dabe43efdae93df82b6d198f90ef6d7ef98230cab6eefd9d065205e180354472cc2834c2f88167692987ffe9420f36eccd63b6c1b3432e6aee12857fea9b98cad5ffb3660f81c0b560e5bd0a22bc30086620a5c7f42086704ff6f91c278c79e3bfcd7ac97566db9108f6448c3764fcc4cd1e48b9d325c1b68f675269c364c677db2c3b8f92de0c4d8e09a950d968b308303c31f3947751936df768a7a5b0f4e6257dbb491





  postgresql://postgres:hsLH9vGtaV2ypFk@e-commydb.cr8kgk4qwd5a.eu-central-1.rds.amazonaws.com:5432/ecommydb?sslmode=require