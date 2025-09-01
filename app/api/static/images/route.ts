import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imagePath = searchParams.get('path');
    
    if (!imagePath) {
      return new NextResponse('Image path is required', { status: 400 });
    }

    // Sanitize the path to prevent directory traversal
    const sanitizedPath = imagePath.replace(/\.\./g, '').replace(/^\/+/, '');
    const fullPath = join(process.cwd(), 'public', 'images', sanitizedPath);
    
    if (!existsSync(fullPath)) {
      // Return a placeholder image or 404
      return new NextResponse('Image not found', { status: 404 });
    }

    const imageBuffer = await readFile(fullPath);
    const ext = sanitizedPath.split('.').pop()?.toLowerCase();
    
    let contentType = 'image/jpeg';
    switch (ext) {
      case 'png': contentType = 'image/png'; break;
      case 'gif': contentType = 'image/gif'; break;
      case 'webp': contentType = 'image/webp'; break;
      case 'svg': contentType = 'image/svg+xml'; break;
      case 'jpg':
      case 'jpeg': contentType = 'image/jpeg'; break;
    }

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': imageBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving static image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}