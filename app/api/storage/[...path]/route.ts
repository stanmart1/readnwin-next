import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Security check - only allow access to non-book files or through proper authentication
    const pathString = params.path.join('/');
    
    // If this is a book file request, deny direct access
    if (pathString.includes('/books/') && (pathString.includes('.epub') || pathString.includes('.pdf') || pathString.includes('.mobi'))) {
      return NextResponse.json(
        { error: 'Direct access to book files not allowed. Use proper API endpoints.' },
        { status: 403 }
      );
    }
    
    // Construct the file path using the storage location
    const basePath = process.env.NODE_ENV === 'production' ? '/app/storage' : join(process.cwd(), 'storage');
    const filePath = join(basePath, ...params.path);
    
    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = await readFile(filePath);
    
    // Determine content type based on file extension
    const extension = filePath.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'epub':
        contentType = 'application/epub+zip';
        break;
      case 'mobi':
        contentType = 'application/x-mobipocket-ebook';
        break;
      default:
        contentType = 'application/octet-stream';
    }

    // CORS security check
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      'http://localhost:3000',
      'https://readnwin.com',
      'https://www.readnwin.com'
    ];
    const corsOrigin = allowedOrigins.includes(origin || '') ? origin : null;
    
    // Return the file with appropriate headers
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': corsOrigin || 'null',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  } catch (error) {
    console.error('Error serving storage file:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}