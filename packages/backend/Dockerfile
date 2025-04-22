# ---- Base Node ----
FROM node:18-slim AS base
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
WORKDIR /app/packages/backend
COPY ../../package.json ../../package-lock.json* ../../
COPY package.json package-lock.json* ./
COPY prisma ./prisma
WORKDIR /app
RUN npm install --production=false

# ---- Builder ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json /app/package-lock.json* ./
COPY --from=deps /app/packages/backend/package.json ./packages/backend/
COPY --from=deps /app/packages/backend/prisma ./packages/backend/prisma
RUN cd packages/backend && npx prisma generate
COPY packages/backend/src ./packages/backend/src
COPY packages/backend/tsconfig.json ./packages/backend/
RUN cd packages/backend && npm run build

# ---- Production ----
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
COPY packages/backend/package.json ./packages/backend/
RUN npm install --omit=dev --ignore-scripts
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/backend/prisma ./packages/backend/prisma
COPY --from=builder /app/node_modules/.prisma/client ./node_modules/.prisma/client
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
ENV PORT=10000
EXPOSE 10000
CMD ["npm","run","start","--workspace=backend"]
