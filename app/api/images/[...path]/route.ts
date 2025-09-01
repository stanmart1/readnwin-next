import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import StorageService from '@/lib/services/StorageService';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const imagePath = params.path.join('/');
    console.log('Image API: Requested path:', imagePath);
    
    // Validate path
    if (!imagePath || imagePath.includes('..')) {
      console.error('Image API: Invalid path:', imagePath);
      return new NextResponse('Invalid path', { status: 400 });
    }
    
    // Try storage system first for book covers
    if (imagePath.includes('covers/') || imagePath.includes('books/')) {
      const baseStoragePath = process.env.NODE_ENV === 'production' ? '/app/storage' : join(process.cwd(), 'storage');
      const storagePath = join(baseStoragePath, imagePath);
      
      console.log('Image API: Checking storage path:', storagePath);
      if (existsSync(storagePath)) {
        const imageBuffer = await readFile(storagePath);
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
            'Cache-Control': 'public, max-age=86400',
            'Content-Length': imageBuffer.length.toString(),
          },
        });
      }
    }
    
    // Fallback to public images
    const fullPath = join(process.cwd(), 'public', 'images', imagePath);
    console.log('Image API: Checking public path:', fullPath);
    
    if (!existsSync(fullPath)) {
      console.error('Image API: File not found:', fullPath);
      return new NextResponse('Image not found', { status: 404 });
    }

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

    console.log('Image API: Serving image:', fullPath, 'Type:', contentType, 'Size:', imageBuffer.length);
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': imageBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}