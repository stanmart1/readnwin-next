#!/bin/bash

# Quick Phusion Server Deployment Script
# Run this script to prepare your Next.js app for cPanel deployment

echo "🚀 Phusion Server Deployment Preparation"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "next.config.js" ]; then
    echo "❌ Error: Please run this script from your Next.js project root directory"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ required. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next out production

echo "📦 Installing ALL dependencies (including dev dependencies for build)..."
npm ci

echo "🔨 Building application..."
NODE_ENV=production npm run build

# Create production directory
echo "📁 Creating production package..."
mkdir -p production
cp -r .next production/
cp -r public production/
cp server.js production/
cp next.config.production.js production/next.config.js

# Create optimized package.json with only production dependencies
echo "📝 Creating production package.json..."
cat > production/package.json << 'EOF'
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
    "react-dom": "^18.2.0",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-dropdown-menu": "^2.1.15",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-slider": "^1.3.5",
    "@radix-ui/react-switch": "^1.2.5",
    "@radix-ui/react-tabs": "^1.1.12",
    "@react-google-maps/api": "^2.19.3",
    "@stripe/react-stripe-js": "^3.8.1",
    "@stripe/stripe-js": "^2.4.0",
    "axios": "^1.11.0",
    "bcryptjs": "^3.0.2",
    "date-fns": "^2.30.0",
    "dotenv": "^17.2.1",
    "framer-motion": "^12.23.12",
    "jsonwebtoken": "^9.0.2",
    "lucide-react": "^0.539.0",
    "next-auth": "^4.24.11",
    "nodemailer": "^6.10.1",
    "pg": "^8.16.3",
    "puppeteer": "^24.16.0",
    "react-hot-toast": "^2.5.2",
    "react-markdown": "^10.1.0",
    "react-quill": "^2.0.0",
    "react-toastify": "^11.0.5",
    "recharts": "^3.0.2",
    "rehype-raw": "^7.0.0",
    "rehype-sanitize": "^6.0.0",
    "rehype-stringify": "^10.0.1",
    "remark-gfm": "^4.0.1",
    "remark-parse": "^11.0.0",
    "remark-rehype": "^11.1.2",
    "resend": "^4.7.0",
    "stripe": "^14.25.0",
    "unified": "^11.0.5",
    "zod": "^3.22.4",
    "zustand": "^5.0.7",
    "react-image-crop": "^10.1.8"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Create .htaccess
echo "🔧 Creating .htaccess file..."
cat > production/.htaccess << 'EOF'
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

# Create environment template
echo "🔐 Creating environment template..."
cat > production/.env.template << 'EOF'
# Production Environment Variables
# Copy this to .env and fill in your values

DB_HOST=your-database-host
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_PORT=5432

NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
RESEND_API_KEY=your-resend-api-key
EOF

echo ""
echo "✅ Production build completed successfully!"
echo ""
echo "📁 Next steps:"
echo "1. Upload contents of 'production' folder to cPanel public_html"
echo "2. Update .htaccess with your actual username and Node.js path"
echo "3. Create .env file with your production credentials"
echo "4. Enable Phusion Passenger in cPanel"
echo ""
echo "📖 Read DEPLOYMENT_GUIDE_PHUSION.md for detailed instructions"
echo ""
echo "🎯 Files ready for upload:"
ls -la production/
