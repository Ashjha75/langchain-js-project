# ================================================================
# 1️⃣ BASE / DEPENDENCIES STAGE
# ================================================================
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

# ================================================================
# 2️⃣ BUILD STAGE
# ================================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy node_modules
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY . .

# Build TypeScript project (includes lint/prettier check in prebuild)
RUN npm run build

# ================================================================
# 3️⃣ RUNTIME STAGE (PRODUCTION)
# ================================================================
FROM node:20-alpine AS runner
WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV LOG_DIR=/tmp/logs

# Expose port
EXPOSE 3001

# Run as non-root
RUN addgroup --system appgroup && adduser --system appuser --ingroup appgroup
USER appuser

# Start server
CMD ["node", "dist/server.js"]
