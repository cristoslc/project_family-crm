# Multi-stage build: frontend + backend

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend and combine
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
# Copy frontend build into backend public directory
COPY --from=frontend-builder /app/frontend/build ./public

# Stage 3: Production runtime
FROM node:18-alpine
WORKDIR /app
# Copy backend files
COPY --from=backend-builder /app/backend ./
# Install production dependencies only
RUN npm ci --only=production
EXPOSE 3000
CMD ["node", "src/server.js"]
