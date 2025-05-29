# Multi-stage build for production
FROM node:18-alpine AS builder

# Build server
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ ./
RUN npm run build

# Build client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy server files
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/server/package*.json ./server/

# Copy client build
COPY --from=builder /app/client/dist ./client/dist

# Create uploads directory
RUN mkdir -p server/uploads

EXPOSE 5000

CMD ["node", "server/dist/index.js"]