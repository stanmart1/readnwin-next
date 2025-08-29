# Use a more stable base image for production
FROM node:20.18.1-slim AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package*.json ./
RUN --mount=type=cache,id=npm,target=/root/.npm npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install system dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use installed Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Copy package files and install all dependencies for build
COPY package*.json ./
RUN --mount=type=cache,id=npm,target=/root/.npm npm ci

# Add node_modules/.bin to PATH
ENV PATH="/app/node_modules/.bin:${PATH}"

# Copy configuration files
COPY next.config.docker.js ./next.config.js
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY . .

# Set environment variables for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV STORAGE_PATH=/app/storage

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV STORAGE_PATH=/app/storage

# Install runtime dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer to use installed Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Create a non-root user
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser

# Copy the public folder
COPY --from=builder /app/public ./public

# Copy setup scripts (if they exist)
COPY --from=builder /app/scripts ./scripts 2>/dev/null || true

# Create storage and uploads directories using STORAGE_PATH
RUN mkdir -p ${STORAGE_PATH} /app/uploads /app/public/uploads
RUN chown -R pptruser:pptruser ${STORAGE_PATH} /app/uploads /app/public/uploads

# Create volume mount points for persistent storage
VOLUME ["${STORAGE_PATH}"]

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown pptruser:pptruser .next

# Create startup script before switching to non-root user
RUN echo '#!/bin/bash\nset -e\nif [ -f scripts/setup-production-storage.js ]; then\n  node scripts/setup-production-storage.js\nfi\nif [ -f scripts/migrate-covers-to-storage.js ]; then\n  node scripts/migrate-covers-to-storage.js\nfi\nnode server.js' > /app/start.sh && chmod +x /app/start.sh

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=pptruser:pptruser /app/.next/standalone ./
COPY --from=builder --chown=pptruser:pptruser /app/.next/static ./.next/static

USER pptruser

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["/app/start.sh"]
