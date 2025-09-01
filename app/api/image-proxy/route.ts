import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    
    if (!url) {
      return new NextResponse('URL parameter is required', { status: 400 });
    }

    // Handle local images
    if (url.startsWith('/images/')) {
      const imagePath = url.replace('/images/', '');
      const fullPath = join(process.cwd(), 'public', 'images', imagePath);
      
      if (existsSync(fullPath)) {
        const imageBuffer = await readFile(fullPath);
        const ext = imagePath.split('.').pop()?.toLowerCase();
        
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
      }
    }

    // Handle external images
    if (url.startsWith('http')) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        
        return new NextResponse(imageBuffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400',
            'Content-Length': imageBuffer.byteLength.toString(),
          },
        });
      } catch (error) {
        console.error('Error fetching external image:', error);
      }
    }

    // Return placeholder
    const placeholderPath = join(process.cwd(), 'public', 'images', 'placeholder.svg');
    if (existsSync(placeholderPath)) {
      const placeholderBuffer = await readFile(placeholderPath);
      return new NextResponse(placeholderBuffer, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    return new NextResponse('Image not found', { status: 404 });
  } catch (error) {
    console.error('Error in image proxy:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}