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



    await query(`
      CREATE TABLE IF NOT EXISTS user_library (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        access_type VARCHAR(50) DEFAULT 'purchased',
        status VARCHAR(50) DEFAULT 'active',
        UNIQUE(user_id, book_id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS reading_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        session_end TIMESTAMP NULL,
        duration_seconds INTEGER DEFAULT 0,
        pages_read INTEGER DEFAULT 0,
        progress_start DECIMAL(5,2) DEFAULT 0,
        progress_end DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS book_reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        status VARCHAR(50) DEFAULT 'approved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, book_id)
      )
    `);

    // Check if completed_at column exists and add it if not
    try {
      await query(`
        ALTER TABLE reading_progress 
        ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL
      `);
    } catch (error) {
      console.log('Column completed_at may already exist or other issue:', error);
    }

    const statsQuery = `
      SELECT 
        COUNT(DISTINCT ul.book_id) as total_books,
        COUNT(DISTINCT CASE WHEN rp.progress_percentage >= 100 THEN ul.book_id END) as completed_books,
        COALESCE(SUM(rp.total_reading_time_seconds), 0) as total_reading_time,
        COALESCE(SUM(rp.pages_read), 0) as total_pages_read,
        COUNT(DISTINCT rp.id) as reading_sessions,
        0 as average_rating
      FROM user_library ul
      LEFT JOIN reading_progress rp ON ul.book_id = rp.book_id AND ul.user_id = rp.user_id
      WHERE ul.user_id = $1
    `;

    const result = await query(statsQuery, [userId]);
    const stats = result.rows[0] || {};

    return NextResponse.json({
      success: true,
      stats: {
        totalBooks: parseInt(stats.total_books) || 0,
        completedBooks: parseInt(stats.completed_books) || 0,
        totalReadingTime: parseInt(stats.total_reading_time) || 0,
        totalPagesRead: parseInt(stats.total_pages_read) || 0,
        readingSessions: parseInt(stats.reading_sessions) || 0,
        averageRating: 0
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ 
      success: true,
      error: 'Failed to fetch stats',
      stats: {
        totalBooks: 0,
        completedBooks: 0,
        totalReadingTime: 0,
        totalPagesRead: 0,
        readingSessions: 0,
        averageRating: 0
      },
      details: error.message 
    }, { status: 200 });
  }
}