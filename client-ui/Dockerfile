# Stage 1: Install dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Install libc6-compat for Next.js compatibility
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Stage 2: Build Next.js application
FROM node:20-alpine AS builder

WORKDIR /app

# Install libc6-compat
RUN apk add --no-cache libc6-compat

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build Next.js with standalone output
RUN npm run build

# Stage 3: Production runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Install libc6-compat and wget for health checks
RUN apk add --no-cache libc6-compat wget

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone server
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Set ownership to non-root user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose Next.js port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the Next.js server
CMD ["node", "server.js"]
