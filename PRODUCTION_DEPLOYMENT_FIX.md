# Production Deployment Fix Guide

## Issues Identified

Based on the deployment logs, the main issues causing the deployment failure were:

1. **Puppeteer Dependencies**: The application uses Puppeteer which requires Chrome/Chromium and system dependencies
2. **Build Process Failure**: Docker build was failing during system package installation
3. **Missing System Dependencies**: The original Dockerfile didn't include necessary packages for Puppeteer
4. **Configuration Conflicts**: next.config.js had conflicting Puppeteer configurations

## Fixes Applied

### 1. Updated Dockerfile

**Problem**: Alpine Linux with Chromium was causing build failures
**Solution**: Switched to `node:18-slim` with Google Chrome installation

```dockerfile
# Use a more stable base image for production
FROM node:18-slim AS base

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

# Set Puppeteer environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
```

### 2. Fixed next.config.js

**Problem**: Conflicting Puppeteer configurations causing build issues
**Solution**: Properly configured webpack to handle Puppeteer only on server-side

```javascript
// Only ignore puppeteer on client-side builds
if (!isServer) {
  config.plugins.push(
    new webpack.IgnorePlugin({
      resourceRegExp: /^puppeteer$/,
      contextRegExp: /node_modules/,
    })
  )
}
```

### 3. Environment Variables Required

The application requires these environment variables for production:

```bash
# Database Configuration
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432

# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_nextauth_secret
JWT_SECRET=your_jwt_secret

# Email Configuration
RESEND_API_KEY=your_resend_api_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Other Required Variables
NODE_ENV=production
```

## Deployment Steps

### 1. Set Environment Variables

Ensure all required environment variables are set in your deployment platform (Railway, Vercel, etc.)

### 2. Build and Deploy

The updated Dockerfile should now build successfully. The key improvements:

- Uses `node:18-slim` instead of Alpine
- Installs Google Chrome instead of Chromium
- Proper Puppeteer environment variables
- Non-root user for security

### 3. Verify Deployment

After deployment, verify:

1. **Database Connection**: Check if the app can connect to the database
2. **Puppeteer Functionality**: Test any features that use Puppeteer
3. **API Routes**: Ensure all API endpoints are working
4. **Static Assets**: Verify images and other static files load correctly

## Troubleshooting

### If Build Still Fails

1. **Check Environment Variables**: Ensure all required variables are set
2. **Memory Issues**: Increase build memory if needed
3. **Network Issues**: Ensure the build environment can download packages

### If App Fails to Start

1. **Database Connection**: Verify database credentials and connectivity
2. **Port Configuration**: Ensure the app is binding to the correct port
3. **File Permissions**: Check if the non-root user has proper permissions

### If Puppeteer Fails

1. **Chrome Installation**: Verify Chrome is properly installed
2. **User Permissions**: Ensure the pptruser has proper permissions
3. **Environment Variables**: Check PUPPETEER_EXECUTABLE_PATH

## Monitoring

After successful deployment, monitor:

- Application logs for errors
- Database connection stability
- Puppeteer functionality
- API response times
- Memory usage

## Rollback Plan

If issues persist:

1. Revert to the previous working Docker image
2. Check environment variable configuration
3. Verify database connectivity
4. Test locally with the same configuration

## Success Criteria

Deployment is successful when:

- ✅ Docker build completes without errors
- ✅ Application starts and responds to requests
- ✅ Database connections are established
- ✅ All API endpoints return expected responses
- ✅ Puppeteer functionality works (if used)
- ✅ Static assets load correctly 