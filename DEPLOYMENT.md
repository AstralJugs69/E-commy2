# E-commy Deployment Guide

This guide explains how to build and deploy the E-commy application using Docker and push the images to a container registry.

## Prerequisites

- Docker Desktop installed and running
- Git repository cloned
- Node.js and npm installed
- Access to a container registry (e.g., Docker Hub, AWS ECR, GitHub Container Registry)

## Build and Deploy Process

### 1. Start Docker Desktop

Make sure Docker Desktop is running on your machine. You can check the status with:

```powershell
Get-Service -Name com.docker.service
```

If it shows "Stopped", start Docker Desktop application from your Start menu.

### 2. Build the Packages

First, build all the packages:

```bash
npm run build
```

### 3. Build Docker Images

Build all the Docker images defined in the docker-compose.yml:

```bash
docker-compose build
```

This will build:
- `ecommy-backend` - The Node.js backend service
- `ecommy-customer` - The React customer frontend
- `ecommy-admin` - The React admin frontend

### 4. Test Locally (Optional)

Run the containers locally to make sure everything works:

```bash
docker-compose up -d
```

Access the services:
- Customer frontend: http://localhost:3010
- Admin frontend: http://localhost:3011
- Backend API: http://localhost:10000

### 5. Push Images to Container Registry

#### For Docker Hub

```bash
# Login to Docker Hub
docker login

# Tag images
docker tag ecommy-backend:latest yourusername/ecommy-backend:latest
docker tag ecommy-customer:latest yourusername/ecommy-customer:latest 
docker tag ecommy-admin:latest yourusername/ecommy-admin:latest

# Push images
docker push yourusername/ecommy-backend:latest
docker push yourusername/ecommy-customer:latest
docker push yourusername/ecommy-admin:latest
```

#### For AWS ECR

```bash
# Login to ECR
aws ecr get-login-password --region your-region | docker login --username AWS --password-stdin your-account-id.dkr.ecr.your-region.amazonaws.com

# Create repositories if they don't exist
aws ecr create-repository --repository-name ecommy-backend --region your-region
aws ecr create-repository --repository-name ecommy-customer --region your-region
aws ecr create-repository --repository-name ecommy-admin --region your-region

# Tag images
docker tag ecommy-backend:latest your-account-id.dkr.ecr.your-region.amazonaws.com/ecommy-backend:latest
docker tag ecommy-customer:latest your-account-id.dkr.ecr.your-region.amazonaws.com/ecommy-customer:latest
docker tag ecommy-admin:latest your-account-id.dkr.ecr.your-region.amazonaws.com/ecommy-admin:latest

# Push images
docker push your-account-id.dkr.ecr.your-region.amazonaws.com/ecommy-backend:latest
docker push your-account-id.dkr.ecr.your-region.amazonaws.com/ecommy-customer:latest
docker push your-account-id.dkr.ecr.your-region.amazonaws.com/ecommy-admin:latest
```

#### Using the Deployment Script

For AWS deployment, you can use the provided script:

```bash
# Make sure to configure aws-env.env file first
cp deployment/aws-env-template.env deployment/aws-env.env
# Edit the aws-env.env file with your settings

# Run the deployment script
bash deployment/deploy-to-aws.sh
```

## Environment Variables

Make sure to set up the necessary environment variables for production:

1. For backend:
   - `DATABASE_URL` - The PostgreSQL database connection string
   - `JWT_SECRET` - Secret key for JWT token generation
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - Cloudinary credentials
   - `ADMIN_FRONTEND_URL`, `CUSTOMER_FRONTEND_URL` - URLs for the frontend applications

2. For frontends:
   - `VITE_API_BASE_URL` - The URL of the backend API

## Deployment Considerations

- Use a managed database service like AWS RDS for PostgreSQL in production
- Set up a load balancer for your containers
- Configure SSL certificates for HTTPS
- Set up proper monitoring and logging
- Consider using container orchestration like Kubernetes or AWS ECS for production deployments

## Troubleshooting

If you encounter any issues:

1. Check if Docker is running
2. Verify network connectivity to container registries
3. Check environment variables are correctly set
4. Review logs with `docker-compose logs` 