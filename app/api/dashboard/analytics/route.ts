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

    // Get monthly reading data
    const monthlyDataResult = await query(`
      SELECT 
        TO_CHAR(last_read_at, 'Mon') as month,
        COUNT(DISTINCT book_id) as books,
        SUM(total_reading_time_seconds) / 3600.0 as hours
      FROM reading_progress
      WHERE user_id = $1 AND last_read_at >= $2
      GROUP BY TO_CHAR(last_read_at, 'Mon'), EXTRACT(MONTH FROM last_read_at)
      ORDER BY EXTRACT(MONTH FROM last_read_at)
    `, [userId, startDate]);

    // Get genre distribution
    const genreDataResult = await query(`
      SELECT 
        COALESCE(c.name, 'Unknown') as name,
        COUNT(DISTINCT rp.book_id) as count,
        ROUND(COUNT(DISTINCT rp.book_id) * 100.0 / NULLIF((
          SELECT COUNT(DISTINCT book_id) 
          FROM reading_progress 
          WHERE user_id = $1 AND last_read_at >= $2
        ), 0), 1) as percentage
      FROM reading_progress rp
      JOIN books b ON rp.book_id = b.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE rp.user_id = $1 AND rp.last_read_at >= $2
      GROUP BY c.name
      ORDER BY count DESC
      LIMIT 10
    `, [userId, startDate]);

    // Get overall statistics
    const statsResult = await query(`
      SELECT 
        SUM(total_reading_time_seconds) / 3600.0 as total_hours,
        COUNT(DISTINCT DATE(last_read_at)) as reading_days,
        COUNT(DISTINCT book_id) as total_books,
        AVG(b.pages) as avg_pages_per_book
      FROM reading_progress rp
      LEFT JOIN books b ON rp.book_id = b.id
      WHERE rp.user_id = $1 AND rp.last_read_at >= $2
    `, [userId, startDate]);

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