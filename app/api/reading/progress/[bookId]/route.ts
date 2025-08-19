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
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(`
      SELECT * FROM reading_progress 
      WHERE user_id = $1 AND book_id = $2
    `, [session.user.id, params.bookId]);

    return NextResponse.json({
      success: true,
      progress: result.rows[0] || null,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    const result = await query(`
      INSERT INTO reading_progress (
        user_id, book_id, current_chapter_id, current_position, 
        progress_percentage, total_reading_time_seconds, last_read_at
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, book_id) 
      DO UPDATE SET
        current_chapter_id = EXCLUDED.current_chapter_id,
        current_position = EXCLUDED.current_position,
        progress_percentage = EXCLUDED.progress_percentage,
        total_reading_time_seconds = reading_progress.total_reading_time_seconds + EXCLUDED.total_reading_time_seconds,
        last_read_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      session.user.id,
      params.bookId,
      data.current_chapter_id,
      data.current_position || 0,
      data.progress_percentage || 0,
      data.timeSpent || 0
    ]);

    return NextResponse.json({
      success: true,
      progress: result.rows[0],
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}