import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookId = parseInt(params.bookId);
    if (isNaN(bookId)) {
      return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 });
    }

    // Verify user has access to this book
    const hasAccess = await verifyBookAccess(parseInt(session.user.id), bookId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get book file information
    const result = await query(`
      SELECT 
        bf.stored_filename as filename,
        bf.original_filename,
        bf.file_size,
        bf.mime_type,
        bf.file_format,
        b.title,
        b.word_count,
        b.estimated_reading_time,
        b.pages
      FROM book_files bf
      JOIN books b ON bf.book_id = b.id
      WHERE bf.book_id = $1 AND bf.file_type = 'ebook'
      LIMIT 1
    `, [bookId]);

    if (result.rows.length === 0) {
      // Fallback: try to get book info from books table directly
      const bookResult = await query(`
        SELECT 
          title,
          word_count,
          estimated_reading_time,
          pages,
          file_format,
          ebook_file_url
        FROM books 
        WHERE id = $1
      `, [bookId]);
      
      if (bookResult.rows.length === 0) {
        return NextResponse.json({ error: 'Book not found' }, { status: 404 });
      }
      
      const book = bookResult.rows[0];
      
      // Return fallback data
      return NextResponse.json({
        success: true,
        filename: `book_${bookId}.html`,
        originalFilename: `${book.title}.html`,
        fileSize: 0,
        mimeType: 'text/html',
        fileFormat: book.file_format || 'html',
        bookMetadata: {
          title: book.title,
          wordCount: book.word_count || 0,
          estimatedReadingTime: book.estimated_reading_time || 0,
          pages: book.pages || 0
        }
      });
    }

    const fileInfo = result.rows[0];

    return NextResponse.json({
      success: true,
      filename: fileInfo.filename,
      originalFilename: fileInfo.original_filename,
      fileSize: fileInfo.file_size,
      mimeType: fileInfo.mime_type,
      fileFormat: fileInfo.file_format,
      bookMetadata: {
        title: fileInfo.title,
        wordCount: fileInfo.word_count,
        estimatedReadingTime: fileInfo.estimated_reading_time,
        pages: fileInfo.pages
      }
    });

  } catch (error) {
    console.error('Error getting book file info:', error);
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