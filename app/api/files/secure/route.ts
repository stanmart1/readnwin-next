import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';
import StorageService from '@/lib/services/StorageService';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('file');
    const expires = searchParams.get('expires');
    const token = searchParams.get('token');

    if (!filePath || !expires || !token) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Verify secure URL
    if (!StorageService.verifySecureUrl(filePath, expires, token)) {
      return NextResponse.json({ error: 'Invalid or expired access token' }, { status: 403 });
    }

    // Validate file path
    if (!StorageService.validateFilePath(filePath)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    // Extract book ID from file path
    const bookId = extractBookIdFromPath(filePath);
    if (!bookId) {
      return NextResponse.json({ error: 'Invalid book file path' }, { status: 400 });
    }

    // Verify user has access to this book
    const hasAccess = await verifyUserBookAccess(session.user.id, bookId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied to this book' }, { status: 403 });
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read and serve file
    const fileBuffer = await readFile(filePath);
    const contentType = getContentType(filePath);

    // Log access for security audit
    await logSecureFileAccess(session.user.id, bookId, filePath, 'success');

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'private, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error) {
    console.error('Secure file access error:', error);
    
    // Log failed access attempt
    const session = await getServerSession(authOptions);
    if (session?.user) {
      await logSecureFileAccess(session.user.id, null, null, 'error', error instanceof Error ? error.message : 'Unknown error');
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function extractBookIdFromPath(filePath: string): string | null {
  // Extract book ID from paths like: /storage/books/123/file.epub or /uploads/books/123/file.epub
  const match = filePath.match(/\/books\/(\d+)\//);
  return match ? match[1] : null;
}

function getContentType(filePath: string): string {
  const extension = filePath.split('.').pop()?.toLowerCase();
  
  const contentTypes: Record<string, string> = {
    'epub': 'application/epub+zip',
    'pdf': 'application/pdf',
    'mobi': 'application/x-mobipocket-ebook',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'ttf': 'font/ttf',
    'otf': 'font/otf',
  };

  return contentTypes[extension || ''] || 'application/octet-stream';
}

async function verifyUserBookAccess(userId: string, bookId: string): Promise<boolean> {
  try {
    const result = await query(`
      SELECT 1 FROM user_library 
      WHERE user_id = $1 AND book_id = $2
      UNION
      SELECT 1 FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.user_id = $1 AND oi.book_id = $2 AND o.payment_status = 'paid'
      UNION
      SELECT 1 FROM books b
      WHERE b.id = $2 AND (b.price = 0 OR b.visibility = 'public')
      LIMIT 1
    `, [userId, bookId]);

    return result.rows.length > 0;
  } catch (error) {
    console.error('Error verifying book access:', error);
    return false;
  }
}

async function logSecureFileAccess(
  userId: string, 
  bookId: string | null, 
  filePath: string | null, 
  status: 'success' | 'error',
  errorMessage?: string
): Promise<void> {
  try {
    await query(`
      INSERT INTO secure_file_access_logs (user_id, book_id, file_path, access_status, error_message, accessed_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `, [userId, bookId, filePath, status, errorMessage || null]);
  } catch (error) {
    console.error('Error logging secure file access:', error);
  }
}