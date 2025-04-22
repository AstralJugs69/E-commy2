# Stage 1: base image
FROM node:18-slim AS base
WORKDIR /app

# Stage 2: install dependencies
FROM base AS deps
COPY package.json package-lock.json ./
COPY packages/backend/package.json packages/backend/package-lock.json ./packages/backend/
COPY packages/backend/prisma ./packages/backend/prisma
RUN npm install --production=false

# Stage 3: build application
FROM deps AS builder
COPY package.json package-lock.json ./
COPY packages/backend/package.json packages/backend/package-lock.json ./packages/backend/
COPY packages/backend/prisma ./packages/backend/prisma
RUN cd packages/backend && npx prisma generate
COPY packages/backend/src ./packages/backend/src
COPY packages/backend/tsconfig.json ./packages/backend/tsconfig.json
RUN cd packages/backend && npm run build

# Stage 4: production image
FROM node:18-slim AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/backend/prisma ./packages/backend/prisma
COPY packages/backend/package.json ./packages/backend/
ENV PORT=10000
EXPOSE 10000
CMD ["npm", "run", "start", "--workspace=backend"]
