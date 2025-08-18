#!/bin/bash

# ReadNwin Next.js Production Deployment Script
# This script sets up the production environment

set -e

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

print_status "Starting ReadNwin Next.js production deployment..."

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
    print_error "npm is not installed."
    exit 1
fi

print_success "npm version: $(npm -v)"

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    npm install -g pm2
    print_success "PM2 installed successfully"
else
    print_success "PM2 is already installed"
fi

# Create necessary directories
print_status "Creating directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p temp

# Set up environment file
if [ ! -f .env.local ]; then
    print_status "Setting up environment file..."
    cp env.production.template .env.local
    print_warning "Please edit .env.local with your production values"
    print_warning "Especially update NEXTAUTH_URL with your domain"
else
    print_success "Environment file already exists"
fi

# Install dependencies
print_status "Installing dependencies..."
npm install --production

# Build the application
print_status "Building the application..."
npm run build

# Start the application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Set up PM2 startup script
pm2 startup

print_success "Deployment completed successfully!"
print_status "Application is running on http://localhost:3000"
print_status "PM2 status: pm2 status"
print_status "PM2 logs: pm2 logs"
print_status "PM2 restart: pm2 restart readnwin-nextjs"

# Health check
print_status "Performing health check..."
sleep 5
if curl -f http://localhost:3000/api/debug/database > /dev/null 2>&1; then
    print_success "Health check passed! Application is running correctly."
else
    print_warning "Health check failed. Check logs with: pm2 logs readnwin-nextjs"
fi

print_status "Next steps:"
print_status "1. Configure Nginx (see nginx.conf)"
print_status "2. Set up SSL certificate with Let's Encrypt"
print_status "3. Configure firewall rules"
print_status "4. Set up monitoring and backups" 