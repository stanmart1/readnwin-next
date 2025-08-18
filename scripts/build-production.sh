#!/bin/bash

# Production Build Script for Phusion Server Deployment
# Run this script before uploading to cPanel

set -e

echo "🚀 Starting production build for Phusion Server deployment..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next out dist

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build the application
echo "🔨 Building application..."
NODE_ENV=production npm run build

# Create production directory
echo "📁 Creating production directory..."
mkdir -p production

# Copy necessary files
echo "📋 Copying production files..."
cp -r .next production/
cp -r public production/
cp package.json production/
cp package-lock.json production/
cp server.js production/
cp next.config.production.js production/next.config.js

# Create production package.json
echo "📝 Creating production package.json..."
cat > production/package.json << EOF
{
  "name": "readnwinnext2-production",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "NODE_ENV=production node server.js"
  },
  "dependencies": {
    "next": "^13.5.11",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Create .htaccess for cPanel
echo "🔧 Creating .htaccess file..."
cat > production/.htaccess << EOF
# Phusion Passenger + Next.js Configuration
PassengerEnabled On
PassengerAppRoot /home/username/readnwinnext2
PassengerAppType node
PassengerStartupFile server.js
PassengerNodejs /home/username/.nvm/versions/node/v18.17.0/bin/node

RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

Header always set X-Frame-Options "DENY"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
EOF

# Create deployment instructions
echo "📚 Creating deployment instructions..."
cat > production/DEPLOYMENT_INSTRUCTIONS.md << EOF
# 🚀 Phusion Server Deployment Instructions

## Files to Upload to cPanel

1. **Upload all contents** of this production folder to your cPanel public_html directory
2. **Set permissions**: chmod 755 for directories, 644 for files
3. **Configure .htaccess**: Update the username in .htaccess file
4. **Set environment variables** in cPanel or .env file

## Required cPanel Settings

- **Node.js version**: 18.17.0 or higher
- **Phusion Passenger**: Enabled
- **SSL Certificate**: Configured
- **Domain**: Pointed to public_html

## Environment Variables

Create a .env file in your cPanel home directory with:
- DB_HOST, DB_NAME, DB_USER, DB_PASSWORD
- Other required environment variables

## Testing

After deployment, test:
- Homepage loads
- API endpoints work
- Database connections
- File uploads
- Authentication

## Support

If issues occur, check cPanel error logs and Node.js logs.
EOF

# Create production environment template
echo "🔐 Creating environment template..."
cat > production/.env.production.template << EOF
# Production Environment Variables
# Copy this to .env and fill in your values

# Database Configuration
DB_HOST=your-database-host
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_PORT=5432

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# API Keys (if needed)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Email Configuration
RESEND_API_KEY=your-resend-api-key
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
EOF

echo "✅ Production build completed successfully!"
echo "📁 Production files are in the 'production' directory"
echo "📤 Upload the contents of 'production' folder to your cPanel public_html directory"
echo "📖 Read DEPLOYMENT_INSTRUCTIONS.md for detailed steps"
