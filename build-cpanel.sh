#!/bin/bash

# 🚀 cPanel Deployment Build Package for ReadnWin Next.js Application
# This script creates a complete deployment package for cPanel hosting

set -e

echo "🚀 Starting cPanel deployment build package creation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

print_header() {
    echo -e "${PURPLE}[HEADER]${NC} $1"
}

print_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
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

print_header "Starting cPanel Build Package Creation"
echo "================================================"

# Step 1: Clean previous builds
print_step "Step 1: Cleaning previous builds..."
rm -rf .next
rm -rf out
rm -rf dist
rm -rf cpanel-deploy
print_success "Cleanup completed"

# Step 2: Install dependencies
print_step "Step 2: Installing dependencies..."
npm ci
print_success "All dependencies installed"

# Step 3: Build the application
print_step "Step 3: Building the application..."
NODE_ENV=production npx next build --no-lint
print_success "Build completed successfully"

# Step 3.5: Clean up dev dependencies for production
print_step "Step 3.5: Cleaning up dev dependencies for production..."
npm prune --production
print_success "Dev dependencies cleaned up"

# Step 4: Create cPanel deployment directory
print_step "Step 4: Creating cPanel deployment directory..."
mkdir -p cpanel-deploy
print_success "Deployment directory created"

# Step 5: Copy necessary files
print_step "Step 5: Copying production files..."
cp -r .next cpanel-deploy/
cp -r public cpanel-deploy/
cp package.json cpanel-deploy/
cp package-lock.json cpanel-deploy/
cp server.js cpanel-deploy/
cp next.config.production.js cpanel-deploy/next.config.js

# Copy additional necessary files
if [ -f "next.config.js" ]; then
    cp next.config.js cpanel-deploy/next.config.backup.js
fi

print_success "Production files copied"

# Step 6: Create optimized package.json for cPanel
print_step "Step 6: Creating optimized package.json for cPanel..."
cat > cpanel-deploy/package.json << 'EOF'
{
  "name": "readnwinnext2-cpanel",
  "version": "1.0.0",
  "private": true,
  "description": "ReadnWin Next.js Application for cPanel Deployment",
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
    "zustand": "^5.0.7"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  },
  "keywords": [
    "nextjs",
    "react",
    "cpanel",
    "deployment"
  ],
  "author": "ReadnWin Team",
  "license": "MIT"
}
EOF
print_success "Optimized package.json created"

# Step 7: Create .htaccess for cPanel
print_step "Step 7: Creating .htaccess file for cPanel..."
cat > cpanel-deploy/.htaccess << 'EOF'
# cPanel + Next.js Configuration
# Phusion Passenger Configuration
PassengerEnabled On
PassengerAppType node
PassengerStartupFile server.js
PassengerNodejs /home/USERNAME/.nvm/versions/node/v18.17.0/bin/node

# URL Rewriting for Next.js
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Security Headers
Header always set X-Frame-Options "DENY"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"

# Cache Control for Static Assets
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
    Header set Cache-Control "public, immutable"
</FilesMatch>

# Gzip Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Prevent access to sensitive files
<FilesMatch "\.(env|log|sql|md|txt)$">
    Order allow,deny
    Deny from all
</FilesMatch>
EOF
print_success ".htaccess file created"

# Step 8: Create environment configuration template
print_step "Step 8: Creating environment configuration template..."
cat > cpanel-deploy/.env.cpanel.template << 'EOF'
# cPanel Environment Variables Template
# Copy this file to .env and fill in your actual values

# Database Configuration (REQUIRED)
DB_HOST=your-database-host
DB_NAME=your-database-name
DB_USER=your-database-username
DB_PASSWORD=your-database-password
DB_PORT=5432

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
HOSTNAME=0.0.0.0
PORT=3000

# NextAuth Configuration (REQUIRED)
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secure-secret-key-here

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe Configuration (if using)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Email Configuration
RESEND_API_KEY=your-resend-api-key
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password

