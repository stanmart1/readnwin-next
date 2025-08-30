import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    
    // Handle placeholder request
    if (filename === 'placeholder') {
      const placeholderPath = join(process.cwd(), 'public', 'placeholder-book.jpg');
      if (existsSync(placeholderPath)) {
        const placeholderBuffer = readFileSync(placeholderPath);
        return new NextResponse(placeholderBuffer, {
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=86400'
          }
        });
      }
    }
    
    // Sanitize filename to prevent path traversal
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    
    // Try multiple possible paths for cover images (check main covers directory first)
    const possiblePaths = [
      // Main covers directory (where files actually are)
      process.env.NODE_ENV === 'production'
        ? join('/app/storage/covers', sanitizedFilename)
        : join(process.cwd(), 'storage', 'covers', sanitizedFilename),
      // Original subdirectory
      process.env.NODE_ENV === 'production'
        ? join('/app/storage/covers/original', sanitizedFilename)
        : join(process.cwd(), 'storage', 'covers', 'original', sanitizedFilename),
      // Legacy paths
      join(process.cwd(), 'public', 'uploads', 'covers', sanitizedFilename),
      join(process.cwd(), 'uploads', 'covers', sanitizedFilename)
    ];
    
    let coverPath = null;
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        coverPath = path;
        break;
      }
    }
    
    if (!coverPath) {
      // Return placeholder image
      const placeholderPath = join(process.cwd(), 'public', 'placeholder-book.jpg');
      if (existsSync(placeholderPath)) {
        const placeholderBuffer = readFileSync(placeholderPath);
        return new NextResponse(placeholderBuffer, {
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=86400'
          }
        });
      }
      return new NextResponse('Image not found', { status: 404 });
    }
    
    const imageBuffer = readFileSync(coverPath);
    const contentType = getContentType(sanitizedFilename);
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400'
      }
    });
    
  } catch (error) {
    console.error('Error serving cover image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    default:
      return 'image/jpeg';
  }
}