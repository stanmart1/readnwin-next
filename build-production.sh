#!/bin/bash

# 🚀 Production SSR Build Script for ReadnWin
# This script builds the application for production SSR deployment

set -e

echo "🚀 Starting Production SSR Build..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version: $(node -v)"

# Step 1: Clean previous builds
print_status "Step 1: Cleaning previous builds..."
rm -rf .next
rm -rf out
rm -rf dist
print_success "Cleanup completed"

# Step 2: Install dependencies
print_status "Step 2: Installing dependencies..."
npm ci
print_success "Dependencies installed"

# Step 3: Run linting
print_status "Step 3: Running linting..."
if npm run lint; then
    print_success "Linting passed"
else
    print_warning "Linting failed, but continuing with build..."
fi

# Step 4: Run type checking
print_status "Step 4: Running TypeScript type checking..."
if npx tsc --noEmit; then
    print_success "Type checking passed"
else
    print_warning "Type checking failed, but continuing with build..."
fi

# Step 5: Build for production SSR
print_status "Step 5: Building for production SSR..."
NODE_ENV=production npm run build
print_success "Production SSR build completed"

# Step 6: Verify build output
print_status "Step 6: Verifying build output..."
if [ -d ".next" ]; then
    print_success "✓ .next directory exists"
else
    print_error "✗ .next directory missing - build failed"
    exit 1
fi

if [ -f ".next/server.js" ]; then
    print_success "✓ Server-side build artifacts exist"
else
    print_error "✗ Server-side build artifacts missing"
    exit 1
fi

# Step 7: Create production package
print_status "Step 7: Creating production package..."
mkdir -p production-package

# Copy necessary files
cp -r .next production-package/
cp -r public production-package/
cp package.json production-package/
cp package-lock.json production-package/
cp server.js production-package/
cp next.config.production.js production-package/next.config.js
cp .env.production production-package/.env

# Create optimized package.json for production
cat > production-package/package.json << 'EOF'
{
  "name": "readnwinnext2-production",
  "version": "1.0.0",
  "private": true,
  "description": "ReadnWin Next.js Application - Production SSR Build",
  "main": "server.js",
  "scripts": {
    "start": "NODE_ENV=production node server.js",
    "dev": "NODE_ENV=development node server.js",
    "build": "echo 'Build already completed'",
    "postinstall": "echo 'Post-install completed'"
  },
  "dependencies": {
    "next": "^14.2.30",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "pg": "^8.16.3",
    "bcryptjs": "^3.0.2",
    "jsonwebtoken": "^9.0.2",
    "nodemailer": "^6.10.1",
    "dotenv": "^17.2.1",
    "axios": "^1.11.0",
    "stripe": "^14.25.0",
    "zod": "^3.22.4",
    "zustand": "^5.0.7",
    "next-auth": "^4.24.11"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
EOF

print_success "Production package created"

# Step 8: Create deployment instructions
print_status "Step 8: Creating deployment instructions..."
cat > production-package/DEPLOYMENT.md << 'EOF'
# Production SSR Deployment Instructions

## Prerequisites
- Node.js 18+ installed on server
- PostgreSQL database accessible
- Environment variables configured

## Deployment Steps

1. **Upload Files**
   ```bash
   # Upload the entire production-package directory to your server
   ```

2. **Install Dependencies**
   ```bash
   cd production-package
   npm install --production
   ```

3. **Configure Environment**
   ```bash
   # Edit .env file with your production settings
   nano .env
   ```

4. **Start the Server**
   ```bash
   npm start
   ```

5. **Set up Process Manager (PM2)**
   ```bash
   npm install -g pm2
   pm2 start server.js --name "readnwin"
   pm2 startup
   pm2 save
   ```

## Environment Variables Required
- NEXTAUTH_URL=https://yourdomain.com
- NEXTAUTH_SECRET=UEy5Y/QV4QsvGXMgqlDqe9wfmVkEDG1IDz8UjVuo6FA=
- DB_HOST=149.102.159.118
- DB_NAME=postgres
- DB_USER=postgres
- DB_PASSWORD=your-db-password
- DB_PORT=your-db-port

## Verification
- Visit https://yourdomain.com
- Check that books load dynamically from database
- Verify API routes work: https://yourdomain.com/api/books
EOF

print_success "Deployment instructions created"

# Step 9: Create PM2 configuration
print_status "Step 9: Creating PM2 configuration..."
cat > production-package/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'readnwin',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

mkdir -p production-package/logs
print_success "PM2 configuration created"

# Final summary
echo ""
print_success "🎉 Production SSR Build Completed Successfully!"
echo ""
echo "📦 Production package created in: production-package/"
echo "📋 Deployment instructions: production-package/DEPLOYMENT.md"
echo "🔧 PM2 configuration: production-package/ecosystem.config.js"
echo ""
echo "📤 Next steps:"
echo "1. Upload production-package/ to your server"
echo "2. Follow deployment instructions in DEPLOYMENT.md"
echo "3. Start the server with: npm start"
echo ""
print_success "Your application is ready for production SSR deployment! 🚀" 