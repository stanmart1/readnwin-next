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

    const hasAccess = await verifyBookAccess(parseInt(session.user.id), bookId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const result = await query(`
      SELECT chapters, title, word_count, estimated_reading_time, pages
      FROM books 
      WHERE id = $1
    `, [bookId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const book = result.rows[0];
    
    return NextResponse.json({
      success: true,
      title: book.title,
      chapters: book.chapters || [],
      metadata: {
        wordCount: book.word_count,
        estimatedReadingTime: book.estimated_reading_time,
        pages: book.pages
      }
    });

  } catch (error) {
    console.error('Error getting book structure:', error);
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