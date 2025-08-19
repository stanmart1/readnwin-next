# Vercel Deployment Configuration

## Overview
This application is configured for deployment to Vercel with a persistent volume mounted at `/uploads` for file storage.

## File Storage Configuration

### Production Environment (Vercel)
- **Upload Directory**: `/uploads` (persistent volume)
- **Cover Images**: `/uploads/covers/`
- **Ebook Files**: `/uploads/books/`
- **Blog Images**: `/uploads/blog/`
- **Payment Proofs**: `/uploads/payment-proofs/`
- **Works Images**: `/uploads/works/`

### Development Environment
- **Upload Directory**: `public/uploads/` (local development)
- **Cover Images**: `public/uploads/covers/`
- **Ebook Files**: `public/uploads/books/`
- **Blog Images**: `public/uploads/blog/`
- **Payment Proofs**: `public/uploads/payment-proofs/`
- **Works Images**: `public/uploads/works/`

## Updated Files for Vercel Deployment

### 1. File Serving API (`app/api/uploads/[...path]/route.ts`)
```typescript
// Construct the file path - use /uploads for production (Vercel persistent volume), public/uploads for development
const isProduction = process.env.NODE_ENV === 'production';
const baseUploadPath = isProduction ? '/uploads' : join(process.cwd(), 'public', 'uploads');
const filePath = join(baseUploadPath, ...params.path);
```

### 2. Book Files API (`app/api/book-files/[...path]/route.ts`)
```typescript
// For Vercel deployment, convert to /uploads path
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  // In production, remove 'public/' prefix and use /uploads
  const relativePath = filePath.replace('public/uploads/', '');
  fullPath = join('/uploads', relativePath);
} else {
  // In development, use the full path
  fullPath = join(mediaRootDir, filePath);
}
```

### 3. File Upload Services
Both upload services are already configured for Vercel:
- `utils/file-upload.ts`: Uses `/uploads` in production
- `utils/enhanced-file-upload-service.ts`: Uses `/uploads` in production

## Vercel Configuration Requirements

### 1. Environment Variables
Ensure these environment variables are set in Vercel:
```bash
NODE_ENV=production
DB_HOST=your-database-host
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_PORT=5432
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

### 2. Persistent Volume Setup
Configure Vercel to mount a persistent volume at `/uploads`:
- This should be done through Vercel's volume management interface
- The volume should have sufficient storage for uploaded files
- Ensure proper permissions (read/write access)

### 3. Build Configuration
The application should build successfully with:
```bash
npm run build
```

## File Access URLs

### Production URLs
- **Cover Images**: `https://your-domain.vercel.app/uploads/covers/filename.jpg`
- **Ebooks**: `https://your-domain.vercel.app/uploads/books/bookId/filename.epub`
- **Blog Images**: `https://your-domain.vercel.app/uploads/blog/filename.png`
- **Payment Proofs**: `https://your-domain.vercel.app/uploads/payment-proofs/filename.jpg`
- **Works Images**: `https://your-domain.vercel.app/uploads/works/filename.jpg`

### Development URLs
- **Cover Images**: `http://localhost:3000/uploads/covers/filename.jpg`
- **Ebooks**: `http://localhost:3000/uploads/books/bookId/filename.epub`
- **Blog Images**: `http://localhost:3000/uploads/blog/filename.png`
- **Payment Proofs**: `http://localhost:3000/uploads/payment-proofs/filename.jpg`
- **Works Images**: `http://localhost:3000/uploads/works/filename.jpg`

## Testing the Deployment

### 1. Upload Test
1. Deploy to Vercel
2. Go to Admin Dashboard → Book Management
3. Upload a new book with cover image
4. Verify the image displays correctly
5. Check the file URL format

### 2. File Serving Test
1. Upload a test file
2. Try accessing it directly via URL
3. Verify the file serves correctly with proper content type

### 3. Debug Endpoint
Use the debug endpoint to verify uploads:
```
GET /api/debug/images
```

## Migration from Local Development

### 1. Database Path Updates
If you have existing records with local paths, update them:
```sql
-- Update cover image URLs from local to production paths
UPDATE books 
SET cover_image_url = REPLACE(cover_image_url, '/media_root/public/uploads/', '/uploads/')
WHERE cover_image_url LIKE '/media_root/public/uploads/%';
```

### 2. File Migration
If you have existing files in local development:
1. Upload them to the Vercel persistent volume
2. Update database records to point to new URLs
3. Verify all files are accessible

## Troubleshooting

### Common Issues

1. **404 Errors for Uploaded Files**
   - Check if persistent volume is properly mounted
   - Verify file paths in database
   - Check file serving API route

2. **Permission Errors**
   - Ensure Vercel has read/write access to `/uploads`
   - Check file permissions on uploaded files

3. **Build Errors**
   - Verify all environment variables are set
   - Check for any hardcoded local paths

### Debug Commands
```bash
# Check if uploads directory exists and has files
ls -la /uploads/

# Check specific upload type
ls -la /uploads/covers/

# Check file permissions
chmod 755 /uploads/covers/
```

## Security Considerations

1. **File Type Validation**: All uploads are validated for allowed file types
2. **File Size Limits**: Implemented size limits for different file types
3. **Path Traversal Protection**: File paths are sanitized to prevent directory traversal
4. **Content Type Headers**: Proper MIME types are set for served files

## Performance Optimization

1. **Caching**: Files are served with cache headers for 1 year
2. **Range Requests**: Large files support range requests for streaming
3. **Compression**: Consider implementing image compression for cover images
4. **CDN**: Consider using Vercel's CDN for static file serving

## Monitoring

1. **File Upload Monitoring**: Use the debug endpoint to monitor uploads
2. **Error Logging**: Check Vercel logs for upload errors
3. **Storage Monitoring**: Monitor persistent volume usage
4. **Performance Monitoring**: Track file serving response times
