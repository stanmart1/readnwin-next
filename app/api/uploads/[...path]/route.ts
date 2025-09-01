import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/');
    
    if (!filePath) {
      return new NextResponse('File path is required', { status: 400 });
    }

    // Check multiple possible locations
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
      return new NextResponse('File not found', { status: 404 });
    }

    const fileBuffer = await readFile(fullPath);
    const ext = filePath.split('.').pop()?.toLowerCase();
    
    let contentType = 'application/octet-stream';
    switch (ext) {
      case 'png': contentType = 'image/png'; break;
      case 'jpg':
      case 'jpeg': contentType = 'image/jpeg'; break;
      case 'gif': contentType = 'image/gif'; break;
      case 'webp': contentType = 'image/webp'; break;
      case 'svg': contentType = 'image/svg+xml'; break;
      case 'pdf': contentType = 'application/pdf'; break;
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving upload file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}