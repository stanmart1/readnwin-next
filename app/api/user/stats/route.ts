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

    // Get user library and reading stats with fallback for missing columns
    const statsResult = await query(`
      SELECT 
        COUNT(DISTINCT ul.book_id) as total_books,
        COUNT(DISTINCT CASE WHEN rp.progress_percentage >= 100 THEN ul.book_id END) as completed_books,
        COUNT(DISTINCT CASE WHEN rp.progress_percentage > 0 AND rp.progress_percentage < 100 THEN ul.book_id END) as currently_reading,
        COALESCE(SUM(COALESCE(rp.total_reading_time_seconds, rp.time_spent, 0)), 0) as total_reading_time,
        COALESCE(SUM(COALESCE(rp.pages_read, rp.current_page, 0)), 0) as total_pages_read,
        COALESCE(AVG(br.rating), 0) as average_rating
      FROM user_library ul
      LEFT JOIN reading_progress rp ON ul.book_id = rp.book_id AND ul.user_id = rp.user_id
      LEFT JOIN book_reviews br ON ul.book_id = br.book_id AND ul.user_id = br.user_id AND br.status = 'approved'
      WHERE ul.user_id = $1 AND (ul.status IS NULL OR ul.status = 'active')
    `, [userId]);

    const stats = statsResult.rows[0] || {};

    return NextResponse.json({
      success: true,
      stats: {
        booksRead: parseInt(stats.completed_books) || 0,
        completedBooks: parseInt(stats.completed_books) || 0,
        currentlyReading: parseInt(stats.currently_reading) || 0,
        totalBooks: parseInt(stats.total_books) || 0,
        totalPagesRead: parseInt(stats.total_pages_read) || 0,
        totalHours: Math.round((parseInt(stats.total_reading_time) || 0) / 3600),
        streak: 0,
        avgProgress: 0,
        favoriteBooks: 0,
        recentPurchases: 0,
        totalGoals: 0,
        completedGoals: 0,
        avgGoalProgress: 0,
        averageRating: parseFloat(stats.average_rating) || 0,
        readingSessions: 0,
        totalReadingTime: parseInt(stats.total_reading_time) || 0
      }
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch user stats',
      stats: {
        booksRead: 0,
        completedBooks: 0,
        currentlyReading: 0,
        totalBooks: 0,
        totalPagesRead: 0,
        totalHours: 0,
        streak: 0,
        avgProgress: 0,
        favoriteBooks: 0,
        recentPurchases: 0,
        totalGoals: 0,
        completedGoals: 0,
        avgGoalProgress: 0,
        averageRating: 0,
        readingSessions: 0,
        totalReadingTime: 0
      }
    }, { status: 500 });
  }
}