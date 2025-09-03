import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Get reading progress for all user's books
    const result = await query(`
      SELECT 
        book_id,
        COALESCE(progress_percentage, percentage, 0) as progress_percentage,
        COALESCE(current_position, current_page, 0) as current_page,
        COALESCE(total_pages, 0) as total_pages,
        last_read_at,
        completed_at,
        COALESCE(time_spent, 0) as total_reading_time_seconds
      FROM reading_progress 
      WHERE user_id = $1
    `, [userId]);

    return NextResponse.json({
      success: true,
      progress: result.rows
    });

  } catch (error) {
    console.error('Error fetching reading progress:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch reading progress',
      progress: []
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { bookId, progressPercentage, currentPage, totalPages, readingTimeSeconds } = await request.json();

    if (!bookId || isNaN(parseInt(bookId))) {
      return NextResponse.json({ error: 'Valid book ID is required' }, { status: 400 });
    }

    // Update or create reading progress
    await query(`
      INSERT INTO reading_progress (
        user_id, book_id, progress_percentage, current_position, total_pages, 
        last_read_at, completed_at, time_spent
      ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, $7)
      ON CONFLICT (user_id, book_id) DO UPDATE SET
        progress_percentage = EXCLUDED.progress_percentage,
        current_position = EXCLUDED.current_position,
        total_pages = EXCLUDED.total_pages,
        last_read_at = EXCLUDED.last_read_at,
        completed_at = EXCLUDED.completed_at,
        time_spent = EXCLUDED.time_spent,
        updated_at = CURRENT_TIMESTAMP
    `, [
      userId, 
      parseInt(bookId), 
      progressPercentage || 0,
      currentPage || 0,
      totalPages || 0,
      progressPercentage >= 100 ? new Date() : null,
      readingTimeSeconds || 0
    ]);

    return NextResponse.json({
      success: true,
      message: 'Reading progress updated successfully'
    });

  } catch (error) {
    console.error('Error updating reading progress:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update reading progress'
    }, { status: 500 });
  }
}