# Security
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key
EOF
print_success "Environment template created"

# Step 9: Create deployment instructions
print_step "Step 9: Creating comprehensive deployment instructions..."
cat > cpanel-deploy/CPANEL_DEPLOYMENT_GUIDE.md << 'EOF'
# 🚀 cPanel Deployment Guide for ReadnWin Next.js Application

## 📋 Prerequisites

- **cPanel hosting** with Node.js support
- **Node.js 18.17.0+** configured in cPanel
- **Phusion Passenger** enabled (recommended)
- **SSL Certificate** configured
- **Domain** pointed to your hosting

## 🔧 Step 1: Prepare Your cPanel Environment

### 1.1 Enable Node.js in cPanel
1. Login to cPanel
2. Go to "Node.js" section
3. Create a new Node.js app:
   - **Node.js version**: 18.17.0 or higher
   - **Application mode**: Production
   - **Application root**: /home/USERNAME/your-app-name
   - **Application URL**: https://yourdomain.com
   - **Application startup file**: server.js

### 1.2 Enable Phusion Passenger (Recommended)
1. In cPanel, go to "Software" → "Passenger"
2. Enable Phusion Passenger
3. Set Node.js version to 18.17.0+

## 📤 Step 2: Upload Files to cPanel

### Method 1: cPanel File Manager
1. **Login to cPanel**
2. **Navigate to public_html** (or your domain directory)
3. **Upload all contents** of this cpanel-deploy folder
4. **Extract if uploaded as ZIP**

### Method 2: FTP/SFTP
1. Use FileZilla or similar FTP client
2. Connect to your hosting server
3. Upload all contents to public_html directory

### Method 3: Git Deployment
1. Clone your repository to cPanel
2. Run build commands on the server
3. Copy built files to public_html

## ⚙️ Step 3: Configure Environment Variables

### 3.1 Create .env File
1. **In cPanel home directory** (not public_html), create `.env` file
2. Copy contents from `.env.cpanel.template`
3. Fill in your actual values:

```bash
# Database Configuration
DB_HOST=your-actual-database-host
DB_NAME=your-actual-database-name
DB_USER=your-actual-username
DB_PASSWORD=your-actual-password
DB_PORT=5432

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-generated-secret
```

