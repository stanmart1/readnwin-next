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

    // Get total books read (completed books)
    const totalBooksResult = await query(`
      SELECT COUNT(DISTINCT book_id) as total_books_read
      FROM reading_progress
      WHERE user_id = $1 AND progress_percentage >= 100
    `, [userId]);

    // Get total pages read
    const totalPagesResult = await query(`
      SELECT COALESCE(SUM(current_page), 0) as total_pages_read
      FROM reading_progress
      WHERE user_id = $1
    `, [userId]);

    // Get total hours read (estimated from pages)
    const totalHoursResult = await query(`
      SELECT COALESCE(SUM(current_page * 0.016), 0) as total_hours_read
      FROM reading_progress
      WHERE user_id = $1
    `, [userId]);

    // Get current reading streak
    const streakResult = await query(`
      WITH reading_days AS (
        SELECT DISTINCT DATE(last_read_at) as read_date
        FROM reading_progress
        WHERE user_id = $1 AND last_read_at >= CURRENT_DATE - INTERVAL '30 days'
        ORDER BY read_date DESC
      ),
      streak_calc AS (
        SELECT 
          read_date,
          ROW_NUMBER() OVER (ORDER BY read_date DESC) as rn,
          read_date + (ROW_NUMBER() OVER (ORDER BY read_date DESC) - 1) * INTERVAL '1 day' as expected_date
        FROM reading_days
      )
      SELECT COUNT(*) as current_streak
      FROM streak_calc
      WHERE read_date = expected_date
      AND read_date >= CURRENT_DATE - INTERVAL '30 days'
    `, [userId]);

    // Get average rating (placeholder for now)
    const averageRating = 4.2; // This would come from book reviews when implemented

    // Get favorite genres
    const genresResult = await query(`
      SELECT 
        COALESCE(c.name, 'Unknown') as genre,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
      FROM reading_progress rp
      JOIN books b ON rp.book_id = b.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE rp.user_id = $1 AND rp.progress_percentage >= 100
      GROUP BY c.name
      ORDER BY count DESC
      LIMIT 5
    `, [userId]);

    // Get monthly progress for the last 12 months
    const monthlyProgressResult = await query(`
      SELECT 
        TO_CHAR(DATE(last_read_at), 'Mon') as month,
        COUNT(DISTINCT book_id) as books_read,
        COALESCE(SUM(current_page), 0) as pages_read,
        COALESCE(SUM(current_page * 0.016), 0) as hours_read
      FROM reading_progress
      WHERE user_id = $1 
        AND last_read_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY TO_CHAR(DATE(last_read_at), 'Mon'), EXTRACT(MONTH FROM last_read_at)
      ORDER BY EXTRACT(MONTH FROM last_read_at)
    `, [userId]);

    // Get genre distribution
    const genreDistributionResult = await query(`
      SELECT 
        COALESCE(c.name, 'Unknown') as genre,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
      FROM reading_progress rp
      JOIN books b ON rp.book_id = b.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE rp.user_id = $1 AND rp.progress_percentage >= 100
      GROUP BY c.name
      ORDER BY count DESC
      LIMIT 6
    `, [userId]);

    // Get reading speed data
    const readingSpeedResult = await query(`
      SELECT 
        COALESCE(AVG(current_page / GREATEST(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at)) / 86400, 1)), 0) as avg_pages_per_day,
        COALESCE(AVG(current_page * 0.016 / GREATEST(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at)) / 86400, 1)), 0) as avg_hours_per_day
      FROM reading_progress
      WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    `, [userId]);

    // Prepare the response
    const stats = {
      totalBooksRead: parseInt(totalBooksResult.rows[0]?.total_books_read || '0'),
      totalPagesRead: parseInt(totalPagesResult.rows[0]?.total_pages_read || '0'),
      totalHoursRead: Math.round(parseFloat(totalHoursResult.rows[0]?.total_hours_read || '0')),
      currentStreak: parseInt(streakResult.rows[0]?.current_streak || '0'),
      averageRating,
      favoriteGenres: genresResult.rows.map(row => row.genre),
      monthlyProgress: monthlyProgressResult.rows.map(row => ({
        month: row.month,
        booksRead: parseInt(row.books_read) || 0,
        pagesRead: parseInt(row.pages_read) || 0,
        hoursRead: Math.round(parseFloat(row.hours_read) * 100) / 100 || 0
      })),
      genreDistribution: genreDistributionResult.rows.map(row => ({
        genre: row.genre,
        count: parseInt(row.count) || 0,
        percentage: parseFloat(row.percentage) || 0
      })),
      readingSpeed: {
        averagePagesPerDay: Math.round(parseFloat(readingSpeedResult.rows[0]?.avg_pages_per_day || '0')),
        averageHoursPerDay: Math.round(parseFloat(readingSpeedResult.rows[0]?.avg_hours_per_day) * 100) / 100 || 0,
        fastestDay: 'Saturday', // Placeholder - would need more complex analysis
        slowestDay: 'Tuesday'   // Placeholder - would need more complex analysis
      }
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching reading stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 