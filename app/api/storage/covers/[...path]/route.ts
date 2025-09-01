import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const imagePath = params.path.join('/');
    
    // Security: Only allow image files
    const ext = imagePath.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(`.${ext}`)) {
      return new NextResponse('File type not allowed', { status: 403 });
    }
    
    // Security: Only allow covers directory
    if (!imagePath.startsWith('original/')) {
      return new NextResponse('Access denied', { status: 403 });
    }
    
    const fullPath = join('/app/storage/covers', imagePath);
    
    if (!existsSync(fullPath)) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const imageBuffer = await readFile(fullPath);
    
    let contentType = 'image/jpeg';
    switch (ext) {
      case 'png': contentType = 'image/png'; break;
      case 'webp': contentType = 'image/webp'; break;
    }

    return new NextResponse(new Uint8Array(imageBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Error serving cover image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}