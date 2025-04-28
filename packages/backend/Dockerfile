# ---- Base Node ----
FROM node:18-slim AS base
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json ./
COPY package-lock.json* ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install --production=false

# ---- Builder ----
FROM deps AS builder
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build the application
RUN npm run build

# ---- Production ----
FROM base AS production
WORKDIR /app

# Install production dependencies
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl curl && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production

# Copy package files
COPY package.json ./
COPY package-lock.json* ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy prisma and built files
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV PORT=10000
EXPOSE 10000

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:${PORT}/ || exit 1

# Start the application
CMD ["npm", "run", "start"]
