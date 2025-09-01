import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    
    if (!filename) {
      return new NextResponse('Filename is required', { status: 400 });
    }

    // Check multiple possible locations
    const possiblePaths = [
      join(process.cwd(), 'public', 'uploads', 'works', filename),
      join(process.cwd(), 'uploads', 'works', filename),
      join(process.cwd(), 'storage', 'uploads', 'works', filename)
    ];

    let filePath = null;
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        filePath = path;
        break;
      }
    }

    if (!filePath) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const imageBuffer = await readFile(filePath);
    const ext = filename.split('.').pop()?.toLowerCase();
    
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
  } catch (error) {
    console.error('Error serving work image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}