import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EnhancedBookProcessor } from '@/lib/services/EnhancedBookProcessor';
import { query } from '@/utils/database';
import logger from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const bookId = parseInt(params.bookId);

    if (isNaN(bookId)) {
      return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 });
    }

    // Verify user authentication
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user has access to this book
    const accessResult = await query(`
      SELECT b.id, b.title, b.processing_status
      FROM books b
      LEFT JOIN user_library ul ON b.id = ul.book_id AND ul.user_id = $2
      WHERE b.id = $1 
      AND (
        ul.user_id IS NOT NULL 
        OR b.price = 0 
        OR EXISTS(
          SELECT 1 FROM orders o 
          JOIN order_items oi ON o.id = oi.order_id 
          WHERE oi.book_id = b.id AND o.user_id = $2 AND o.status = 'completed'
        )
        OR $3 IN ('admin', 'super_admin')
      )
    `, [bookId, session.user.id, session.user.role]);

    if (accessResult.rows.length === 0) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const book = accessResult.rows[0];

    // Check if book is processed
    if (book.processing_status !== 'completed') {
      return NextResponse.json({ 
        error: 'Book content not ready',
        processingStatus: book.processing_status,
        message: book.processing_status === 'processing' 
          ? 'Book is being processed. Please try again in a few moments.'
          : 'Book needs to be processed before it can be read.'
      }, { status: 202 });
    }

    // Get processed book data
    const processedData = await EnhancedBookProcessor.getProcessedBookData(bookId);

    if (!processedData) {
      return NextResponse.json({ 
        error: 'Book content not found',
        message: 'The book content could not be loaded. Please contact support.'
      }, { status: 404 });
    }

    // Return book content in format expected by e-reader
    return NextResponse.json({
      success: true,
      book: processedData
    });

  } catch (error) {
    logger.error(`Error serving book content for ${params.bookId}:`, error);
    return NextResponse.json({ 
      error: 'Failed to load book content',
      message: 'An error occurred while loading the book. Please try again.'
    }, { status: 500 });
  }
}