import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    
    const worksPath = process.env.NODE_ENV === 'production'
      ? join('/app/storage/assets/works', sanitizedFilename)
      : join(process.cwd(), 'storage', 'assets', 'works', sanitizedFilename);
    
    if (!existsSync(worksPath)) {
      return new NextResponse('Image not found', { status: 404 });
    }
    
    const imageBuffer = readFileSync(worksPath);
    const contentType = getContentType(sanitizedFilename);
    
    return new NextResponse(new Uint8Array(imageBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400'
      }
    });
    
  } catch (error) {
    console.error('Error serving works image:', error);
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