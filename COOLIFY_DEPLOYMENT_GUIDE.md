# Coolify Deployment Guide for ReadNWin Next.js App

## 🚀 Overview

This guide will help you deploy your ReadNWin Next.js application to Coolify. The app has been configured with Docker for optimal deployment.

## 📋 Prerequisites

- Coolify instance set up and running
- Git repository with your code
- Database credentials (PostgreSQL)
- Environment variables ready

## 🔧 Pre-Deployment Setup

### 1. Environment Variables

Create a `.env.production` file with the following variables:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-domain.com

# Database Configuration
DB_HOST=your-database-host
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_PORT=5432

# Payment Gateway Configuration
FLUTTER_WAVE_HASH=your-flutterwave-hash
RAVE_LIVE_PUBLIC_KEY=your-rave-public-key
RAVE_LIVE_SECRET_KEY=your-rave-secret-key

# Email Configuration
RESEND_API_KEY=your-resend-api-key
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password

# Environment
NODE_ENV=production

# Timezone
TZ=Africa/Lagos
```

### 2. Database Setup

Ensure your PostgreSQL database is accessible from Coolify's servers:

```sql
-- Create database if not exists
CREATE DATABASE readnwin_readnwindb;

-- Create user if not exists
CREATE USER readnwin_readnwinuser WITH PASSWORD 'your-password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE readnwin_readnwindb TO readnwin_readnwinuser;
```

## 🐳 Docker Configuration

The app is configured with:

- **Dockerfile**: Multi-stage build for optimized production image
- **docker-compose.yml**: For local testing and Coolify deployment
- **Health Check**: `/api/health` endpoint for monitoring
- **Standalone Output**: Next.js configured for containerized deployment

## 📦 Coolify Deployment Steps

### Step 1: Connect Repository

1. Log into your Coolify dashboard
2. Go to **Applications** → **New Application**
3. Select **Source: Git Repository**
4. Connect your Git provider (GitHub, GitLab, etc.)
5. Select your repository: `readnwinnext2`

### Step 2: Configure Application

#### Basic Settings:
- **Name**: `readnwin-app`
- **Build Pack**: `Docker`
- **Port**: `3000`
- **Branch**: `main` (or your production branch)

#### Build Configuration:
- **Dockerfile Path**: `Dockerfile`
- **Docker Compose**: `docker-compose.yml`

### Step 3: Environment Variables

Add all environment variables in Coolify's dashboard:

```bash
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
DB_HOST=your-database-host
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_PORT=5432
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
FLUTTER_WAVE_HASH=your-flutterwave-hash
RAVE_LIVE_PUBLIC_KEY=your-rave-public-key
RAVE_LIVE_SECRET_KEY=your-rave-secret-key
RESEND_API_KEY=your-resend-api-key
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
TZ=Africa/Lagos
```

### Step 4: Domain Configuration

1. **Custom Domain**: Add your domain (e.g., `app.readnwin.com`)
2. **SSL Certificate**: Enable automatic SSL with Let's Encrypt
3. **Force HTTPS**: Enable redirect from HTTP to HTTPS

### Step 5: Health Check Configuration

Configure health check in Coolify:

- **Health Check Path**: `/api/health`
- **Health Check Interval**: `30s`
- **Health Check Timeout**: `10s`
- **Health Check Retries**: `3`

### Step 6: Resource Limits

Set appropriate resource limits:

- **CPU**: `1` core
- **Memory**: `1GB` RAM
- **Storage**: `10GB`

## 🔄 Deployment Process

### Initial Deployment:

1. Click **Deploy** in Coolify dashboard
2. Monitor the build logs for any errors
3. Wait for the health check to pass
4. Verify the application is accessible

### Build Process:

The Docker build will:
1. Install dependencies
2. Build the Next.js application
3. Create optimized production image
4. Start the application with health monitoring

## 🧪 Testing Deployment

### 1. Health Check
```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "database": "connected",
  "version": "1.0.0"
}
```

### 2. Application Test
```bash
curl https://your-domain.com/api/books
```

### 3. Database Connection Test
```bash
curl https://your-domain.com/api/books?limit=1
```

## 🔍 Troubleshooting

### Common Issues:

#### 1. Build Failures
- Check Dockerfile syntax
- Verify all dependencies in package.json
- Ensure .dockerignore excludes unnecessary files

#### 2. Database Connection Issues
- Verify database credentials
- Check network connectivity
- Ensure database is accessible from Coolify servers

#### 3. Environment Variable Issues
- Double-check all environment variables in Coolify
- Verify NEXTAUTH_URL matches your domain
- Ensure database connection string is correct

#### 4. Health Check Failures
- Check application logs in Coolify
- Verify database connectivity
- Ensure all required services are running

### Debug Commands:

```bash
# Check application logs
docker logs <container-id>

# Test database connection
docker exec <container-id> node -e "
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

# Check environment variables
docker exec <container-id> env | grep -E "(DB_|NEXTAUTH_|NODE_ENV)"
```

## 🔄 Continuous Deployment

### Automatic Deployments:

1. **Enable Auto Deploy**: In Coolify, enable automatic deployments on push to main branch
2. **Branch Protection**: Set up branch protection rules in your Git provider
3. **Testing**: Ensure all tests pass before deployment

### Manual Deployments:

1. Go to Coolify dashboard
2. Select your application
3. Click **Redeploy**
4. Monitor build and deployment logs

## 📊 Monitoring

### Coolify Dashboard:
- Application status
- Resource usage
- Logs and errors
- Health check status

### Application Monitoring:
- Health check endpoint: `/api/health`
- Application logs via Coolify
- Database connection status

## 🔒 Security Considerations

1. **Environment Variables**: Never commit sensitive data to Git
2. **Database Access**: Use least privilege principle
3. **SSL/TLS**: Always use HTTPS in production
4. **Regular Updates**: Keep dependencies updated
5. **Backup Strategy**: Regular database backups

## 📈 Scaling

### Horizontal Scaling:
- Coolify supports multiple instances
- Configure load balancing
- Monitor resource usage

### Vertical Scaling:
- Increase CPU and memory limits
- Monitor performance metrics
- Optimize application code

## 🆘 Support

If you encounter issues:

1. Check Coolify documentation
2. Review application logs
3. Test locally with Docker Compose
4. Contact Coolify support if needed

## ✅ Deployment Checklist

- [ ] Environment variables configured
- [ ] Database accessible from Coolify
- [ ] Domain and SSL configured
- [ ] Health check passing
- [ ] Application responding correctly
- [ ] Database queries working
- [ ] Email functionality tested
- [ ] Payment gateway tested
- [ ] Monitoring configured
- [ ] Backup strategy in place

## 🎉 Success!

Once deployed successfully, your ReadNWin application will be:
- Running in a containerized environment
- Automatically scaled and monitored
- Secured with SSL/TLS
- Continuously deployed from your Git repository
- Health monitored and auto-restarted if needed 