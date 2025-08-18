# ReadNwin Next.js - Server Management Interface Deployment Guide

This guide is specifically for servers with built-in Node.js management interfaces that can handle `npm install` and `npm run build`.

## 🚀 **Simplified Deployment Process**

### **Step 1: Upload the Package**
Upload `readnwin-nextjs-production.zip` to your server using your preferred method (FTP, SCP, or server file manager).

### **Step 2: Extract the Package**
Extract the zip file in your server's web directory or application folder.

### **Step 3: Use Server Management Interface**

#### **A. Install Dependencies**
In your server's Node.js management interface:
```bash
npm install --production
```

#### **B. Build the Application**
```bash
npm run build
```

#### **C. Start the Application**
```bash
npm start
```

## 🔧 **Environment Configuration**

### **Create/Update Environment File**
Create a `.env.local` file in your application root with these settings:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=Vfv5Z4Yco3EWLl55CT8qeKMQbybWmqtYLK9Eq0ehBD8=
NEXTAUTH_URL=https://your-domain.com

# Database Configuration - Production Database
DB_USER=readnwin_readnwinuser
DB_HOST=149.102.159.118
DB_NAME=readnwin_readnwindb
DB_PORT=5432
DB_PASSWORD=izIoqVwU97i9niQPN3vj

# Payment Gateway Configuration
FLUTTER_WAVE_HASH=19415f8daa7ad132cd7680f7  
RAVE_LIVE_PUBLIC_KEY=FLWPUBK-9856cdb89cb82f5ce5de30877c7b3a89-X  
RAVE_LIVE_SECRET_KEY=FLWSECK-19415f8daa7a8fd3f74b0d71874cfad1-197781a61d6vt-X  

# Email Configuration
RESEND_API_KEY=re_iZPZgHqW_6Xk7zMMqUGMY7hWFcj8DVge6
SMTP_HOST=mail.readnwin.com
SMTP_PORT=587
SMTP_USER=portal@readnwin.com
SMTP_PASS=Lagsalemailpass@2025

# Environment
NODE_ENV=production

# Timezone
TZ=Africa/Lagos
```

## 📋 **Server Management Interface Commands**

### **Initial Setup:**
1. **Install Dependencies:**
   ```bash
   npm install --production
   ```

2. **Build Application:**
   ```bash
   npm run build
   ```

3. **Start Application:**
   ```bash
   npm start
   ```

### **Updates and Maintenance:**
1. **Update Dependencies:**
   ```bash
   npm install --production
   ```

2. **Rebuild Application:**
   ```bash
   npm run build
   ```

3. **Restart Application:**
   ```bash
   npm start
   ```

## 🔍 **Verification Steps**

### **1. Check Application Status**
After starting the application, verify it's running:
```bash
curl http://localhost:3000/api/debug/database
```

### **2. Test Database Connection**
Visit: `http://your-domain.com/api/debug/database`

Expected response:
```json
{
  "success": true,
  "message": "Database connection test successful",
  "data": {
    "connection": { "current_time": "...", "version": "PostgreSQL 17.5..." },
    "booksTableExists": true,
    "booksFound": 6,
    "environment": { ... }
  }
}
```

### **3. Test Main APIs**
- **Books API:** `http://your-domain.com/api/books?page=1&limit=12&is_featured=true`
- **Reviews API:** `http://your-domain.com/api/reviews/featured?limit=10`
- **Health Check:** `http://your-domain.com/health`

## 🛠️ **Troubleshooting**

### **Common Issues:**

#### **1. Port Already in Use**
If port 3000 is already in use, modify the start script in `package.json`:
```json
{
  "scripts": {
    "start": "next start -H 0.0.0.0 -p 3001"
  }
}
```

#### **2. Database Connection Errors**
- Verify `.env.local` file exists and has correct database credentials
- Check if your server can reach the database server (149.102.159.118:5432)
- Test connection manually: `PGPASSWORD="izIoqVwU97i9niQPN3vj" psql -h 149.102.159.118 -U readnwin_readnwinuser -d readnwin_readnwindb`

#### **3. Build Errors**
- Ensure Node.js version is 18+ (`node --version`)
- Clear cache: `rm -rf .next && npm run build`
- Check for missing dependencies

#### **4. Environment Variables Not Loading**
- Ensure `.env.local` file is in the application root
- Restart the application after changing environment variables
- Check file permissions: `chmod 600 .env.local`

## 📊 **Performance Optimization**

### **For Server Management Interfaces:**

1. **Enable Caching:**
   - Static files are automatically cached in `.next/static/`
   - API responses can be cached at the server level

2. **Memory Management:**
   - Monitor memory usage in your server management interface
   - Restart application if memory usage is high

3. **Log Management:**
   - Check application logs in your server management interface
   - Monitor error logs for issues

## 🔄 **Update Process**

### **When Updating the Application:**

1. **Upload new files** (or pull from git if using version control)

2. **Install dependencies:**
   ```bash
   npm install --production
   ```

3. **Build application:**
   ```bash
   npm run build
   ```

4. **Restart application:**
   ```bash
   npm start
   ```

5. **Verify deployment:**
   ```bash
   curl http://localhost:3000/api/debug/database
   ```

## 🎯 **Success Indicators**

Your deployment is successful when:
- ✅ `npm install --production` completes without errors
- ✅ `npm run build` completes successfully
- ✅ `npm start` starts the application
- ✅ Database connection test passes (`/api/debug/database`)
- ✅ Main APIs return data instead of 500 errors
- ✅ Website loads on your domain

## 📞 **Support**

If you encounter issues:
1. Check the logs in your server management interface
2. Test database connection manually
3. Verify environment variables are set correctly
4. Ensure all prerequisites are installed (Node.js 18+)

## 🚀 **Quick Start Checklist**

- [ ] Upload `readnwin-nextjs-production.zip` to server
- [ ] Extract the package
- [ ] Create `.env.local` with correct database credentials
- [ ] Run `npm install --production`
- [ ] Run `npm run build`
- [ ] Run `npm start`
- [ ] Test database connection: `/api/debug/database`
- [ ] Verify main APIs are working
- [ ] Configure domain and SSL (if needed) 