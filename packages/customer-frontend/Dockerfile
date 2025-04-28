# Stage 1: Build the React application
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json ./
COPY package-lock.json* ./

# Install ALL dependencies
RUN npm install --include=dev

# Copy source code
COPY . .

# Set build-time environment variables (passed via --build-arg)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build the application
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# Remove default Nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY --from=builder /app/dist .

# Copy custom Nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 