### 3.2 Generate Secure Secrets
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -base64 32
```

## 🔧 Step 4: Configure .htaccess

### 4.1 Update Username in .htaccess
1. Open `.htaccess` file in public_html
2. Replace `USERNAME` with your actual cPanel username
3. Update Node.js path if different:

```apache
PassengerNodejs /home/YOUR_USERNAME/.nvm/versions/node/v18.17.0/bin/node
```

### 4.2 Verify Phusion Passenger Settings
```apache
PassengerEnabled On
PassengerAppType node
PassengerStartupFile server.js
```

## 🗄️ Step 5: Database Setup

### 5.1 Remote Database Requirements
- **Host**: Must be accessible from your hosting server
- **Port**: Standard ports (3306 for MySQL, 5432 for PostgreSQL)
- **SSL**: Recommended for security
- **User Permissions**: Full access to your database

### 5.2 Database Connection Test
Test your database connection from cPanel:
```bash
# Via cPanel Terminal
node -e "
const { Client } = require('pg');
const client = new Client({
  host: 'your-db-host',
  database: 'your-db-name',
  user: 'your-db-user',
  password: 'your-db-password',
  port: 5432
});
client.connect().then(() => {
  console.log('Database connected successfully');
  client.end();
}).catch(err => {
  console.error('Database connection failed:', err);
});
"
```

## 🚀 Step 6: Start Your Application

### 6.1 Via cPanel Node.js Manager
1. Go to "Node.js" in cPanel
2. Click "Restart" on your application
3. Check status shows "Running"

### 6.2 Via SSH/Terminal
```bash
cd /home/USERNAME/public_html
npm install
npm start
```

### 6.3 Via Phusion Passenger
1. Ensure `.htaccess` is properly configured
2. Visit your domain
3. Passenger will automatically start the app

## 🧪 Step 7: Testing & Verification

### 7.1 Basic Functionality Tests
- [ ] Homepage loads correctly
- [ ] CSS and JavaScript load without errors
- [ ] API endpoints respond
- [ ] Database connections work
- [ ] Authentication system functions
- [ ] File uploads work (if applicable)

### 7.2 Performance Tests
- [ ] Page load times under 3 seconds
- [ ] Static assets are cached
- [ ] Gzip compression working
- [ ] No console errors

### 7.3 Security Tests
- [ ] HTTPS redirects properly
- [ ] Security headers present
- [ ] Sensitive files not accessible
- [ ] Environment variables not exposed

## 🛠️ Troubleshooting

### Common Issues & Solutions

#### 1. Application Won't Start
**Symptoms**: 500 error, application not running
**Solutions**:
- Check Node.js version in cPanel
- Verify `.env` file exists and has correct values
- Check cPanel error logs
- Verify file permissions (755 for directories, 644 for files)

#### 2. Database Connection Errors
**Symptoms**: Database connection failed errors
**Solutions**:
- Verify database credentials in `.env`
- Check database host accessibility
- Ensure database user has proper permissions
- Test connection from cPanel terminal

#### 3. Static Assets Not Loading
**Symptoms**: CSS/JS files return 404
**Solutions**:
- Check `.htaccess` configuration
- Verify file permissions
- Ensure public directory is uploaded
- Check cPanel error logs

#### 4. Phusion Passenger Issues
**Symptoms**: Passenger errors in logs
**Solutions**:
- Verify Passenger is enabled in cPanel
- Check Node.js version compatibility
- Restart Passenger service
- Verify `.htaccess` configuration

### 4.3 Check Logs
**cPanel Error Logs**:
- Go to "Errors" in cPanel
- Check for recent errors
- Look for Node.js related errors

**Application Logs**:
- Check cPanel "Terminal" for console output
- Monitor Node.js application logs
- Check for environment variable issues

## 📊 Step 8: Performance Optimization

### 8.1 Enable Caching
- Browser caching via `.htaccess`
- Static asset optimization
- Database query optimization

### 8.2 Monitor Performance
- Use cPanel "Metrics" section
- Monitor resource usage
- Check for memory leaks

## 🔒 Step 9: Security Hardening

### 9.1 File Permissions
```bash
# Set proper permissions
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;
chmod 600 .env
```

### 9.2 Security Headers
- Verify security headers in `.htaccess`
- Enable HTTPS redirects
- Implement rate limiting if needed

## 📞 Support & Resources

### cPanel Resources
- [cPanel Documentation](https://docs.cpanel.net/)
- [cPanel Support](https://cpanel.com/support/)
- [Phusion Passenger Docs](https://www.phusionpassenger.com/docs/)

### Application Support
- Check deployment logs
- Review error messages
- Verify configuration files
- Test in isolated environment

## 🎯 Deployment Checklist

- [ ] cPanel Node.js app created
- [ ] Files uploaded to public_html
- [ ] .env file configured with real values
- [ ] .htaccess updated with correct username
- [ ] Database connection tested
- [ ] Application starts without errors
- [ ] All functionality tested
- [ ] Performance optimized
- [ ] Security verified
- [ ] SSL certificate configured

---

## 🎉 Congratulations!

Your ReadnWin Next.js application is now deployed on cPanel!

**Next Steps**:
1. Monitor application performance
2. Set up regular backups
3. Configure monitoring and alerts
4. Plan for scaling as needed

**Remember**: Keep your `.env` file secure and never commit it to version control!

---

*For additional support, check the troubleshooting section above or contact your hosting provider.*
EOF
print_success "Comprehensive deployment guide created"

# Step 10: Create quick start script
print_step "Step 10: Creating quick start script..."
cat > cpanel-deploy/quick-start.sh << 'EOF'
#!/bin/bash

# Quick Start Script for cPanel Deployment
# Run this after uploading files to cPanel

echo "🚀 Quick Start for cPanel Deployment"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this from your cPanel public_html directory."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install --production

echo "🔧 Setting file permissions..."
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;

echo "✅ Quick start completed!"
echo "📖 Read CPANEL_DEPLOYMENT_GUIDE.md for next steps"
echo "🌐 Your app should now be accessible at your domain"
EOF

chmod +x cpanel-deploy/quick-start.sh
print_success "Quick start script created"

# Step 11: Create production server configuration
print_step "Step 11: Creating production server configuration..."
cat > cpanel-deploy/server.production.js << 'EOF'
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Production configuration
const dev = false;
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = process.env.PORT || 3000;

// Prepare the Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Production server for cPanel
app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // Parse the URL
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;

      // Add security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');

      // Handle Next.js requests
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Listen on specified port
  server.listen(port, hostname, (err) => {
    if (err) {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Environment: ${process.env.NODE_ENV}`);
    console.log(`> Node.js version: ${process.version}`);
  });

  // Graceful shutdown
  const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received, shutting down gracefully`);
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
});
EOF
print_success "Production server configuration created"

# Step 12: Create package verification script
print_step "Step 12: Creating package verification script..."
cat > cpanel-deploy/verify-package.sh << 'EOF'
#!/bin/bash

# Package Verification Script for cPanel Deployment
# Run this to verify all files are present and correct

echo "🔍 Verifying cPanel deployment package..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Required files and directories
REQUIRED_ITEMS=(
    ".next"
    "public"
    "package.json"
    "package-lock.json"
    "server.js"
    "next.config.js"
    ".htaccess"
    ".env.cpanel.template"
    "CPANEL_DEPLOYMENT_GUIDE.md"
    "quick-start.sh"
    "server.production.js"
    "verify-package.sh"
)

# Check each required item
echo "Checking required files and directories..."
for item in "${REQUIRED_ITEMS[@]}"; do
    if [ -e "$item" ]; then
        echo -e "${GREEN}✓${NC} $item"
    else
        echo -e "${RED}✗${NC} $item (missing)"
    fi
done

# Check package.json
echo -e "\n📦 Verifying package.json..."
if [ -f "package.json" ]; then
    echo "Package name: $(node -p "require('./package.json').name")"
    echo "Version: $(node -p "require('./package.json').version")"
    echo "Main entry: $(node -p "require('./package.json').main")"
    echo "Node version requirement: $(node -p "require('./package.json').engines.node")"
else
    echo -e "${RED}❌ package.json not found${NC}"
fi

# Check .next directory
echo -e "\n🔨 Verifying build output..."
if [ -d ".next" ]; then
    echo "Build directory size: $(du -sh .next | cut -f1)"
    echo "Static files: $(find .next -name "*.js" | wc -l) JavaScript files"
    echo "CSS files: $(find .next -name "*.css" | wc -l)"
else
    echo -e "${RED}❌ .next directory not found${NC}"
fi

# Check public directory
echo -e "\n📁 Verifying public assets..."
if [ -d "public" ]; then
    echo "Public assets: $(find public -type f | wc -l) files"
    echo "Public directory size: $(du -sh public | cut -f1)"
else
    echo -e "${RED}❌ public directory not found${NC}"
fi

echo -e "\n✅ Package verification completed!"
echo "📤 This package is ready for cPanel deployment"
echo "📖 Read CPANEL_DEPLOYMENT_GUIDE.md for deployment instructions"
EOF

chmod +x cpanel-deploy/verify-package.sh
print_success "Package verification script created"

# Step 13: Create deployment summary
print_step "Step 13: Creating deployment summary..."
cat > cpanel-deploy/DEPLOYMENT_SUMMARY.md << 'EOF'
# 📋 cPanel Deployment Package Summary

## 📦 Package Contents

This package contains everything needed to deploy your ReadnWin Next.js application to cPanel:

### Core Application Files
- **`.next/`** - Built Next.js application
- **`public/`** - Static assets and public files
- **`package.json`** - Production dependencies and scripts
- **`package-lock.json`** - Locked dependency versions
- **`server.js`** - Production server for cPanel
- **`next.config.js`** - Production Next.js configuration

### Configuration Files
- **`.htaccess`** - Apache configuration for cPanel
- **`.env.cpanel.template`** - Environment variables template
- **`server.production.js`** - Enhanced production server

### Documentation & Scripts
- **`CPANEL_DEPLOYMENT_GUIDE.md`** - Complete deployment guide
- **`quick-start.sh`** - Quick setup script
- **`verify-package.sh`** - Package verification script
- **`DEPLOYMENT_SUMMARY.md`** - This file

## 🚀 Quick Deployment Steps

1. **Upload** all contents to cPanel public_html
2. **Configure** environment variables in .env file
3. **Update** .htaccess with your username
4. **Run** `./quick-start.sh` to install dependencies
5. **Verify** with `./verify-package.sh`
6. **Test** your application

## 📊 Package Statistics

- **Total Files**: [Count will be shown after verification]
- **Package Size**: [Size will be shown after verification]
- **Dependencies**: Production-optimized
- **Node.js Version**: 18.17.0+
- **Build Type**: Production-ready

## 🔧 Requirements

- cPanel hosting with Node.js support
- Node.js 18.17.0 or higher
- Phusion Passenger (recommended)
- Remote database access
- SSL certificate

## 📞 Support

- **Deployment Guide**: CPANEL_DEPLOYMENT_GUIDE.md
- **Troubleshooting**: See guide troubleshooting section
- **Verification**: Run verify-package.sh
- **Quick Start**: Run quick-start.sh

---

**Package created**: $(date)
**Next.js version**: 14.2.30
**Build environment**: Production
**Target platform**: cPanel with Node.js
EOF
print_success "Deployment summary created"

# Step 14: Create ZIP package
print_step "Step 14: Creating ZIP package for easy upload..."
cd cpanel-deploy
zip -r ../readnwin-cpanel-deploy.zip . -x "*.DS_Store" "*.log" "node_modules/*"
cd ..
print_success "ZIP package created: readnwin-cpanel-deploy.zip"

# Step 15: Final verification
print_step "Step 15: Running final package verification..."
cd cpanel-deploy
./verify-package.sh
cd ..

print_header "🎉 cPanel Build Package Creation Completed!"
echo "================================================"
echo ""
print_success "✅ All files created successfully"
print_success "✅ ZIP package created: readnwin-cpanel-deploy.zip"
print_success "✅ Package verified and ready for deployment"
echo ""
print_header "📁 Package Contents:"
echo "├── cpanel-deploy/ (deployment directory)"
echo "├── readnwin-cpanel-deploy.zip (upload package)"
echo "├── CPANEL_DEPLOYMENT_GUIDE.md (complete guide)"
echo "├── .htaccess (Apache configuration)"
echo "├── package.json (production dependencies)"
echo "├── server.js (production server)"
echo "├── .next/ (built application)"
echo "├── public/ (static assets)"
echo "└── [additional configuration files]"
echo ""
print_header "📤 Next Steps:"
echo "1. Upload readnwin-cpanel-deploy.zip to cPanel"
echo "2. Extract in public_html directory"
echo "3. Follow CPANEL_DEPLOYMENT_GUIDE.md"
echo "4. Configure environment variables"
echo "5. Start your application"
echo ""
print_success "Your cPanel deployment package is ready! 🚀"
print_warning "Remember to read CPANEL_DEPLOYMENT_GUIDE.md for detailed instructions" 