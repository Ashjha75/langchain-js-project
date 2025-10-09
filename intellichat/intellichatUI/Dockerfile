# Dockerfile for Next.js application

# 1. Base Image
FROM node:20-alpine AS base

# 2. Dependencies Stage
FROM base AS deps
WORKDIR /app

# Copy package.json and lock file
COPY package.json package-lock.json ./

# Install production dependencies
RUN npm ci --only=production

# 3. Builder Stage
FROM base AS builder
WORKDIR /app

# Copy all files
COPY . .

# Install all dependencies (including dev dependencies)
RUN npm install

# Build the application
RUN npm run build

# 4. Runner Stage (Final Image)
FROM base AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Set the user
USER nextjs

# Expose the port
EXPOSE 3000

# Set the command to start the server
CMD ["npm", "start"]
