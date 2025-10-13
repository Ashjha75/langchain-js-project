# ============================================================
# 🧱 Dockerfile for Next.js 15 (App Router) — Standalone Build
# Compatible with Render, Railway, Vercel, or Local Docker Run
# ============================================================

# 1️⃣ Base Image
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ------------------------------------------------------------
# 2️⃣ Dependencies Stage
# ------------------------------------------------------------
FROM base AS deps

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (ignore peer conflicts if needed)
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# ------------------------------------------------------------
# 3️⃣ Builder Stage
# ------------------------------------------------------------
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Build environment setup
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js (creates .next/standalone)
RUN npm run build

# ------------------------------------------------------------
# 4️⃣ Runner Stage (Final Production Image)
# ------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Create app user (non-root)
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Ensure public directory exists to prevent build-time errors
RUN mkdir -p ./public

# Copy build output and assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# (Optional) Copy env if needed for runtime (Render ignores local .env by default)
# COPY .env .env

# Adjust permissions
RUN mkdir -p .next && chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose app port
EXPOSE 3000

# Start Next.js standalone server
CMD ["node", "server.js"]
