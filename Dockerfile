# Base image
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# Install dependencies with legacy peer deps
FROM base AS deps
RUN npm ci --legacy-peer-deps

# Build the Next.js app
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app

# Copy only necessary files
COPY --from=build /app/public ./public
COPY --from=build /app/.next ./.next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/scripts ./scripts

# Expose port
EXPOSE 3000

# Run setup + migration + server in sequence
CMD ["bash", "-c", "node scripts/setup-production-storage.js && node scripts/migrate-covers-to-storage.js && node server.js"]
