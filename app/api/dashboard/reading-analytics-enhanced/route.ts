import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';
import { getNigeriaTime, getDateRange } from '@/utils/timezone';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ No session or user ID found in reading analytics enhanced API');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access this resource' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const period = searchParams.get('period') || 'week';

    // Calculate date range based on period using Nigerian timezone
    const { startDate, endDate } = getDateRange(period as 'day' | 'week' | 'month' | 'year');

    // Get reading sessions data
    const sessionsQuery = bookId 
      ? `WHERE rs.user_id = $1 AND rs.book_id = $2 AND rs.session_start >= $3`
      : `WHERE rs.user_id = $1 AND rs.session_start >= $2`;
    
    const sessionsParams = bookId ? [userId, bookId, startDate] : [userId, startDate];
    
    const sessionsResult = await query(`
      SELECT 
        rs.*,
        b.title as book_title,
        b.author_name as book_author,
        COUNT(rst.page_number) as pages_tracked,
        AVG(rst.reading_speed_wpm) as avg_speed_wpm,
        SUM(rst.time_spent_seconds) as total_reading_time
      FROM reading_sessions rs
      JOIN books b ON rs.book_id = b.id
      LEFT JOIN reading_speed_tracking rst ON rs.id = rst.session_id
      ${sessionsQuery}
      GROUP BY rs.id, b.title, b.author_name
      ORDER BY rs.session_start DESC
    `, sessionsParams);

    // Get reading speed trends
    const speedTrendsResult = await query(`
      SELECT 
        DATE(rs.session_start) as date,
        AVG(rst.reading_speed_wpm) as avg_speed,
        COUNT(DISTINCT rs.id) as sessions_count,
        SUM(rst.time_spent_seconds) / 3600 as hours_read
      FROM reading_sessions rs
      LEFT JOIN reading_speed_tracking rst ON rs.id = rst.session_id
      ${sessionsQuery}
      GROUP BY DATE(rs.session_start)
      ORDER BY date DESC
      LIMIT 30
    `, sessionsParams);

    // Get book-specific analytics
    let bookAnalytics = null;
    if (bookId) {
      const bookAnalyticsResult = await query(`
        SELECT 
          b.title,
          b.author_name,
          b.pages as total_pages,
          rp.current_page,
          rp.progress_percentage,
          COUNT(rs.id) as total_sessions,
          AVG(rs.reading_speed_wpm) as avg_speed_wpm,
          SUM(rs.reading_time_minutes) as total_minutes,
          COUNT(ub.id) as bookmarks_count,
          COUNT(un.id) as notes_count,
          COUNT(uh.id) as highlights_count
        FROM books b
        LEFT JOIN reading_progress rp ON b.id = rp.book_id AND rp.user_id = $1
        LEFT JOIN reading_sessions rs ON b.id = rs.book_id AND rs.user_id = $1
        LEFT JOIN user_bookmarks ub ON b.id = ub.book_id AND ub.user_id = $1
        LEFT JOIN user_notes un ON b.id = un.book_id AND un.user_id = $1
        LEFT JOIN user_highlights uh ON b.id = uh.book_id AND uh.user_id = $1
        WHERE b.id = $2
        GROUP BY b.id, b.title, b.author_name, b.pages, rp.current_page, rp.progress_percentage
      `, [userId, bookId]);
      
      bookAnalytics = bookAnalyticsResult.rows[0] || null;
    }

    // Get reading goals progress using the workaround function
    const goalsResult = await query(`
      SELECT 
        goal_type,
        target_value,
        current_value,
        progress_percentage
      FROM get_reading_goals_with_progress($1)
      WHERE is_active = TRUE
    `, [userId]);

    // Get overall statistics
    const overallStatsResult = await query(`
      SELECT 
        COUNT(DISTINCT rp.book_id) as books_read,
        COUNT(DISTINCT rs.id) as total_sessions,
        AVG(rs.reading_speed_wpm) as overall_avg_speed,
        SUM(rs.reading_time_minutes) as total_reading_time,
        COUNT(DISTINCT DATE(rp.last_read_at)) as reading_days,
        AVG(rs.pages_read) as avg_pages_per_session
      FROM reading_progress rp
      LEFT JOIN reading_sessions rs ON rp.book_id = rs.book_id AND rp.user_id = rs.user_id
      WHERE rp.user_id = $1
    `, [userId]);

    // Get recent activity
    const recentActivityResult = await query(`
      SELECT 
        'session' as type,
        rs.session_start as timestamp,
        b.title as book_title,
        rs.pages_read as value,
        'pages' as unit
      FROM reading_sessions rs
      JOIN books b ON rs.book_id = b.id
      WHERE rs.user_id = $1
      ORDER BY rs.session_start DESC
      LIMIT 10
    `, [userId]);

    const overallStats = overallStatsResult.rows[0] || {
      books_read: 0,
      total_sessions: 0,
      overall_avg_speed: 0,
      total_reading_time: 0,
      reading_days: 0,
      avg_pages_per_session: 0
    };

    return NextResponse.json({
      success: true,
      analytics: {
        sessions: sessionsResult.rows,
        speedTrends: speedTrendsResult.rows,
        bookAnalytics,
        overallStats,
        goals: goalsResult.rows,
        recentActivity: recentActivityResult.rows
      }
    });

  } catch (error) {
    console.error('Error fetching reading analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 