# ================================================================
# 1️⃣ BASE / DEPENDENCIES STAGE
# ================================================================
FROM node:20-alpine AS deps

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm install --legacy-peer-deps

# ================================================================
# 2️⃣ BUILD STAGE
# ================================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build TypeScript project
RUN npm run build

# ================================================================
# 3️⃣ RUNTIME STAGE (PRODUCTION)
# ================================================================
FROM node:20-alpine AS runner
WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist/config ./dist/config

# Environment configuration
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Run as non-root user for security
RUN addgroup --system appgroup && adduser --system appuser --ingroup appgroup
USER appuser

# Start command
CMD ["node", "dist/server.js"]
