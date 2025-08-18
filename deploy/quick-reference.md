# 🚀 Quick Reference - Server Management Interface

## 📋 **Deployment Steps**

### **1. Upload & Extract**
- Upload `readnwin-nextjs-production.zip` to your server
- Extract the package to your web directory

### **2. Environment Setup**
Create `.env.local` file with:
```bash
NEXTAUTH_SECRET=Vfv5Z4Yco3EWLl55CT8qeKMQbybWmqtYLK9Eq0ehBD8=
NEXTAUTH_URL=https://your-domain.com
DB_USER=readnwin_readnwinuser
DB_HOST=149.102.159.118
DB_NAME=readnwin_readnwindb
DB_PORT=5432
DB_PASSWORD=izIoqVwU97i9niQPN3vj
NODE_ENV=production
```

### **3. Run Commands in Order**
```bash
npm install --production
npm run build
npm start
```

## 🔍 **Verification**

### **Test Database Connection:**
Visit: `http://your-domain.com/api/debug/database`

**Expected Response:**
```json
{
  "success": true,
  "message": "Database connection test successful",
  "data": {
    "booksTableExists": true,
    "booksFound": 6
  }
}
```

### **Test Main APIs:**
- Books: `http://your-domain.com/api/books?page=1&limit=12&is_featured=true`
- Reviews: `http://your-domain.com/api/reviews/featured?limit=10`

## 🛠️ **Troubleshooting**

### **If 500 Errors:**
1. Check `.env.local` file exists and has correct database credentials
2. Restart application: `npm start`
3. Test database connection manually

### **If Build Fails:**
1. Clear cache: `rm -rf .next`
2. Reinstall: `npm install --production`
3. Rebuild: `npm run build`

### **If Port in Use:**
Modify `package.json` start script:
```json
"start": "next start -H 0.0.0.0 -p 3001"
```

## 📊 **Success Indicators**
- ✅ `npm install --production` completes
- ✅ `npm run build` completes
- ✅ `npm start` starts application
- ✅ `/api/debug/database` returns success
- ✅ Main APIs return data (not 500 errors)
- ✅ Website loads on your domain

## 🔄 **Updates**
```bash
npm install --production
npm run build
npm start
```

## 📞 **Support**
- Check server management interface logs
- Test database connection manually
- Verify environment variables
- Ensure Node.js 18+ is installed 