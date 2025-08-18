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
    const period = searchParams.get('period') || 'year';

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
      default:
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    // Get monthly reading data with error handling
    let monthlyDataResult, genreDataResult, statsResult;
    
    try {
      [monthlyDataResult, genreDataResult, statsResult] = await Promise.allSettled([
        query(`
          SELECT 
            TO_CHAR(session_start, 'Mon') as month,
            COUNT(DISTINCT rs.book_id) as books,
            SUM(rs.reading_time_minutes) / 60.0 as hours
          FROM reading_sessions rs
          WHERE rs.user_id = $1 AND rs.session_start >= $2
          GROUP BY TO_CHAR(session_start, 'Mon'), EXTRACT(MONTH FROM session_start)
          ORDER BY EXTRACT(MONTH FROM session_start)
        `, [userId, startDate]),
        
        query(`
          SELECT 
            COALESCE(c.name, 'Unknown') as name,
            COUNT(DISTINCT rs.book_id) as count,
            ROUND(COUNT(DISTINCT rs.book_id) * 100.0 / (
              SELECT COUNT(DISTINCT rs2.book_id) 
              FROM reading_sessions rs2 
              WHERE rs2.user_id = $1 AND rs2.session_start >= $2
            ), 1) as percentage
          FROM reading_sessions rs
          JOIN books b ON rs.book_id = b.id
          LEFT JOIN categories c ON b.category_id = c.id
          WHERE rs.user_id = $1 AND rs.session_start >= $2
          GROUP BY c.name
          ORDER BY count DESC
          LIMIT 10
        `, [userId, startDate]),
        
        query(`
          SELECT 
            SUM(rs.reading_time_minutes) / 60.0 as total_hours,
            COUNT(DISTINCT DATE(rs.session_start)) as reading_days,
            COUNT(DISTINCT rs.book_id) as total_books,
            AVG(b.pages) as avg_pages_per_book
          FROM reading_sessions rs
          JOIN books b ON rs.book_id = b.id
          WHERE rs.user_id = $1 AND rs.session_start >= $2
        `, [userId, startDate])
      ]);

      // Handle individual promise results
      monthlyDataResult = monthlyDataResult.status === 'fulfilled' ? monthlyDataResult.value : { rows: [] };
      genreDataResult = genreDataResult.status === 'fulfilled' ? genreDataResult.value : { rows: [] };
      statsResult = statsResult.status === 'fulfilled' ? statsResult.value : { rows: [{}] };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Fallback to empty data
      monthlyDataResult = { rows: [] };
      genreDataResult = { rows: [] };
      statsResult = { rows: [{}] };
    }

    const monthlyData = monthlyDataResult.rows.map(row => ({
      month: row.month,
      books: parseInt(row.books) || 0,
      hours: Math.round(parseFloat(row.hours) * 100) / 100 || 0
    }));

    const genreData = genreDataResult.rows.map(row => ({
      name: row.name,
      count: parseInt(row.count) || 0,
      percentage: parseFloat(row.percentage) || 0
    }));

    const stats = statsResult.rows[0] ? {
      totalHours: Math.round(parseFloat(statsResult.rows[0].total_hours) * 100) / 100 || 0,
      readingDays: parseInt(statsResult.rows[0].reading_days) || 0,
      totalBooks: parseInt(statsResult.rows[0].total_books) || 0,
      avgPagesPerBook: Math.round(parseFloat(statsResult.rows[0].avg_pages_per_book) || 0)
    } : {
      totalHours: 0,
      readingDays: 0,
      totalBooks: 0,
      avgPagesPerBook: 0
    };

    return NextResponse.json({
      success: true,
      analytics: {
        monthlyData,
        genreData,
        stats
      }
    });

  } catch (error) {
    console.error('Error fetching reading analytics:', error);
    
    // Return fallback data instead of error
    return NextResponse.json({
      success: true,
      analytics: {
        monthlyData: [],
        genreData: [],
        stats: {
          totalHours: 0,
          readingDays: 0,
          totalBooks: 0,
          avgPagesPerBook: 0
        }
      }
    });
  }
} 