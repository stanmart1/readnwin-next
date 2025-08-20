import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { query } from '@/utils/database';
import StorageService from '@/lib/services/StorageService';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookId = params.bookId;
    const { searchParams } = new URL(request.url);
    const resourcePath = searchParams.get('path');

    if (!resourcePath) {
      return NextResponse.json({ error: 'Resource path required' }, { status: 400 });
    }

    // Verify user has access to this book
    const hasAccess = await verifyUserBookAccess(session.user.id, bookId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied to this book' }, { status: 403 });
    }

    // Get book file information
    const bookResult = await query(`
      SELECT ebook_file_url, storage_path FROM books 
      WHERE id = $1 AND status = 'published'
    `, [bookId]);

    if (bookResult.rows.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const book = bookResult.rows[0];
    
    // Construct secure file path
    const baseStoragePath = book.storage_path || `/storage/books/${bookId}`;
    const fullResourcePath = `${baseStoragePath}/${resourcePath}`;

    // Validate the resource path is within the book's directory
    if (!fullResourcePath.includes(`/books/${bookId}/`)) {
      return NextResponse.json({ error: 'Invalid resource path' }, { status: 400 });
    }

    // Create secure URL with 1-hour expiry
    const secureUrl = StorageService.createSecureUrl(fullResourcePath, 3600);
    
    // Log access for analytics
    await logEpubResourceAccess(session.user.id, bookId, resourcePath);

    return NextResponse.json({
      success: true,
      secureUrl,
      expiresIn: 3600
    });

  } catch (error) {
    console.error('Error accessing EPUB content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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

async function logEpubResourceAccess(userId: string, bookId: string, resourcePath: string): Promise<void> {
  try {
    await query(`
      INSERT INTO book_resource_access_logs (user_id, book_id, resource_path, accessed_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id, book_id, resource_path) 
      DO UPDATE SET accessed_at = NOW(), access_count = book_resource_access_logs.access_count + 1
    `, [userId, bookId, resourcePath]);
  } catch (error) {
    console.error('Error logging EPUB resource access:', error);
  }
}