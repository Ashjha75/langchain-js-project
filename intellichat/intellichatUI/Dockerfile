# ============================================================
# 🧱 Dockerfile for Next.js 15 (App Router) — Standalone Build
# Works on Render, Railway, Vercel, Docker, etc.
# ============================================================

# 1️⃣ Base Image
FROM node:20-alpine AS base

# Fix glibc compatibility and set work directory
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ============================================================
# 2️⃣ Dependencies Stage
# ============================================================
FROM base AS deps

# Copy only dependency files first (better cache)
COPY package.json package-lock.json* ./

# Install dependencies safely
# --legacy-peer-deps → avoid React 19 peer conflicts (cmdk, Radix, etc.)
# --force → ensures TypeScript types don’t break builds
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps --force

# ============================================================
# 3️⃣ Builder Stage
# ============================================================
FROM base AS builder

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy app source files
COPY . .

# Set environment variables for production build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# ✅ Preinstall required TypeScript types to prevent build-time auto-install crash
RUN npm install --save-dev --legacy-peer-deps --force @types/react @types/react-dom

# Build the Next.js app (creates .next/standalone)
RUN npm run build

# ============================================================
# 4️⃣ Runner Stage (Production Image)
# ============================================================
FROM base AS runner

WORKDIR /app

# Environment setup
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Ensure required directories exist (prevents COPY errors)
RUN mkdir -p ./public .next

# Copy compiled output and assets from builder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Adjust permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose app port
EXPOSE 3000

# Default start command
CMD ["node", "server.js"]
