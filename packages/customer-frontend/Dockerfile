# Stage 1: Build the React application
FROM node:18-alpine AS builder
WORKDIR /app

# Copy root package files (for workspace dependencies)
COPY package.json package-lock.json* ./
# Copy frontend specific package files
COPY packages/customer-frontend/package.json ./packages/customer-frontend/
# Install ALL dependencies (needed for tsc/vite build)
RUN npm install --workspace=customer-frontend --include=dev

# Copy frontend source code
COPY packages/customer-frontend/ ./packages/customer-frontend/

# Set build-time environment variables (passed via --build-arg)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build the application
RUN npm run build --workspace=customer-frontend

# Stage 2: Serve the static files with Nginx
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# Remove default Nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY --from=builder /app/packages/customer-frontend/dist .

# Copy custom Nginx config for SPA routing
COPY packages/customer-frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 