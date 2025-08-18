#!/bin/bash

# 🚀 Vercel Deployment Script for ReadnWin
# This script prepares your application for Vercel deployment

set -e  # Exit on any error

echo "🚀 Starting Vercel deployment preparation..."

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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "npm version: $(npm -v)"

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf .next
rm -rf node_modules
rm -rf out
print_success "Cleanup completed"

# Install dependencies
print_status "Installing dependencies..."
npm install
print_success "Dependencies installed"

# Run linting
print_status "Running linting..."
if npm run lint; then
    print_success "Linting passed"
else
    print_warning "Linting failed, but continuing with deployment..."
fi

# Run type checking
print_status "Running TypeScript type checking..."
if npx tsc --noEmit; then
    print_success "Type checking passed"
else
    print_warning "Type checking failed, but continuing with deployment..."
fi

# Build the application
print_status "Building the application..."
if npm run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed. Please fix the errors and try again."
    exit 1
fi

# Check build output
if [ -d ".next" ]; then
    print_success "Build output verified (.next directory exists)"
else
    print_error "Build output not found. Build may have failed."
    exit 1
fi

# Check for environment variables
print_status "Checking environment variables..."
if [ -f ".env.local" ]; then
    print_warning ".env.local file found. Make sure to set these variables in Vercel."
    echo "Required environment variables:"
    echo "  - NEXTAUTH_URL"
    echo "  - NEXTAUTH_SECRET"
    echo "  - DB_HOST"
    echo "  - DB_NAME"
    echo "  - DB_USER"
    echo "  - DB_PASSWORD"
    echo "  - DB_PORT"
else
    print_warning "No .env.local file found. You'll need to set environment variables in Vercel."
fi

# Check for vercel.json
if [ -f "vercel.json" ]; then
    print_success "vercel.json configuration found"
else
    print_error "vercel.json not found. Please ensure it exists for proper deployment."
    exit 1
fi

# Check for deployment guide
if [ -f "DEPLOYMENT.md" ]; then
    print_success "Deployment guide found"
else
    print_warning "DEPLOYMENT.md not found"
fi

# Final checks
print_status "Performing final deployment checks..."

# Check if all required files exist
REQUIRED_FILES=("package.json" "next.config.js" "tsconfig.json" "vercel.json")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "✓ $file"
    else
        print_error "✗ $file (missing)"
        exit 1
    fi
done

# Check if build artifacts exist
BUILD_ARTIFACTS=(".next" "package-lock.json")
for artifact in "${BUILD_ARTIFACTS[@]}"; do
    if [ -e "$artifact" ]; then
        print_success "✓ $artifact"
    else
        print_error "✗ $artifact (missing)"
        exit 1
    fi
done

echo ""
print_success "🎉 Deployment preparation completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to Git repository:"
echo "   git add ."
echo "   git commit -m 'Prepare for Vercel deployment'"
echo "   git push origin main"
echo ""
echo "2. Go to Vercel Dashboard: https://vercel.com/dashboard"
echo "3. Create new project and import your repository"
echo "4. Configure environment variables in Vercel"
echo "5. Deploy!"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo "🔧 For troubleshooting, check the deployment logs in Vercel"
echo ""
print_success "Your application is ready for Vercel deployment! 🚀"
