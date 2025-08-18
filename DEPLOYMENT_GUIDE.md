# 🚀 Local Book Storage System Deployment Guide

## 📋 **Pre-Deployment Checklist**

### **1. System Requirements**
- [ ] Node.js 18+ installed
- [ ] PostgreSQL database running
- [ ] Sufficient disk space (at least 10GB for media files)
- [ ] Proper file permissions on server

### **2. Environment Setup**
- [ ] Production environment variables configured
- [ ] Database connection established
- [ ] File system permissions set correctly

## 🔧 **Deployment Steps**

### **Step 1: Create Directory Structure**

```bash
# Create the new media root directory structure
mkdir -p /app/media_root/books
mkdir -p /app/media_root/public/uploads/covers
mkdir -p /app/media_root/books/temp
mkdir -p /app/media_root/processed

# Set proper permissions
chmod 755 /app/media_root
chmod 755 /app/media_root/books
chmod 755 /app/media_root/public/uploads/covers
chmod 755 /app/media_root/books/temp
chmod 755 /app/media_root/processed

# Set ownership (adjust user/group as needed)
chown -R www-data:www-data /app/media_root
```

### **Step 2: Deploy Updated Code**

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build the application
npm run build

# Restart the application
pm2 restart readnwin-next
```

### **Step 3: Run Migration Script**

```bash
# Run the migration script to move existing files
node scripts/migrate-book-storage.js

# Check migration results
ls -la /app/media_root/books/
```

### **Step 4: Update Database Paths**

```sql
-- Update existing book file paths to new structure
UPDATE books 
SET ebook_file_url = REPLACE(ebook_file_url, '/book-files/', '/media_root/books/')
WHERE ebook_file_url LIKE '/book-files/%';

-- Update cover image paths
UPDATE books 
SET cover_image_url = REPLACE(cover_image_url, '/uploads/', '/media_root/public/uploads/')
WHERE cover_image_url LIKE '/uploads/%';

-- Verify updates
SELECT id, title, ebook_file_url, cover_image_url 
FROM books 
WHERE ebook_file_url IS NOT NULL 
LIMIT 5;
```

### **Step 5: Test the System**

```bash
# Run the test script
node scripts/test-book-storage.js

# Test file upload through admin interface
# Test e-reader functionality
# Test user library access
```

## 🧪 **Testing Procedures**

### **1. File Upload Test**

1. **Access Admin Panel**: Navigate to `/admin`
2. **Upload Test Book**: 
   - Go to Book Management
   - Click "Add New Book"
   - Fill in required fields
   - Upload an EPUB file and cover image
   - Submit the form

3. **Verify Upload**:
   - Check if files are stored in `/app/media_root/books/[bookId]/`
   - Verify cover image is in `/app/media_root/public/uploads/covers/`
   - Check database records are updated correctly

### **2. E-Reader Test**

1. **Add Book to User Library**:
   - Purchase or add book to user account
   - Navigate to user library

2. **Test Reading**:
   - Click on book to open e-reader
   - Verify content loads correctly
   - Test chapter navigation
   - Check reading progress tracking

### **3. File Access Test**

```bash
# Test file serving endpoints
curl -I http://your-domain.com/api/book-files/books/[bookId]/[filename]
curl -I http://your-domain.com/api/book-files/public/uploads/covers/[filename]

# Test with authentication
curl -H "Authorization: Bearer [token]" \
     -I http://your-domain.com/api/book-files/books/[bookId]/[filename]
```

## 🔍 **Monitoring and Logs**

### **1. File System Monitoring**

```bash
# Monitor disk usage
df -h /app/media_root

# Check file counts
find /app/media_root/books -type f | wc -l
find /app/media_root/public/uploads/covers -type f | wc -l

