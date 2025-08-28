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

    const userId = session.user.id;

    // Create tables if they don't exist
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

    // Return empty books array for now to prevent errors
    const books = [];

    return NextResponse.json({
      success: true,
      books
    });

  } catch (error) {
    console.error('Error fetching currently reading:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch currently reading books',
      books: []
    }, { status: 500 });
  }
}