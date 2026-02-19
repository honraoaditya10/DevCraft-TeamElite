# Multi-stage build for Docu-Agent

# Stage 1: Frontend build
FROM node:20-alpine as frontend-builder
WORKDIR /app/frontend
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Backend + Server
FROM node:20-alpine
WORKDIR /app/server

# Install Python for AI pipeline
RUN apk add --no-cache python3 py3-pip

# Copy backend files
COPY server/package.json server/package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy built frontend
COPY --from=frontend-builder /app/dist ../dist

# Copy server source
COPY server/src ./src
COPY server/ai ./ai

# Expose ports
EXPOSE 8001 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8001/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start server
CMD ["npm", "start"]
