# ---- Base Node ----
FROM node:18-slim AS base
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm install --production=false

# ---- Builder ----
FROM deps AS builder
WORKDIR /app
RUN npx prisma generate
COPY src ./src
COPY tsconfig.json ./
RUN npm run build

# ---- Production ----
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
ENV PORT=10000
EXPOSE 10000
CMD ["npm","run","start"]
