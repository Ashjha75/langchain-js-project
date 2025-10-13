# ============================================================
# Next.js 15 (App Router) — Standalone Production Build
# Optimized for Render, Railway, Vercel, and local Docker
# ============================================================

# 1️⃣ Base Image (Node 18 LTS for Next.js 15)
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ------------------------------------------------------------
# 2️⃣ Dependencies Stage
# ------------------------------------------------------------
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with proper error handling
RUN if [ -f package-lock.json ]; then \
      npm ci --legacy-peer-deps; \
    else \
      npm install --legacy-peer-deps; \
    fi

# ------------------------------------------------------------
# 3️⃣ Builder Stage
# ------------------------------------------------------------
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js with standalone output
RUN npm run build && \
    echo "✅ Build completed successfully"

# Verify standalone build exists
RUN if [ ! -d ".next/standalone" ]; then \
      echo "❌ ERROR: Standalone build not found!"; \
      echo "Make sure next.config.js has output: 'standalone'"; \
      exit 1; \
    fi

# ------------------------------------------------------------
# 4️⃣ Runner Stage (Production)
# ------------------------------------------------------------
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build (this includes everything needed for production)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set proper permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run standalone server
CMD ["node", "server.js"]