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
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const bookId = searchParams.get('bookId');

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

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Base query conditions
    let whereClause = 'WHERE rp.user_id = $1 AND rp.last_read_at >= $2';
    let queryParams = [userId, startDate];
    
    if (bookId) {
      whereClause += ` AND rp.book_id = $${queryParams.length + 1}`;
      queryParams.push(bookId);
    }

    // Get daily reading statistics
    const dailyStats = await query(`
      SELECT 
        DATE(rp.last_read_at) as date,
        COUNT(DISTINCT rp.book_id) as books_read,
        SUM(rp.total_reading_time_seconds) as total_time_seconds,
        SUM(rp.pages_read) as total_pages,
        AVG(rp.progress_percentage) as avg_progress
      FROM reading_progress rp
      ${whereClause}
      GROUP BY DATE(rp.last_read_at)
      ORDER BY date DESC
    `, queryParams);

    // Get reading streaks
    const streakData = await query(`
      SELECT 
        COUNT(DISTINCT DATE(last_read_at)) as reading_days,
        MAX(last_read_at) as last_reading_date
      FROM reading_progress
      WHERE user_id = $1 AND last_read_at >= $2
    `, [userId, startDate]);

    // Get book completion stats
    const completionStats = await query(`
      SELECT 
        COUNT(*) as total_books,
        COUNT(CASE WHEN progress_percentage >= 100 THEN 1 END) as completed_books,
        COUNT(CASE WHEN progress_percentage > 0 AND progress_percentage < 100 THEN 1 END) as in_progress_books,
        AVG(progress_percentage) as avg_progress
      FROM reading_progress rp
      ${whereClause}
    `, queryParams);

    // Get reading speed analytics
    const speedStats = await query(`
      SELECT 
        AVG(CASE WHEN duration_seconds > 0 AND pages_read > 0 
             THEN (pages_read::float / (duration_seconds::float / 60)) 
             ELSE NULL END) as avg_pages_per_minute,
        AVG(duration_seconds) as avg_session_duration,
        COUNT(*) as total_sessions
      FROM reading_sessions rs
      WHERE rs.user_id = $1 AND rs.session_start >= $2
      ${bookId ? `AND rs.book_id = $${queryParams.length}` : ''}
    `, bookId ? [...queryParams.slice(0, 2), bookId] : queryParams.slice(0, 2));

    // Get genre distribution
    const genreStats = await query(`
      SELECT 
        COALESCE(c.name, 'Unknown') as genre,
        COUNT(DISTINCT rp.book_id) as book_count,
        SUM(rp.total_reading_time_seconds) as total_time,
        AVG(rp.progress_percentage) as avg_progress
      FROM reading_progress rp
      LEFT JOIN books b ON rp.book_id = b.id
      LEFT JOIN categories c ON b.category_id = c.id
      ${whereClause}
      GROUP BY c.name
      ORDER BY book_count DESC
      LIMIT 10
    `, queryParams);

    // Get reading patterns (time of day)
    const timePatterns = await query(`
      SELECT 
        EXTRACT(HOUR FROM last_read_at) as hour,
        COUNT(*) as reading_count,
        SUM(total_reading_time_seconds) as total_time
      FROM reading_progress rp
      ${whereClause}
      GROUP BY EXTRACT(HOUR FROM last_read_at)
      ORDER BY hour
    `, queryParams);

    // Format response
    const analytics = {
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString()
      },
      dailyStats: dailyStats.rows.map(row => ({
        date: row.date,
        booksRead: parseInt(row.books_read) || 0,
        totalTimeSeconds: parseInt(row.total_time_seconds) || 0,
        totalTimeHours: Math.round((parseInt(row.total_time_seconds) || 0) / 3600 * 100) / 100,
        totalPages: parseInt(row.total_pages) || 0,
        avgProgress: Math.round((parseFloat(row.avg_progress) || 0) * 100) / 100
      })),
      summary: {
        readingDays: parseInt(streakData.rows[0]?.reading_days) || 0,
        lastReadingDate: streakData.rows[0]?.last_reading_date,
        totalBooks: parseInt(completionStats.rows[0]?.total_books) || 0,
        completedBooks: parseInt(completionStats.rows[0]?.completed_books) || 0,
        inProgressBooks: parseInt(completionStats.rows[0]?.in_progress_books) || 0,
        avgProgress: Math.round((parseFloat(completionStats.rows[0]?.avg_progress) || 0) * 100) / 100,
        avgPagesPerMinute: Math.round((parseFloat(speedStats.rows[0]?.avg_pages_per_minute) || 0) * 100) / 100,
        avgSessionDuration: Math.round((parseInt(speedStats.rows[0]?.avg_session_duration) || 0) / 60 * 100) / 100,
        totalSessions: parseInt(speedStats.rows[0]?.total_sessions) || 0
      },
      genreDistribution: genreStats.rows.map(row => ({
        genre: row.genre,
        bookCount: parseInt(row.book_count) || 0,
        totalTimeHours: Math.round((parseInt(row.total_time) || 0) / 3600 * 100) / 100,
        avgProgress: Math.round((parseFloat(row.avg_progress) || 0) * 100) / 100
      })),
      timePatterns: timePatterns.rows.map(row => ({
        hour: parseInt(row.hour),
        readingCount: parseInt(row.reading_count) || 0,
        totalTimeMinutes: Math.round((parseInt(row.total_time) || 0) / 60 * 100) / 100
      }))
    };

    return NextResponse.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Error fetching reading analytics:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch reading analytics',
      analytics: {
        period: 'month',
        dateRange: { start: new Date().toISOString(), end: new Date().toISOString() },
        dailyStats: [],
        summary: {
          readingDays: 0,
          lastReadingDate: null,
          totalBooks: 0,
          completedBooks: 0,
          inProgressBooks: 0,
          avgProgress: 0,
          avgPagesPerMinute: 0,
          avgSessionDuration: 0,
          totalSessions: 0
        },
        genreDistribution: [],
        timePatterns: []
      }
    }, { status: 500 });
  }
}