# File Upload Path Configuration

## Overview
This document outlines the file upload path configuration for the E-Book Management & Reader System, ensuring compatibility with both local development and production environments.

## Environment-Specific Paths

### Local Development
- **Base Directory**: `./book-files` (relative to project root)
- **Full Path**: `/Users/techclub/Documents/js-projects/readnwinnext2/book-files`
- **Upload Directory**: `./public/uploads`
- **Cover Images**: `./public/uploads/covers`

### Production
- **Base Directory**: `/app/book-files`
- **Upload Directory**: `/app/media_root`
- **Cover Images**: `/app/media_root/covers`

## File Storage Structure

### Book Files
```
book-files/
├── [timestamp]_[random]_[filename].epub    # Original uploaded files
├── [timestamp]_[random]_[filename].pdf
└── [timestamp]_[random]_[filename].mobi
```

### Enhanced Structure (Future)
```
books/
├── epub/
│   └── [bookId]/
│       ├── original.epub                   # Original file
│       └── metadata.json                   # Extracted metadata
├── processed/
│   └── [bookId]/
│       ├── content/
│       │   ├── chapters/
│       │   └── index.html
│       └── assets/
└── temp/
    └── [uploadId]/
```

## URL Paths

### File Serving URLs
- **Book Files**: `/book-files/[filename]`
- **Cover Images**: `/uploads/covers/[filename]`
- **API Endpoint**: `/api/book-files/[filename]`

### Next.js Rewrite Rules
```javascript
// next.config.js
{
  source: '/book-files/:path*',
  destination: '/api/book-files/:path*'
}
```

## Implementation Details

### Enhanced File Upload Service
```typescript
// utils/enhanced-file-upload.ts
constructor() {
  const baseDir = process.env.NODE_ENV === 'production' 
    ? '/app/book-files' 
    : join(process.cwd(), 'book-files');
  
  this.config = {
    baseDir,
    epubDir: join(baseDir, 'epub'),
    processedDir: join(baseDir, 'processed'),
    tempDir: join(baseDir, 'temp')
  };
}
```

### Book Upload API
```typescript
// app/api/admin/books/route.ts
const bookFilesDir = process.env.NODE_ENV === 'production' 
  ? '/app/book-files' 
  : join(process.cwd(), 'book-files');

const filePath = join(bookFilesDir, filename);
const uploadedEbook = {
  success: true,
  file: {
    filename,
    path: `/book-files/${filename}`,  // URL path for serving
    size: buffer.length,
    mimetype: ebook_file.type,
    originalName
  }
};
```

## File Validation

### Supported Formats
- **EPUB**: `application/epub+zip`, `.epub`
- **PDF**: `application/pdf`, `.pdf`
- **MOBI**: `application/x-mobipocket-ebook`, `.mobi`

### File Size Limits
- **Ebook Files**: 50MB maximum
- **Cover Images**: 5MB maximum

## Security Considerations

### Directory Traversal Protection
- All file paths are validated to prevent access outside designated directories
- File names are sanitized to remove special characters
- Absolute path resolution is used to ensure files stay within bounds

### File Type Validation
- MIME type checking for uploaded files
- Extension-based fallback validation
- Whitelist approach for allowed file types

## Testing

### Path Verification
```bash
# Test file paths
node test-file-paths.js

# Test API endpoint
curl -X POST http://localhost:3000/api/admin/books \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Directory Structure
```bash
# Check local directories
ls -la book-files/
ls -la books/
ls -la public/uploads/

# Check production directories (in container)
ls -la /app/book-files/
ls -la /app/media_root/
```

## Migration Notes

### From Old System
- Existing files in `book-files/` remain accessible
- New uploads use the same directory structure
- URL paths remain unchanged for backward compatibility

### To Enhanced System
- New organized structure available in `books/` directory
- Gradual migration possible without breaking existing functionality
- Enhanced metadata extraction and content processing

## Troubleshooting

### Common Issues

1. **File Not Found (404)**
   - Check if file exists in correct directory
   - Verify URL path matches file location
   - Ensure Next.js rewrite rules are active

2. **Permission Denied**
   - Check directory permissions (755 for directories)
   - Verify user has write access to upload directories
   - Check Docker container permissions in production

3. **Path Resolution Errors**
   - Verify environment variables are set correctly
   - Check for absolute vs relative path issues
   - Ensure path separators are correct for OS

### Debug Commands
```bash
# Check environment
echo $NODE_ENV
pwd

# Check file existence
ls -la book-files/
find . -name "*.epub" -type f

# Test file serving
curl -I http://localhost:3000/book-files/test.epub
```

## Best Practices

1. **Always use environment-specific paths**
2. **Validate file types and sizes before upload**
3. **Sanitize file names to prevent security issues**
4. **Use absolute paths for file operations**
5. **Maintain backward compatibility with existing URLs**
6. **Test both local and production configurations**
7. **Monitor disk space usage in production**

## Future Enhancements

1. **CDN Integration**: Serve files from CDN for better performance
2. **File Compression**: Compress large files for storage efficiency
3. **Versioning**: Support multiple versions of the same book
4. **Backup Strategy**: Implement automated backup of uploaded files
5. **Analytics**: Track file access and download patterns 