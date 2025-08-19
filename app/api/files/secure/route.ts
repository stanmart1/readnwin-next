import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import StorageService from '@/lib/services/StorageService';
import path from 'path';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');
    const expires = searchParams.get('expires');
    const token = searchParams.get('token');
    
    if (!filePath || !expires || !token) {
      return NextResponse.json({ error: 'Invalid file access parameters' }, { status: 400 });
    }

    const decodedPath = decodeURIComponent(filePath);
    
    console.log(`Serving secure file: ${decodedPath}`);

    // Verify secure URL
    if (!StorageService.verifySecureUrl(decodedPath, expires, token)) {
      return NextResponse.json({ error: 'Invalid or expired file access token' }, { status: 403 });
    }

    // Validate file path is within allowed storage areas
    if (!StorageService.validateFilePath(decodedPath)) {
      return NextResponse.json({ error: 'Access denied to file location' }, { status: 403 });
    }

    // Check if file exists on persistent volume
    const fileInfo = await StorageService.getFileInfo(decodedPath);
    if (!fileInfo.exists || !fileInfo.isFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Additional access control based on file type and user permissions
    const accessGranted = await checkFileAccess(session.user.id, decodedPath);
    if (!accessGranted) {
      return NextResponse.json({ error: 'Access denied to this file' }, { status: 403 });
    }

    // Get file stats
    const stats = await stat(decodedPath);
    const fileSize = stats.size;
    const lastModified = stats.mtime;

    // Determine content type
    const ext = path.extname(decodedPath).toLowerCase();
    const contentType = getContentType(ext);

    // Handle range requests for large files (streaming)
    const range = request.headers.get('range');
    
    if (range) {
      return handleRangeRequest(decodedPath, range, fileSize, contentType, lastModified);
    }

    // Stream the entire file
    const stream = createReadStream(decodedPath);
    
    // Convert Node.js stream to Web Stream
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        
        stream.on('end', () => {
          controller.close();
        });
        
        stream.on('error', (error) => {
          console.error('Stream error:', error);
          controller.error(error);
        });
      },
      
      cancel() {
        stream.destroy();
      }
    });

    // Set appropriate headers
    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Length': fileSize.toString(),
      'Last-Modified': lastModified.toUTCString(),
      'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
      'Accept-Ranges': 'bytes',
    });

    // Set content disposition for downloads
    if (shouldForceDownload(ext)) {
      const filename = path.basename(decodedPath);
      headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    }

    return new NextResponse(webStream, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Error serving secure file:', error);
    return NextResponse.json(
      { 
        error: 'Failed to serve file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle range requests for streaming large files
async function handleRangeRequest(
  filePath: string,
  rangeHeader: string,
  fileSize: number,
  contentType: string,
  lastModified: Date
): Promise<NextResponse> {
  const ranges = parseRangeHeader(rangeHeader, fileSize);
  
  if (!ranges || ranges.length === 0) {
    return NextResponse.json({ error: 'Invalid range request' }, { status: 416 });
  }

  // Handle single range request
  const range = ranges[0];
  const { start, end } = range;
  const contentLength = end - start + 1;

  const stream = createReadStream(filePath, { start, end });
  
  const webStream = new ReadableStream({
    start(controller) {
      stream.on('data', (chunk) => {
        controller.enqueue(new Uint8Array(chunk));
      });
      
      stream.on('end', () => {
        controller.close();
      });
      
      stream.on('error', (error) => {
        console.error('Range stream error:', error);
        controller.error(error);
      });
    },
    
    cancel() {
      stream.destroy();
    }
  });

  const headers = new Headers({
    'Content-Type': contentType,
    'Content-Length': contentLength.toString(),
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
    'Accept-Ranges': 'bytes',
    'Last-Modified': lastModified.toUTCString(),
    'Cache-Control': 'private, max-age=3600',
  });

  return new NextResponse(webStream, {
    status: 206, // Partial Content
    headers,
  });
}

// Parse Range header
function parseRangeHeader(rangeHeader: string, fileSize: number): Array<{ start: number; end: number }> | null {
  const ranges: Array<{ start: number; end: number }> = [];
  
  // Remove 'bytes=' prefix
  const rangeSpec = rangeHeader.replace(/bytes=/, '');
  const rangeArray = rangeSpec.split(',');

  for (const range of rangeArray) {
    const [startStr, endStr] = range.trim().split('-');
    
    let start: number;
    let end: number;

    if (startStr === '') {
      // Suffix range: -500 (last 500 bytes)
      start = Math.max(0, fileSize - parseInt(endStr));
      end = fileSize - 1;
    } else if (endStr === '') {
      // Prefix range: 500- (from byte 500 to end)
      start = parseInt(startStr);
      end = fileSize - 1;
    } else {
      // Full range: 500-999
      start = parseInt(startStr);
      end = parseInt(endStr);
    }

    // Validate range
    if (start >= fileSize || end >= fileSize || start > end) {
      return null;
    }

    ranges.push({ start, end });
  }

  return ranges;
}

// Check if user has access to specific file
async function checkFileAccess(userId: string, filePath: string): Promise<boolean> {
  try {
    // Extract book ID from file path (assuming path structure includes book ID)
    const pathParts = filePath.split('/');
    const bookIdIndex = pathParts.findIndex(part => part === 'books');
    
    if (bookIdIndex === -1 || bookIdIndex + 1 >= pathParts.length) {
      // If we can't determine book ID, allow access for now
      // This should be more restrictive in production
      return true;
    }

    const bookId = pathParts[bookIdIndex + 1];
    
    // Use the same access check as book content
    const { query } = await import('@/utils/database');
    
    const accessResult = await query(`
      SELECT 1 FROM user_library 
      WHERE user_id = $1 AND book_id = $2
      UNION
      SELECT 1 FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.user_id = $1 AND oi.book_id = $2 AND o.status = 'completed'
      UNION
      SELECT 1 FROM books b
      WHERE b.id = $2 AND (b.price = 0 OR b.visibility = 'public') AND b.status = 'published'
      LIMIT 1
    `, [userId, bookId]);

    return accessResult.rows.length > 0;
  } catch (error) {
    console.error('Error checking file access:', error);
    return false;
  }
}

// Get content type based on file extension
function getContentType(ext: string): string {
  const contentTypes: Record<string, string> = {
    // Images
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    
    // Documents
    '.pdf': 'application/pdf',
    '.epub': 'application/epub+zip',
    '.mobi': 'application/x-mobipocket-ebook',
    '.azw': 'application/vnd.amazon.ebook',
    '.azw3': 'application/vnd.amazon.ebook',
    
    // Text
    '.html': 'text/html',
    '.htm': 'text/html',
    '.txt': 'text/plain',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.xml': 'application/xml',
    
    // Fonts
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.eot': 'application/vnd.ms-fontobject',
    
    // Audio
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    
    // Video
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogv': 'video/ogg',
    
    // Archives
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
    '.7z': 'application/x-7z-compressed',
  };

  return contentTypes[ext] || 'application/octet-stream';
}

// Determine if file should be forced to download
function shouldForceDownload(ext: string): boolean {
  const downloadExtensions = ['.epub', '.mobi', '.azw', '.azw3', '.pdf', '.zip', '.rar', '.7z'];
  return downloadExtensions.includes(ext);
}