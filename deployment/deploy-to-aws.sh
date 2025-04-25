#!/bin/bash
# AWS Deployment Script for E-Commy

set -e  # Exit on error

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "AWS credentials not configured. Please run 'aws configure' first."
    exit 1
fi

echo "===== E-Commy AWS Deployment ====="
echo "This script will help deploy the E-Commy application to AWS."

# Load environment variables from AWS env file
if [ -f "./deployment/aws-env.env" ]; then
    echo "Loading AWS configuration from aws-env.env"
    source ./deployment/aws-env.env
else
    echo "aws-env.env not found. Please create it based on aws-env-template.env"
    exit 1
fi

# Build all packages
echo "Building packages..."
npm run build:all

# Create ECR repositories if they don't exist
echo "Setting up ECR repositories..."
aws ecr describe-repositories --repository-names ecommy-backend --region $AWS_REGION || \
    aws ecr create-repository --repository-name ecommy-backend --region $AWS_REGION

aws ecr describe-repositories --repository-names ecommy-customer-frontend --region $AWS_REGION || \
    aws ecr create-repository --repository-name ecommy-customer-frontend --region $AWS_REGION

aws ecr describe-repositories --repository-names ecommy-admin-frontend --region $AWS_REGION || \
    aws ecr create-repository --repository-name ecommy-admin-frontend --region $AWS_REGION

# Login to ECR
echo "Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build and push Docker images
echo "Building and pushing Docker images..."

# Backend
echo "Processing backend..."
docker build -t ecommy-backend -f packages/backend/Dockerfile .
docker tag ecommy-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ecommy-backend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ecommy-backend:latest

# Customer Frontend
echo "Processing customer frontend..."
docker build -t ecommy-customer-frontend \
    --build-arg VITE_API_BASE_URL=$CUSTOMER_API_BASE_URL \
    -f packages/customer-frontend/Dockerfile ./packages/customer-frontend
docker tag ecommy-customer-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ecommy-customer-frontend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ecommy-customer-frontend:latest

# Admin Frontend
echo "Processing admin frontend..."
docker build -t ecommy-admin-frontend \
    --build-arg VITE_API_BASE_URL=$ADMIN_API_BASE_URL \
    -f packages/admin-frontend/Dockerfile ./packages/admin-frontend
docker tag ecommy-admin-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ecommy-admin-frontend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ecommy-admin-frontend:latest

echo "All Docker images built and pushed to ECR."
echo ""
echo "Next steps:"
echo "1. Create/update ECS task definitions using the pushed images"
echo "2. Deploy the services to ECS/Fargate"
echo "3. Set up RDS database if not already done"
echo "4. Configure application load balancer and target groups"
echo "5. Update DNS records to point to the load balancer"
echo ""
echo "For detailed instructions, see README.md in the deployment directory."

echo "Deployment preparation complete!" 