# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build Vite frontend (→ dist/public) + TypeScript server (→ dist/server)
RUN npm run build

# ── Stage 2: Production ───────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "dist/server/index.js"]
