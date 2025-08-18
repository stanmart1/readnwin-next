import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return await serveBookFile(request, { params }, false);
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return await serveBookFile(request, { params }, true);
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Range, Authorization',
      'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
    },
  });
}

async function serveBookFile(
  request: NextRequest,
  { params }: { params: { path: string[] } },
  isHead: boolean = false
) {
  try {
    const filePath = params.path.join('/');
    
    console.log('🔍 Book-files API: Accessing file:', {
      requestedPath: filePath,
      environment: process.env.NODE_ENV,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer')
    });
    
    // Security: Prevent directory traversal
    if (filePath.includes('..') || filePath.includes('~') || filePath.startsWith('/')) {
      console.log('❌ Book-files API: Invalid file path detected:', filePath);
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }
    
    // Construct the full path to the book file
    // Updated to use new /uploads/books/ structure
    const mediaRootDir = process.env.NODE_ENV === 'production' 
      ? '/uploads' 
      : join(process.cwd(), 'uploads');
    
    // Handle different path patterns
    let fullPath: string;
    
    if (filePath.startsWith('books/')) {
      // Direct access to book files: books/[bookId]/[filename]
      fullPath = join(mediaRootDir, filePath);
    } else if (filePath.startsWith('public/uploads/')) {
      // Access to public uploads: public/uploads/covers/[filename]
      fullPath = join(mediaRootDir, filePath);
    } else {
      // Legacy support for old book-files structure
      const bookFilesDir = process.env.NODE_ENV === 'production' 
        ? '/uploads/books' 
        : join(process.cwd(), 'book-files');
      fullPath = join(bookFilesDir, filePath);
    }
    
    console.log('🔍 Book-files API: File path resolution:', {
      mediaRootDir,
      fullPath,
      exists: existsSync(fullPath)
    });
    
    // Check if file exists
    if (!existsSync(fullPath)) {
      console.log('❌ Book-files API: File not found:', fullPath);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    // Handle range requests for large files
    const range = request.headers.get('range');
    let fileBuffer: Buffer;
    let status = 200;
    let rangeHeaders = {};
    
    if (range && !isHead) {
      const fileSize = (await readFile(fullPath)).length;
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      
      if (start >= fileSize || end >= fileSize) {
        return new NextResponse('Requested range not satisfiable', { status: 416 });
      }
      
      fileBuffer = (await readFile(fullPath)).slice(start, end + 1);
      status = 206;
      rangeHeaders = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Content-Length': (end - start + 1).toString(),
      };
    } else {
      fileBuffer = await readFile(fullPath);
    }
    
    // Determine content type based on file extension
    const extension = filePath.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (extension) {
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'epub':
        contentType = 'application/epub+zip';
        break;
      case 'mobi':
        contentType = 'application/x-mobipocket-ebook';
        break;
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      default:
        contentType = 'application/octet-stream';
    }
    
    console.log('✅ Book-files API: File served successfully:', {
      filePath,
      contentType,
      fileSize: fileBuffer.length,
      isHead
    });
    
    // For HEAD requests, return headers only
    if (isHead) {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': fileBuffer.length.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD',
          'Access-Control-Allow-Headers': 'Content-Type, Range',
        },
      });
    }
    
    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      status,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD',
        'Access-Control-Allow-Headers': 'Content-Type, Range',
        ...rangeHeaders,
      },
    });
  } catch (error) {
    console.error('❌ Book-files API: Error serving file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 