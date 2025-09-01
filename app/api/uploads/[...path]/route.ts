import { NextRequest, NextResponse } from 'next/server';
import { ImageHandler } from '@/utils/image-handler';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const filePath = params.path.join('/');
  
  if (!filePath) {
    return new NextResponse('File path is required', { status: 400 });
  }

  // Extract filename and subfolder
  const pathParts = filePath.split('/');
  const filename = pathParts[pathParts.length - 1];
  const subfolder = pathParts.length > 1 ? pathParts.slice(0, -1).join('/') : undefined;

  // Check if it's an image file
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
  const ext = filename.split('.').pop()?.toLowerCase();
  
  if (ext && imageExtensions.includes(ext)) {
    return ImageHandler.serveImage(filename, subfolder);
  }

  // Handle non-image files (PDFs, etc.)
  try {
    const possiblePaths = [
      join(process.cwd(), 'public', 'uploads', filePath),
      join(process.cwd(), 'uploads', filePath),
      join(process.cwd(), 'storage', 'assets', filePath)
    ];

    let fullPath = null;
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        fullPath = path;
        break;
      }
    }

    if (!fullPath) {
      return new NextResponse('File not found', { 
        status: 404,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache'
        }
      });
    }

    const fileBuffer = await readFile(fullPath);
    
    let contentType = 'application/octet-stream';
    switch (ext) {
      case 'pdf': contentType = 'application/pdf'; break;
      case 'epub': contentType = 'application/epub+zip'; break;
      case 'txt': contentType = 'text/plain'; break;
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}