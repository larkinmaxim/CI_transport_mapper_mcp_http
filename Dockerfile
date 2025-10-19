# Use Node.js 20 LTS as base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY tsconfig.json ./

# Install dev dependencies and build
RUN npm install --save-dev typescript @types/node ts-node && \
    npm run build && \
    npm prune --production

# Copy examples and documentation
COPY Examples/ ./Examples/
COPY Documentation/ ./Documentation/

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S xmluser -u 1001

# Change ownership
RUN chown -R xmluser:nodejs /app
USER xmluser

# Expose port 3100
EXPOSE 3100

# Set environment variables
ENV NODE_ENV=production
ENV MCP_TRANSPORT=http
ENV PORT=3100

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3100/ || exit 1

# Start the server directly with node
CMD ["node", "dist/server.js"]
