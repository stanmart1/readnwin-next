import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string; filename: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookId = parseInt(params.bookId);
    const filename = params.filename;

    if (isNaN(bookId)) {
      return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 });
    }

    // Verify user has access to this book
    const hasAccess = await verifyBookAccess(parseInt(session.user.id), bookId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get book file information
    const bookFile = await query(`
      SELECT file_path, mime_type, original_filename, file_size
      FROM book_files 
      WHERE book_id = $1 AND stored_filename = $2 AND file_type = 'ebook'
    `, [bookId, filename]);

    if (bookFile.rows.length === 0) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileInfo = bookFile.rows[0];
    
    // Construct secure file path
    const storageDir = process.env.NODE_ENV === 'production' 
      ? '/app/storage' 
      : join(process.cwd(), 'storage');
    
    const filePath = join(storageDir, 'books', bookId.toString(), filename);

    if (!existsSync(filePath)) {
      console.error(`File not found on disk: ${filePath}`);
      return NextResponse.json({ error: 'File not found on server' }, { status: 404 });
    }

    // Log access for security auditing
    await logFileAccess(parseInt(session.user.id), bookId, filename, 'success');

    // Read and serve the file
    const fileBuffer = readFileSync(filePath);
    
    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', fileInfo.mime_type || 'application/octet-stream');
    headers.set('Content-Length', fileBuffer.length.toString());
    headers.set('Content-Disposition', `inline; filename="${fileInfo.original_filename}"`);
    headers.set('Cache-Control', 'private, max-age=3600');
    headers.set('X-Content-Type-Options', 'nosniff');
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Error serving secure book file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function verifyBookAccess(userId: number, bookId: number): Promise<boolean> {
  try {
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
    `, [userId, bookId]);

    return accessResult.rows.length > 0;
  } catch (error) {
    console.error('Error verifying book access:', error);
    return false;
  }
}

async function logFileAccess(
  userId: number, 
  bookId: number, 
  filename: string, 
  status: 'success' | 'error' | 'denied',
  errorMessage?: string
): Promise<void> {
  try {
    await query(`
      INSERT INTO secure_file_access_logs (user_id, book_id, file_path, access_status, error_message)
      VALUES ($1, $2, $3, $4, $5)
    `, [userId, bookId, filename, status, errorMessage || null]);
  } catch (error) {
    console.error('Error logging file access:', error);
  }
}