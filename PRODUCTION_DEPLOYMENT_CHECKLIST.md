# Production Deployment Checklist - Book Upload System V2

## 🚨 **HTTP 500 Error Fix Guide**

### **Step 1: Environment Variables (Most Common Cause)**

Ensure these environment variables are set on your production server:

```bash
# Required for API routes to work
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=UEy5Y/QV4QsvGXMgqlDqe9wfmVkEDG1IDz8UjVuo6FA=

# Database Configuration
DB_HOST=149.102.159.118
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=S48lyoqo1mX7ytoiBvDZfCBB4TiCcGIU1rEdpu0NfBFP3V9q426PKDkGmV8aMD8b
DB_PORT=5432
```

### **Step 2: Database Connectivity**

1. **Test database connection from your server:**
   ```bash
   # Run this on your production server
   node debug-production-api.js
   ```

2. **Check if database is accessible:**
   ```bash
   # Test if you can reach the database
   telnet 149.102.159.118 5432
   ```

### **Step 3: Dependencies Installation**

Ensure all dependencies are installed in production:

```bash
# On your production server
npm install --production
# OR
npm ci --production
```

### **Step 4: Build Process**

Use the correct build process for SSR:

```bash
# Build for production SSR
npm run build:ssr
# OR manually:
NODE_ENV=production npm run build
```

### **Step 5: Book Upload System Setup**

Set up the new HTML-based book upload system:

```bash
# Create media_root directory structure
mkdir -p /app/media_root/books/html
mkdir -p /app/media_root/books/originals
mkdir -p /app/media_root/books/assets/images
mkdir -p /app/media_root/books/assets/fonts
mkdir -p /app/media_root/temp

# Set proper permissions
chown -R node:node /app/media_root
chmod -R 755 /app/media_root
chmod -R 775 /app/media_root/temp

# Run database migrations for new columns
node -e "
require('dotenv').config({ path: '.env.production' });
const { query } = require('./utils/database');
query('ALTER TABLE books ADD COLUMN IF NOT EXISTS html_file_path TEXT, ADD COLUMN IF NOT EXISTS processing_status VARCHAR(20) DEFAULT \'pending\';')
  .then(() => console.log('✅ Database migration completed'))
  .catch(console.error);
"
```

### **Step 6: Server Startup**

Start the server correctly:

```bash
# Use the production start command
npm run start:production
# OR
NODE_ENV=production node server.js
```

## 🧪 **Health Check Verification**

After deployment, verify the new book upload system is working:

```bash
# Check the health endpoint
curl https://yourdomain.com/api/health/production

# Expected response:
{
  "status": "healthy",
  "checks": {
    "database": true,
    "mediaRoot": true,
    "bookFiles": true,
    "tempDirectory": true,
    "databaseSchema": true
  }
}
```

## 🔧 **Quick Fix Commands**

### **For cPanel/Shared Hosting:**

1. **Upload files:**
   ```bash
   # Upload the entire production-package directory
   ```

2. **Set environment variables in cPanel:**
   - Go to cPanel → Environment Variables
   - Add all required variables

3. **Install dependencies:**
   ```bash
   cd production-package
   npm install --production
   ```

4. **Start server:**
   ```bash
   npm start
   ```

### **For VPS/Dedicated Server:**

1. **Clone and setup:**
   ```bash
   git clone your-repo
   cd readnwinnext2
   npm install
   ```

2. **Set environment variables:**
   ```bash
   cp .env.local .env.production
   # Edit .env.production with production values
   ```

3. **Build and start:**
   ```bash
   npm run build:ssr
   npm run start:production
   ```

## 🐛 **Debugging Steps**

### **1. Check Server Logs**

Look for error messages in your server logs:

```bash
# If using PM2
pm2 logs readnwin

# If using systemd
journalctl -u your-app-service -f

# If using cPanel
# Check error logs in cPanel → Error Logs
```

### **2. Test API Endpoint Directly**

Test the API endpoint from your server:

```bash
# Test locally on your server
curl http://localhost:3000/api/books

# Test with specific parameters
curl "http://localhost:3000/api/books?is_featured=true&limit=5"
```

### **3. Check Database Connection**

Run the diagnostic script:

```bash
node debug-production-api.js
```

### **4. Verify File Permissions**

Ensure files are readable:

```bash
ls -la utils/database.ts
ls -la utils/ecommerce-service.ts
ls -la app/api/books/route.ts
```

## 📋 **Common Issues & Solutions**

### **Issue 1: "Cannot find module"**
**Solution:** Install dependencies
```bash
npm install
```

### **Issue 2: "Database connection failed"**
**Solution:** Check environment variables and network connectivity

### **Issue 3: "Permission denied"**
**Solution:** Check file permissions
```bash
chmod 644 *.js *.ts
chmod 755 server.js
```

### **Issue 4: "Port already in use"**
**Solution:** Kill existing process or change port
```bash
lsof -ti:3000 | xargs kill -9
```

## 🚀 **Production Deployment Script**

Run this on your production server:

```bash
#!/bin/bash
# Production deployment script

echo "🚀 Starting production deployment..."

# 1. Set environment
export NODE_ENV=production

# 2. Install dependencies
npm ci --production

# 3. Build application
npm run build:production

# 4. Test database connection
node debug-production-api.js

# 5. Start server
npm run start:production
```

## 📞 **Emergency Fixes**

### **If API is completely down:**

1. **Restart the server:**
   ```bash
   pm2 restart readnwin
   # OR
   pkill -f "node server.js"
   npm run start:production
   ```

2. **Check if database is accessible:**
   ```bash
   node -e "
   const { Pool } = require('pg');
   const pool = new Pool({
     host: process.env.DB_HOST,
     database: process.env.DB_NAME,
     user: process.env.DB_USER,
     password: process.env.DB_PASSWORD,
     port: process.env.DB_PORT
   });
   pool.query('SELECT 1').then(() => console.log('DB OK')).catch(console.error);
   "
   ```

3. **Verify environment variables:**
   ```bash
   node -e "console.log('DB_HOST:', process.env.DB_HOST); console.log('NODE_ENV:', process.env.NODE_ENV);"
   ```

## ✅ **Verification Checklist**

- [ ] Environment variables are set correctly
- [ ] Database is accessible from production server
- [ ] All dependencies are installed
- [ ] Application builds successfully
- [ ] Server starts without errors
- [ ] API endpoint responds correctly
- [ ] Books load on homepage
- [ ] No console errors in browser

## 🆘 **Still Having Issues?**

1. **Run the diagnostic script:**
   ```bash
   node debug-production-api.js
   ```

2. **Check server logs for specific error messages**

3. **Test database connection manually**

4. **Verify all files are uploaded correctly**

5. **Contact your hosting provider if it's a server configuration issue** 