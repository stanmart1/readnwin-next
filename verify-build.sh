#!/bin/bash

# 🔍 Build Verification Script for Vercel Deployment
# This script verifies that your build is production-ready

set -e

echo "🔍 Verifying build for Vercel deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Check if build exists
if [ ! -d ".next" ]; then
    print_error "Build directory (.next) not found. Run 'npm run build' first."
    exit 1
fi

print_success "Build directory found"

# Check build size
BUILD_SIZE=$(du -sh .next | cut -f1)
print_status "Build size: $BUILD_SIZE"

# Check for critical build files
CRITICAL_FILES=(
    ".next/static"
    ".next/server"
    ".next/types"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -d "$file" ]; then
        print_success "✓ $file"
    else
        print_error "✗ $file (missing)"
        exit 1
    fi
done

# Check static assets
if [ -d ".next/static" ]; then
    STATIC_COUNT=$(find .next/static -type f | wc -l)
    print_success "Static assets: $STATIC_COUNT files"
else
    print_error "Static assets directory missing"
    exit 1
fi

# Check server files
if [ -d ".next/server" ]; then
    SERVER_COUNT=$(find .next/server -type f | wc -l)
    print_success "Server files: $SERVER_COUNT files"
else
    print_error "Server files directory missing"
    exit 1
fi

# Check package.json scripts
print_status "Checking package.json scripts..."
if npm run --silent | grep -q "build"; then
    print_success "✓ Build script found"
else
    print_error "✗ Build script missing"
fi

if npm run --silent | grep -q "start"; then
    print_success "✓ Start script found"
else
    print_error "✗ Start script missing"
fi

# Check dependencies
print_status "Checking production dependencies..."
if [ -f "package-lock.json" ]; then
    print_success "✓ package-lock.json found"
else
    print_warning "⚠ package-lock.json missing (consider running 'npm install')"
fi

# Check for development dependencies in production
DEV_DEPS=$(npm list --only=dev --depth=0 2>/dev/null | grep -E "^(├|└)" | wc -l)
print_status "Development dependencies: $DEV_DEPS"

# Check environment variables
print_status "Checking environment variables..."
ENV_VARS=(
    "NEXTAUTH_URL"
    "NEXTAUTH_SECRET"
    "DB_HOST"
    "DB_NAME"
    "DB_USER"
    "DB_PASSWORD"
)

MISSING_VARS=()
for var in "${ENV_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    print_success "✓ All required environment variables are set"
else
    print_warning "⚠ Missing environment variables: ${MISSING_VARS[*]}"
    echo "   These must be set in Vercel project settings"
fi

# Check Vercel configuration
if [ -f "vercel.json" ]; then
    print_success "✓ vercel.json found"
    
    # Validate JSON syntax
    if python3 -m json.tool vercel.json > /dev/null 2>&1; then
        print_success "✓ vercel.json is valid JSON"
    else
        print_error "✗ vercel.json has invalid JSON syntax"
        exit 1
    fi
else
    print_error "✗ vercel.json missing"
    exit 1
fi

# Check TypeScript configuration
if [ -f "tsconfig.json" ]; then
    print_success "✓ tsconfig.json found"
else
    print_error "✗ tsconfig.json missing"
    exit 1
fi

# Check Next.js configuration
if [ -f "next.config.js" ]; then
    print_success "✓ next.config.js found"
else
    print_error "✗ next.config.js missing"
    exit 1
fi

# Check for common issues
print_status "Checking for common deployment issues..."

# Check for localhost references
if grep -r "localhost\|127.0.0.1" .next/ --exclude-dir=node_modules 2>/dev/null | grep -v "localhost:3000" | grep -v "127.0.0.1:3000"; then
    print_warning "⚠ Found localhost references in build (may cause issues)"
else
    print_success "✓ No problematic localhost references found"
fi

# Check for hardcoded paths
if grep -r "/Users\|/home\|C:\\" .next/ --exclude-dir=node_modules 2>/dev/null; then
    print_warning "⚠ Found hardcoded paths in build"
else
    print_success "✓ No hardcoded paths found"
fi

# Performance checks
print_status "Running performance checks..."

# Check bundle size
if [ -f ".next/analyze" ]; then
    print_success "✓ Bundle analysis available"
else
    print_warning "⚠ Consider running 'npm run analyze' for bundle optimization"
fi

# Check for large files
LARGE_FILES=$(find .next -type f -size +1M 2>/dev/null | wc -l)
if [ "$LARGE_FILES" -gt 0 ]; then
    print_warning "⚠ Found $LARGE_FILES files larger than 1MB"
    find .next -type f -size +1M 2>/dev/null | head -5
else
    print_success "✓ No excessively large files found"
fi

echo ""
print_success "🎉 Build verification completed!"
echo ""
echo "📊 Build Summary:"
echo "  - Build size: $BUILD_SIZE"
echo "  - Static assets: $STATIC_COUNT files"
echo "  - Server files: $SERVER_COUNT files"
echo "  - Development dependencies: $DEV_DEPS"
echo ""
echo "✅ Your build is ready for Vercel deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Push to Git repository"
echo "2. Create Vercel project"
echo "3. Configure environment variables"
echo "4. Deploy!"
echo ""
print_success "Ready to deploy! 🚀"
