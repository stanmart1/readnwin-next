import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { query } from '@/utils/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string; path: string[] } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { bookId, path } = params;
    
    // Check if user has access to this book
    const accessResult = await query(`
      SELECT 1 FROM (
        SELECT 1 FROM user_library 
        WHERE user_id = $1 AND book_id = $2
        
        UNION
        
        SELECT 1 FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.user_id = $1 AND oi.book_id = $2 AND o.payment_status = 'paid'
        
        UNION
        
        SELECT 1 FROM books b
        WHERE b.id = $2 AND (b.price = 0 OR b.status = 'free')
      ) AS access_check
      LIMIT 1
    `, [session.user.id, bookId]);

    if (accessResult.rows.length === 0) {
      return new NextResponse('Access denied', { status: 403 });
    }

    // Construct file path from array
    const requestPath = path.join('/');
    const sanitizedPath = requestPath.replace(/\.\./g, '').replace(/^\/+/, '');
    
    // Determine base path for naked EPUB structure
    const basePath = process.env.NODE_ENV === 'production'
      ? join('/app/storage/books', bookId)
      : join(process.cwd(), 'storage', 'books', bookId);
    
    const filePath = join(basePath, sanitizedPath);
    
    // Security check: ensure file is within book directory
    if (!filePath.startsWith(basePath)) {
      return new NextResponse('Invalid path', { status: 400 });
    }
    
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }
    
    const fileBuffer = readFileSync(filePath);
    const contentType = getContentType(sanitizedPath);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
        'Content-Disposition': `inline; filename="${sanitizedPath.split('/').pop()}"`
      }
    });
    
  } catch (error) {
    console.error('Error serving ebook file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'html':
    case 'htm':
    case 'xhtml':
      return 'text/html';
    case 'xml':
      return 'text/xml';
    case 'css':
      return 'text/css';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}