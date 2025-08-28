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

    // Create table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS reading_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        progress_percentage DECIMAL(5,2) DEFAULT 0,
        current_chapter_id VARCHAR(255),
        current_position INTEGER DEFAULT 0,
        pages_read INTEGER DEFAULT 0,
        total_reading_time_seconds INTEGER DEFAULT 0,
        last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, book_id)
      )
    `);

    const result = await query(`
      SELECT * FROM reading_progress 
      WHERE book_id = $1 AND user_id = $2
    `, [params.bookId, session.user.id]);

    return NextResponse.json({
      success: true,
      progress: result.rows[0] || null
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

    const progress = await request.json();

    // Create table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS reading_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        progress_percentage DECIMAL(5,2) DEFAULT 0,
        current_chapter_id VARCHAR(255),
        current_position INTEGER DEFAULT 0,
        pages_read INTEGER DEFAULT 0,
        total_reading_time_seconds INTEGER DEFAULT 0,
        last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, book_id)
      )
    `);

    await query(`
      INSERT INTO reading_progress (book_id, user_id, current_position, progress_percentage, total_reading_time_seconds, last_read_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (book_id, user_id) 
      DO UPDATE SET 
        current_position = $3,
        progress_percentage = $4,
        total_reading_time_seconds = COALESCE(reading_progress.total_reading_time_seconds, 0) + COALESCE($5, 0),
        last_read_at = NOW(),
        updated_at = NOW()
    `, [params.bookId, session.user.id, progress.current_position, progress.progress_percentage, progress.timeSpent || 0]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
  }
}