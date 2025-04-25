# Stage 1: Build the React application
FROM node:18-alpine AS builder
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json* ./
# Copy frontend specific package files
COPY packages/admin-frontend/package.json ./packages/admin-frontend/
# Install ALL dependencies
RUN npm install --workspace=admin-frontend --include=dev

# Copy frontend source code
COPY packages/admin-frontend/ ./packages/admin-frontend/

# Set build-time environment variables
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build the application
RUN npm run build --workspace=admin-frontend

# Stage 2: Serve the static files with Nginx
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/packages/admin-frontend/dist .
COPY packages/admin-frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 