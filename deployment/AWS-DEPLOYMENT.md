# AWS Deployment Guide for E-Commy

This guide explains how to deploy the E-Commy application to AWS using ECS, ECR, RDS, and other AWS services.

## Prerequisites

- AWS account with appropriate permissions
- AWS CLI installed and configured
- Docker installed and running
- Node.js and npm installed

## Step 1: Prepare AWS Environment

1. **Configure AWS CLI**:
   ```bash
   aws configure
   ```

2. **Create an AWS Environment File**:
   - Copy the template file: `cp aws-env-template.env aws-env.env`
   - Update the values in `aws-env.env` with your AWS-specific configuration
   - Add the following variables to the file:
     ```
     AWS_REGION=us-east-1
     AWS_ACCOUNT_ID=your-account-id
     CUSTOMER_API_BASE_URL=https://api.your-domain.com/api
     ADMIN_API_BASE_URL=https://api.your-domain.com/api
     ```

## Step 2: Set Up Database

1. **Create RDS PostgreSQL Instance**:
   - Use AWS RDS to create a PostgreSQL instance
   - Configure security groups to allow connections from your ECS services
   - Update the `DATABASE_URL` in your `aws-env.env` file with the RDS endpoint

2. **Run Database Migrations**:
   ```bash
   # This will be done automatically during backend deployment
   # The start script in the Dockerfile runs prisma migrate deploy
   ```

## Step 3: Deploy Docker Images

1. **Set Up ECR Repositories**:
   - Create repositories for each service:
     - `ecommy-backend`
     - `ecommy-customer-frontend`
     - `ecommy-admin-frontend`

2. **Build and Push Images**:
   - Use the provided deployment script:
     ```bash
     chmod +x ./deployment/deploy-to-aws.sh
     ./deployment/deploy-to-aws.sh
     ```

## Step 4: Configure ECS

1. **Create ECS Cluster**:
   - Create a cluster using Fargate launch type

2. **Define Task Definitions**:
   - Create a task definition for each service
   - Backend task should include environment variables from `aws-env.env`
   - Frontend tasks should set `VITE_API_BASE_URL` to point to your API endpoint

3. **Create ECS Services**:
   - Create a service for each task definition
   - Configure networking and load balancing
   - Set up auto-scaling as needed

## Step 5: Set Up Load Balancing

1. **Create Application Load Balancer**:
   - Set up an ALB to distribute traffic
   - Configure target groups for each service
   - Set up SSL certificates for secure connections

2. **Configure DNS**:
   - Create DNS records pointing to your load balancer
   - Use separate subdomains for:
     - Customer frontend (e.g., store.your-domain.com)
     - Admin frontend (e.g., admin.your-domain.com)
     - API backend (e.g., api.your-domain.com)

## Step 6: Monitoring and Maintenance

1. **Set Up CloudWatch Alarms**:
   - Monitor CPU, memory usage, and request latency
   - Set up alarms for error rates and other metrics

2. **Configure Logs**:
   - Set up CloudWatch Logs for centralized logging
   - Create log groups for each service

3. **Update Deployments**:
   - To update the application, rebuild and push Docker images
   - Update the ECS services to use the latest images

## Troubleshooting

### Common Issues and Solutions

1. **CORS Errors**:
   - Ensure `CORS_ORIGIN` in environment variables includes all frontend domains
   - Check that frontend is using the correct API base URL

2. **Database Connection Issues**:
   - Verify security group allows traffic from ECS tasks
   - Check `DATABASE_URL` format is correct

3. **Frontend Cannot Reach Backend**:
   - Confirm API URLs are correctly set in environment variables
   - Check load balancer and target group health checks

## Security Best Practices

1. **Use Secret Manager** for sensitive environment variables
2. **Enable WAF** on your load balancer
3. **Implement VPC isolation** for your services
4. **Rotate credentials** regularly

## Cleanup

To avoid unexpected AWS charges, remember to delete resources when they're no longer needed:

```bash
# Delete ECS services and tasks
aws ecs delete-service --cluster your-cluster --service your-service --force

# Delete ECR repositories (this will delete all images too)
aws ecr delete-repository --repository-name ecommy-backend --force
aws ecr delete-repository --repository-name ecommy-customer-frontend --force
aws ecr delete-repository --repository-name ecommy-admin-frontend --force

# Delete RDS instance (be careful, this will delete your database)
aws rds delete-db-instance --db-instance-identifier your-db-identifier --skip-final-snapshot
``` 