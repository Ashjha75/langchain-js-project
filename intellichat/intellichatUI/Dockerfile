# ================================================================
# 1️⃣ BASE IMAGE
# ================================================================
FROM node:20-alpine AS base

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Add system dependencies for Next.js builds
RUN apk add --no-cache libc6-compat

WORKDIR /app

# ================================================================
# 2️⃣ DEPENDENCIES STAGE
# ================================================================
FROM base AS deps

# Copy dependency files
COPY package*.json ./

# Install deps (use npm install to ensure lockfile sync)
RUN npm install --legacy-peer-deps

# ================================================================
# 3️⃣ BUILD STAGE
# ================================================================
FROM base AS builder

WORKDIR /app

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy project files
COPY . .

# Build Next.js app (standalone output)
RUN npm run build

# ================================================================
# 4️⃣ RUNNER STAGE (FINAL IMAGE)
# ================================================================
FROM base AS runner

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Security: non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Ensure public dir exists to prevent COPY errors
RUN mkdir -p /app/public

# Copy the standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Try to copy public folder if it exists (optional)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public || true

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start the Next.js standalone server
CMD ["node", "server.js"]
