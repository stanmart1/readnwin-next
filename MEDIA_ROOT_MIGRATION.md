# Media Root Migration Summary

## Overview
The application has been updated to use `/app/media_root` as the primary location for storing uploaded files on the remote server, replacing the previous `public/uploads` directory structure.

## Changes Made

### 1. File Upload Services Updated

#### Enhanced File Upload Service (`utils/enhanced-file-upload.ts`)
- **Constructor**: Changed default upload directory from `'public/uploads'` to `'/app/media_root'`
- **Path Construction**: Updated to use absolute paths instead of relative paths
- **File URLs**: Maintained the same URL structure for frontend compatibility

#### File Upload Service (`utils/file-upload.ts`)
- **Constructor**: Changed default upload directory from `'public/uploads'` to `'/app/media_root'`
- **Path Construction**: Updated to use absolute paths

### 2. API Routes Updated

#### File Serving API (`app/api/uploads/[...path]/route.ts`)
- **File Path**: Changed from `join(process.cwd(), 'public', 'uploads', ...params.path)` to `join('/app/media_root', ...params.path)`
- **URL Structure**: Maintained `/uploads/[type]/filename` for frontend compatibility

#### Debug API (`app/api/debug/images/route.ts`)
- **Directory Paths**: Updated all directory paths to use `/app/media_root`
- **Subdirectories**: Updated paths for covers, ebooks, blog, payment-proofs

#### Blog Image Upload (`app/api/admin/blog/[id]/images/route.ts`)
- **Upload Directory**: Changed from `join(process.cwd(), 'public', 'uploads', 'blog')` to `join('/app/media_root', 'blog')`

#### Payment Proof Upload (`app/api/payment/bank-transfer/upload-proof/route.ts`)
- **Upload Directory**: Changed from `join(process.cwd(), 'public', 'uploads', 'payment-proofs')` to `join('/app/media_root', 'payment-proofs')`

#### Admin Image Upload (`app/api/admin/upload-image/route.ts`)
- **Upload Directory**: Changed from `join(process.cwd(), 'public', 'images', 'uploads')` to `join('/app/media_root', 'about-images')`
- **URL Structure**: Updated from `/images/uploads/` to `/uploads/about-images/`

#### Payment Proofs API (`app/api/payment-proofs/[filename]/route.ts`)
- **File Path**: Changed from `join(process.cwd(), 'public', 'uploads', 'payment-proofs', filename)` to `join('/app/media_root', 'payment-proofs', filename)`

### 3. Next.js Configuration
- **Rewrites**: Maintained existing rewrite rule for `/uploads/:path*` → `/api/uploads/:path*`
- **URL Compatibility**: Frontend URLs remain unchanged for seamless user experience

## Directory Structure

### New Media Root Structure
```
/app/media_root/
├── covers/           # Book cover images
├── ebooks/           # Ebook files (PDF, EPUB, MOBI)
├── blog/             # Blog post images
├── payment-proofs/   # Payment proof documents
└── about-images/     # About section images
```

### URL Mapping
| File Type | Server Path | Frontend URL |
|-----------|-------------|--------------|
| Book Covers | `/app/media_root/covers/` | `/uploads/covers/` |
| Ebook Files | `/app/media_root/ebooks/` | `/uploads/ebooks/` |
| Blog Images | `/app/media_root/blog/` | `/uploads/blog/` |
| Payment Proofs | `/app/media_root/payment-proofs/` | `/uploads/payment-proofs/` |
| About Images | `/app/media_root/about-images/` | `/uploads/about-images/` |

## Deployment Requirements

### 1. Server Setup
The remote server must have the `/app/media_root` directory created with proper permissions:

```bash
# Run the setup script on the remote server
sudo ./scripts/setup-media-root.sh
```

### 2. Directory Creation
```bash
# Manual setup (alternative to script)
sudo mkdir -p /app/media_root/{covers,ebooks,blog,payment-proofs,about-images}
sudo chown -R node:node /app/media_root  # Adjust user as needed
sudo chmod -R 755 /app/media_root
sudo chmod -R 775 /app/media_root/*/     # Make subdirectories writable
```

### 3. Permissions
- **Owner**: Application user (node, www-data, nginx, etc.)
- **Permissions**: 755 for main directory, 775 for subdirectories
- **Write Access**: Application must be able to create and write files

## Testing

### 1. Configuration Test
Run the configuration test script:
```bash
node test-media-root-config.js
```

### 2. File Upload Test
1. Log in as admin user
2. Navigate to Admin Dashboard → Book Management
3. Try uploading a book with cover image and ebook file
4. Check that files are stored in `/app/media_root/`
5. Verify files are accessible via `/uploads/` URLs

### 3. Debug Endpoint
Check the debug endpoint to verify file serving:
```
GET /api/debug/images
```

## Benefits

### 1. Security
- **Isolation**: Uploads are stored outside the application directory
- **Permissions**: Dedicated directory with specific permissions
- **Access Control**: Better control over file access

### 2. Scalability
- **Storage**: Can be mounted on separate storage volumes
- **Backup**: Easier to backup and manage separately
- **Performance**: Can be optimized independently

### 3. Maintenance
- **Cleanup**: Easier to manage and clean up uploaded files
- **Monitoring**: Better monitoring and logging capabilities
- **Migration**: Easier to migrate or move uploads

## Rollback Plan

If issues arise, the application can be rolled back by:

1. **Revert Code Changes**: Restore the original file paths in all updated files
2. **Update Environment**: Set environment variable to use old paths
3. **Migrate Files**: Move files from `/app/media_root/` back to `public/uploads/`

## Monitoring

### 1. File System Monitoring
- Monitor disk usage in `/app/media_root/`
- Set up alerts for disk space thresholds
- Monitor file count and growth patterns

### 2. Application Monitoring
- Monitor upload success/failure rates
- Check application logs for file access errors
- Monitor API response times for file serving

### 3. Security Monitoring
- Monitor file access patterns
- Check for unauthorized file access attempts
- Monitor file type validation

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Check directory ownership and permissions
   - Verify application user has write access
   - Check SELinux/AppArmor policies

2. **File Not Found**
   - Verify files are being uploaded to correct location
   - Check API route configuration
   - Verify Next.js rewrite rules

3. **Upload Failures**
   - Check application logs for detailed error messages
   - Verify disk space availability
   - Check file size and type validation

### Debug Commands
```bash
# Check directory structure
ls -la /app/media_root/

# Check permissions
ls -ld /app/media_root/
ls -ld /app/media_root/*/

# Test write permissions
sudo -u node touch /app/media_root/test.txt

# Check application logs
tail -f /var/log/application.log
```

## Next Steps

1. **Deploy Changes**: Deploy the updated code to production
2. **Run Setup Script**: Execute the media root setup script
3. **Test Uploads**: Verify file upload functionality
4. **Monitor**: Set up monitoring and alerting
5. **Document**: Update deployment documentation
6. **Backup**: Ensure backup strategy covers the new location 