# Build stage
FROM node:24-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy Prisma schema
COPY src/prisma ./src/prisma
COPY prisma.config.ts ./

# Generate Prisma client
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:24-slim AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy Prisma schema and generated client
COPY --from=builder /app/src/prisma ./src/prisma
COPY --from=builder /app/prisma.config.ts ./

# Copy built application
COPY --from=builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]

# Development stage (for docker-compose dev mode)
FROM node:24-slim AS development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install system dependencies for node-canvas (required by pdf-img-convert)
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev

# Install all dependencies (including devDependencies)
# Remove package-lock.json to avoid platform conflicts (Windows host -> Linux container)
RUN rm -f package-lock.json && npm install

# Copy Prisma schema
COPY src/prisma ./src/prisma
COPY prisma.config.ts ./

# Generate Prisma client
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
RUN npx prisma generate

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start in development mode
CMD ["npm", "run", "dev"]
