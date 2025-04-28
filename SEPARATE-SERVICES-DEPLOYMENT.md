# Deploying E-commy Services Separately on Railway

This guide explains how to deploy each part of the E-commy application as a separate service on Railway, using individual root directories for each service.

## Prerequisites

- A Railway account (https://railway.app)
- Git repository with your E-commy project

## Step 1: Add PostgreSQL Database Service

1. In the Railway dashboard, create a new project
2. Click "New" → "Database" → "PostgreSQL"
3. Wait for the database to provision
4. Click on the database service to get the connection string (from the "Connect" tab)

## Step 2: Deploy the Backend Service

1. In your Railway project, click "New" → "GitHub Repo"
2. Select your repository
3. Configure the deployment:
   - Set the root directory to `packages/backend`
   - Select "Dockerfile" as deployment method
   - Leave the Dockerfile path as `Dockerfile` (since we're in the backend package)

4. Add environment variables to the backend service:
   ```
   DATABASE_URL=<copy-from-postgresql-service>
   JWT_SECRET=<your-secure-jwt-secret>
   PORT=10000
   CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
   CLOUDINARY_API_KEY=<your-cloudinary-api-key>
   CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
   ```

5. Click "Deploy" and wait for the build to complete
6. Once deployed, note the service URL for use in frontend services

## Step 3: Deploy the Customer Frontend Service

1. In your Railway project, click "New" → "GitHub Repo"
2. Select your repository
3. Configure the deployment:
   - Set the root directory to `packages/customer-frontend`
   - Select "Dockerfile" as deployment method
   - Leave the Dockerfile path as `Dockerfile`

4. Add environment variable:
   ```
   VITE_API_BASE_URL=<your-backend-service-url>/api
   ```

5. Click "Deploy" and wait for the build to complete

## Step 4: Deploy the Admin Frontend Service

1. In your Railway project, click "New" → "GitHub Repo"
2. Select your repository
3. Configure the deployment:
   - Set the root directory to `packages/admin-frontend`
   - Select "Dockerfile" as deployment method
   - Leave the Dockerfile path as `Dockerfile`

4. Add environment variable:
   ```
   VITE_API_BASE_URL=<your-backend-service-url>/api
   ```

5. Click "Deploy" and wait for the build to complete

## Step 5: Configure CORS in Backend

After deploying the frontend services, add their URLs to the backend's CORS settings:

1. Go to the backend service in Railway
2. Add these environment variables:
   ```
   CUSTOMER_FRONTEND_URL=<your-customer-frontend-service-url>
   ADMIN_FRONTEND_URL=<your-admin-frontend-service-url>
   ```

3. This will automatically update the CORS settings on the backend

## Step 6: Set Up Custom Domains (Optional)

1. In Railway, go to each service
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow the DNS instructions to configure your domain

## Troubleshooting

### Database Connection Issues

If the backend can't connect to the database:

1. Check that the DATABASE_URL is correctly copied from the PostgreSQL service
2. Ensure the PostgreSQL service is running
3. Try redeploying the backend service

### Frontend API Connection Issues

If frontends can't connect to the backend:

1. Verify that VITE_API_BASE_URL includes `/api` at the end
2. Check browser console for CORS errors
3. Ensure the backend has the correct CORS settings with frontend URLs

### Build Errors

If you encounter Docker build errors:

1. Check that each Dockerfile is compatible with being run from its package directory
2. Verify that all necessary files are included in each package
3. Try building the Docker image locally:
   ```bash
   # From within each package directory
   docker build -t test-image .
   ```

## Monitoring and Logs

1. In Railway, go to each service
2. Click "Metrics" to see resource usage
3. Click "Logs" to view service logs
4. Set up alerts in "Settings" → "Alerts"

## Updating Services

To update a service:

1. Push changes to your GitHub repository
2. Railway will automatically rebuild and redeploy the service
3. You can also trigger manual deployments from the Railway dashboard 