# Monitor directory sizes
du -sh /app/media_root/books/*
du -sh /app/media_root/public/uploads/covers
```

### **2. Application Logs**

```bash
# Check application logs
pm2 logs readnwin-next

# Check specific error logs
grep -i "error" /var/log/readnwin-next/error.log
grep -i "upload" /var/log/readnwin-next/access.log
```

### **3. Database Monitoring**

```sql
-- Check book file statistics
SELECT 
  COUNT(*) as total_books,
  COUNT(ebook_file_url) as books_with_files,
  COUNT(cover_image_url) as books_with_covers
FROM books;

-- Check file path consistency
SELECT 
  ebook_file_url,
  COUNT(*) as count
FROM books 
WHERE ebook_file_url IS NOT NULL
GROUP BY ebook_file_url
HAVING COUNT(*) > 1;
```

## 🚨 **Troubleshooting**

### **Common Issues and Solutions**

#### **1. File Upload Failures**

**Symptoms**: Upload fails with permission errors
**Solution**:
```bash
# Check file permissions
ls -la /app/media_root/books/
ls -la /app/media_root/public/uploads/covers/

# Fix permissions if needed
chmod 755 /app/media_root/books
chmod 755 /app/media_root/public/uploads/covers
chown -R www-data:www-data /app/media_root
```

#### **2. File Not Found Errors**

**Symptoms**: 404 errors when accessing book files
**Solution**:
```bash
# Check if files exist
find /app/media_root -name "*.epub" -o -name "*.pdf"

# Check database paths
psql -c "SELECT id, title, ebook_file_url FROM books WHERE ebook_file_url IS NOT NULL;"

# Verify file paths match
ls -la /app/media_root/books/[bookId]/
```

#### **3. E-Reader Content Loading Issues**

**Symptoms**: E-reader shows "Content not found" errors
**Solution**:
```bash
# Check content parsing status
psql -c "SELECT id, title, parsing_status, parsing_error FROM books WHERE parsing_status != 'completed';"

# Re-parse failed books
# (Implement re-parsing logic if needed)
```

#### **4. Performance Issues**

**Symptoms**: Slow file loading or upload times
**Solution**:
```bash
# Check disk I/O
iostat -x 1

# Check memory usage
free -h

# Optimize file serving
# Consider implementing caching or CDN
```

## 🔄 **Rollback Plan**

### **If Issues Occur**

1. **Stop the Application**:
   ```bash
   pm2 stop readnwin-next
   ```

2. **Revert Code Changes**:
   ```bash
   git checkout HEAD~1
   npm install
   npm run build
   ```

3. **Restore Database Paths**:
   ```sql
   -- Revert file paths to old structure
   UPDATE books 
   SET ebook_file_url = REPLACE(ebook_file_url, '/media_root/books/', '/book-files/')
   WHERE ebook_file_url LIKE '/media_root/books/%';
   
   UPDATE books 
   SET cover_image_url = REPLACE(cover_image_url, '/media_root/public/uploads/', '/uploads/')
   WHERE cover_image_url LIKE '/media_root/public/uploads/%';
   ```

4. **Restart Application**:
   ```bash
   pm2 start readnwin-next
   ```

## 📊 **Performance Optimization**

### **1. File System Optimization**

```bash
# Enable file system caching
echo 'vm.dirty_ratio = 20' >> /etc/sysctl.conf
echo 'vm.dirty_background_ratio = 10' >> /etc/sysctl.conf
sysctl -p

# Optimize disk I/O
echo 'vm.swappiness = 10' >> /etc/sysctl.conf
sysctl -p
```

### **2. Nginx Configuration**

```nginx
# Add to nginx.conf for better file serving
location /media_root/ {
    alias /app/media_root/;
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header X-Content-Type-Options nosniff;
}

location /api/book-files/ {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### **3. Database Optimization**

```sql
-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_ebook_file_url ON books(ebook_file_url);
CREATE INDEX IF NOT EXISTS idx_books_cover_image_url ON books(cover_image_url);
CREATE INDEX IF NOT EXISTS idx_books_parsing_status ON books(parsing_status);

-- Analyze tables
ANALYZE books;
ANALYZE book_files;
```

## 🔒 **Security Considerations**

### **1. File Access Security**

- **Authentication**: All file access requires user authentication
- **Authorization**: Users can only access books in their library
- **Path Validation**: Prevents directory traversal attacks
- **File Type Validation**: Only allows approved file types

### **2. File System Security**

```bash
# Set restrictive permissions
chmod 750 /app/media_root/books
chmod 755 /app/media_root/public/uploads/covers

# Regular security audits
find /app/media_root -type f -exec file {} \; | grep -v "text\|image"
```

### **3. Monitoring Security**

```bash
# Monitor file access logs
tail -f /var/log/nginx/access.log | grep "/api/book-files/"

# Check for suspicious file access patterns
grep -i "\.\./" /var/log/nginx/access.log
```

## 📈 **Scaling Considerations**

### **1. Storage Scaling**

- **Disk Space**: Monitor and expand storage as needed
- **File Organization**: Consider subdirectories for large collections
- **Backup Strategy**: Implement regular backups of media files

### **2. Performance Scaling**

- **CDN Integration**: Consider using CDN for file serving
- **Load Balancing**: Distribute file serving across multiple servers
- **Caching**: Implement file caching for frequently accessed content

### **3. Database Scaling**

- **Connection Pooling**: Optimize database connections
- **Query Optimization**: Monitor and optimize slow queries
- **Partitioning**: Consider table partitioning for large datasets

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: Development Team
