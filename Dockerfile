# syntax=docker/dockerfile:1.4

##################################################
# Stage 1 — Base image with dev dependencies     #
##################################################
FROM node:22-alpine AS deps
WORKDIR /app

# Install build tools for native modules
RUN apk add --no-cache python3 make g++

# Install all dependencies
COPY package.json package-lock.json ./
RUN npm ci

##################################################
# Stage 2 — Build app and prepare SQLite DB      #
##################################################
FROM deps AS builder
WORKDIR /app

# Copy full project
COPY . ./

# Configure database path for migrations
ENV DATABASE_FILE=/app/data/sqlite.db
ENV DATABASE_URL="file:/app/data/sqlite.db"

# Build assets and run migrations
RUN npm run build
RUN npm run db:push

# Copy initialization scripts
COPY docker-entrypoint-initdb.d/ /docker-entrypoint-initdb.d/

##################################################
# Stage 3 — Production runtime                   #
##################################################
FROM node:22-alpine AS production
WORKDIR /app

# Install SQLite CLI for seeding
RUN apk add --no-cache sqlite

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install only production dependencies
COPY package.json package-lock.json ./
# RUN npm ci --omit=dev && npm cache clean --force
RUN npm ci && npm cache clean --force

# Copy compiled app and data directory
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

# Copy init scripts and entrypoint
COPY --from=builder /docker-entrypoint-initdb.d /docker-entrypoint-initdb.d
COPY ./docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# Set permissions and ownership
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
    && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Set environment variables
ENV NODE_ENV=production
ENV DATABASE_FILE=/app/data/sqlite.db
ENV DATABASE_URL="file:/app/data/sqlite.db"

# Expose HTTP port
EXPOSE 5001

# Set entrypoint and default command
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]