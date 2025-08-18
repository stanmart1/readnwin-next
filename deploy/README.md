# ReadNwin Next.js Production Deployment Guide

This package contains everything needed to deploy your ReadNwin Next.js application to production with full SSR support.

## 📦 Package Contents

- `package.json` - Production dependencies and scripts
- `env.production.template` - Environment variables template
- `ecosystem.config.js` - PM2 process manager configuration
- `nginx.conf` - Nginx reverse proxy configuration
- `deploy.sh` - Automated deployment script
- `README.md` - This deployment guide

## 🚀 Quick Deployment

### Prerequisites
- Node.js 18+ installed
- npm installed
- Server with Ubuntu/CentOS/RHEL
- Domain name configured

### Step 1: Upload and Extract
```bash
# Upload the zip file to your server
scp readnwin-nextjs-production.zip user@your-server:/home/user/

# Extract the package
unzip readnwin-nextjs-production.zip
cd readnwin-nextjs-production
```

### Step 2: Run Deployment Script
```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment
./deploy.sh
```

### Step 3: Configure Environment
```bash
# Edit the environment file
nano .env.local

# Update these critical values:
# NEXTAUTH_URL=https://your-domain.com
# DB_HOST=149.102.159.118
# DB_USER=readnwin_readnwinuser
# DB_PASSWORD=izIoqVwU97i9niQPN3vj
```

### Step 4: Restart Application
```bash
# Restart with new environment
pm2 restart readnwin-nextjs
```

## 🔧 Manual Deployment Steps

If you prefer manual deployment:

### 1. Install Dependencies
```bash
npm install --production
```

### 2. Build Application
```bash
npm run build
```

### 3. Start with PM2
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 🌐 Nginx Configuration

### 1. Install Nginx
```bash
sudo apt update
sudo apt install nginx
```

### 2. Configure Nginx
```bash
# Copy the nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/readnwin
sudo ln -s /etc/nginx/sites-available/readnwin /etc/nginx/sites-enabled/

# Update the domain name in the config
sudo nano /etc/nginx/sites-available/readnwin

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Set up SSL (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring and Management

### PM2 Commands
```bash
# Check status
pm2 status

# View logs
pm2 logs readnwin-nextjs

# Restart application
pm2 restart readnwin-nextjs

# Stop application
pm2 stop readnwin-nextjs

# Delete application
pm2 delete readnwin-nextjs
```

### Health Checks
```bash
# Test database connection
curl http://localhost:3000/api/debug/database

# Test application health
curl http://localhost:3000/health
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Database Connection Errors
- Check `.env.local` file has correct database credentials
- Verify database server is accessible from your server
- Test connection: `PGPASSWORD="password" psql -h host -U user -d database`

#### 2. Port Already in Use
```bash
# Check what's using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>
```

#### 3. Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER /path/to/app
chmod +x deploy.sh
```

#### 4. Memory Issues
```bash
# Check memory usage
pm2 monit

# Increase memory limit in ecosystem.config.js
max_memory_restart: '2G'
```

### Log Files
- Application logs: `logs/combined.log`
- PM2 logs: `pm2 logs readnwin-nextjs`
- Nginx logs: `/var/log/nginx/error.log`

## 🔒 Security Checklist

- [ ] SSL certificate installed
- [ ] Firewall configured (allow ports 80, 443, 22)
- [ ] Environment variables secured
- [ ] Database credentials updated
- [ ] NEXTAUTH_SECRET changed
- [ ] File permissions set correctly
- [ ] Sensitive files protected

## 📈 Performance Optimization

### 1. Enable Gzip Compression
Already configured in nginx.conf

### 2. Static File Caching
Already configured for `/_next/static/`

### 3. Database Connection Pooling
Configured in `utils/database.ts`

### 4. PM2 Cluster Mode
Enabled in ecosystem.config.js

## 🔄 Updates and Maintenance

### Update Application
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build application
npm run build

# Restart with PM2
pm2 restart readnwin-nextjs
```

### Backup Database
```bash
# Create backup
pg_dump -h 149.102.159.118 -U readnwin_readnwinuser -d readnwin_readnwindb > backup.sql

# Restore backup
psql -h 149.102.159.118 -U readnwin_readnwinuser -d readnwin_readnwindb < backup.sql
```

## 📞 Support

If you encounter issues:
1. Check the logs: `pm2 logs readnwin-nextjs`
2. Test database connection: `/api/debug/database`
3. Verify environment variables are set correctly
4. Ensure all prerequisites are installed

## 🎯 Success Indicators

Your deployment is successful when:
- ✅ Application starts without errors
- ✅ Database connection test passes
- ✅ Website loads on your domain
- ✅ SSL certificate is working
- ✅ PM2 shows healthy status
- ✅ No errors in logs 