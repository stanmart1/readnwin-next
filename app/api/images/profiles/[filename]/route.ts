import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    
    const profilePath = process.env.NODE_ENV === 'production'
      ? join('/app/storage/assets/profiles', sanitizedFilename)
      : join(process.cwd(), 'storage', 'assets', 'profiles', sanitizedFilename);
    
    if (!existsSync(profilePath)) {
      const defaultPath = join(process.cwd(), 'public', 'images', 'default-avatar.png');
      if (existsSync(defaultPath)) {
        const defaultBuffer = readFileSync(defaultPath);
        return new NextResponse(new Uint8Array(defaultBuffer), {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400'
          }
        });
      }
      return new NextResponse('Image not found', { status: 404 });
    }
    
    const imageBuffer = readFileSync(profilePath);
    const contentType = getContentType(sanitizedFilename);
    
    return new NextResponse(new Uint8Array(imageBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('Error serving profile image:', error);
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