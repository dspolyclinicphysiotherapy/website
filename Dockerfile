# Multi-stage production build for Node.js
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3050

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

# Copy application source code and data assets
COPY src/ ./src/
COPY public/ ./public/
COPY data/ ./data/

# Use non-root user for security
USER node

EXPOSE 3050

CMD ["node", "src/server.js"]
