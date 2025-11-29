# Stage 1: Install dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Make npm more resilient to flaky registries
ENV NPM_CONFIG_FETCH_RETRIES=5 \
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=20000 \
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000 \
    NPM_CONFIG_FETCH_TIMEOUT=120000 \
    NPM_CONFIG_REGISTRY=https://registry.npmjs.org/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Stage 2: Build TypeScript
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code and config files
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
COPY scripts ./scripts

# Build TypeScript to JavaScript
RUN npm run build

# Stage 3: Production runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Install wget for health checks
RUN apk add --no-cache wget

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 mcpserver

# Copy package files and reuse dependencies from the deps stage
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules

# Trim to production dependencies only (no fresh network fetch)
RUN npm prune --omit=dev && \
    npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy plugins directory (needed for Claude Agent SDK). Place in both src/ and dist/ to satisfy runtime lookups.
COPY src/plugins ./src/plugins
COPY src/plugins ./dist/plugins

# Set ownership to non-root user
RUN chown -R mcpserver:nodejs /app

# Switch to non-root user
USER mcpserver

# Expose MCP server port
EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production

# Start the server
CMD ["node", "dist/index.js"]
