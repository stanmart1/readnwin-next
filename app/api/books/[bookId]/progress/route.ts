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

    const userId = session.user.id;
    const bookId = parseInt(params.bookId);

    if (isNaN(bookId)) {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    // Check if user has access to this book
    const accessCheck = await query(`
      SELECT ul.user_id
      FROM user_library ul
      WHERE ul.book_id = $1 AND ul.user_id = $2
    `, [bookId, userId]);

    if (accessCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Access denied. Book not in your library.' },
        { status: 403 }
      );
    }

    // Get reading progress
    const progressResult = await query(`
      SELECT
        book_id as "bookId",
        user_id as "userId",
        current_position as "currentPosition",
        percentage,
        time_spent as "timeSpent",
        last_read_at as "lastReadAt",
        session_start_time as "sessionStartTime",
        words_read as "wordsRead",
        chapters_completed as "chaptersCompleted"
      FROM reading_progress
      WHERE book_id = $1 AND user_id = $2
    `, [bookId, userId]);

    if (progressResult.rows.length === 0) {
      // Return null if no progress exists yet
      return NextResponse.json(null);
    }

    const progress = progressResult.rows[0];

    return NextResponse.json({
      bookId: progress.bookId,
      userId: progress.userId,
      currentPosition: progress.currentPosition || 0,
      percentage: progress.percentage || 0,
      timeSpent: progress.timeSpent || 0,
      lastReadAt: progress.lastReadAt,
      sessionStartTime: progress.sessionStartTime,
      wordsRead: progress.wordsRead || 0,
      chaptersCompleted: progress.chaptersCompleted || 0,
    });

  } catch (error) {
    console.error('Error fetching reading progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const bookId = parseInt(params.bookId);

    if (isNaN(bookId)) {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    const progressData = await request.json();

    // Validate required fields
    if (typeof progressData.currentPosition !== 'number' ||
        typeof progressData.percentage !== 'number') {
      return NextResponse.json(
        { error: 'Invalid progress data' },
        { status: 400 }
      );
    }

    // Check if user has access to this book
    const accessCheck = await query(`
      SELECT ul.user_id
      FROM user_library ul
      WHERE ul.book_id = $1 AND ul.user_id = $2
    `, [bookId, userId]);

    if (accessCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Access denied. Book not in your library.' },
        { status: 403 }
      );
    }

    // Upsert reading progress
    const result = await query(`
      INSERT INTO reading_progress (
        book_id,
        user_id,
        current_position,
        percentage,
        time_spent,
        last_read_at,
        session_start_time,
        words_read,
        chapters_completed
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8)
      ON CONFLICT (book_id, user_id)
      DO UPDATE SET
        current_position = $3,
        percentage = $4,
        time_spent = COALESCE(reading_progress.time_spent, 0) + COALESCE($5, 0),
        last_read_at = NOW(),
        words_read = $7,
        chapters_completed = $8
      RETURNING *
    `, [
      bookId,
      userId,
      progressData.currentPosition,
      progressData.percentage,
      progressData.timeSpent || 0,
      progressData.sessionStartTime || new Date(),
      progressData.wordsRead || 0,
      progressData.chaptersCompleted || 0
    ]);

    return NextResponse.json({
      success: true,
      progress: result.rows[0]
    });

  } catch (error) {
    console.error('Error saving reading progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const bookId = parseInt(params.bookId);

    if (isNaN(bookId)) {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    // Delete reading progress
    await query(`
      DELETE FROM reading_progress
      WHERE book_id = $1 AND user_id = $2
    `, [bookId, userId]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting reading progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
