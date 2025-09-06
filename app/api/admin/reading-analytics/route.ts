import { sanitizeInput, sanitizeQuery, validateId, sanitizeHtml } from '@/lib/security';
import { requireAdmin, requirePermission } from '@/middleware/auth';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    const analytics = await getReadingAnalytics(startDate, now);

    return NextResponse.json({
      success: true,
      analytics
    });

  } catch (error) {
    logger.error('Error fetching reading analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getReadingAnalytics(startDate: Date, endDate: Date) {
  try {
    // Get total users with reading activity
    const totalUsersResult = await query(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM reading_progress 
      WHERE last_read_at >= $1 AND last_read_at <= $2
    `, [startDate, endDate]);

    // Get total books read (completed)
    const totalBooksResult = await query(`
      SELECT COUNT(*) as count
      FROM reading_progress 
      WHERE completed_at >= $1 AND completed_at <= $2
    `, [startDate, endDate]);

    // Get average reading time
    const avgTimeResult = await query(`
      SELECT AVG(total_reading_time_seconds) / 3600.0 as avg_hours
      FROM reading_progress 
      WHERE last_read_at >= $1 AND last_read_at <= $2
    `, [startDate, endDate]);

    // Get monthly reading data
    const monthlyDataResult = await query(`
      SELECT 
        TO_CHAR(last_read_at, 'Mon') as month,
        COUNT(DISTINCT user_id) as active_readers,
        SUM(total_reading_time_seconds) / 3600.0 as total_hours,
        COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as books_completed
      FROM reading_progress 
      WHERE last_read_at >= $1 AND last_read_at <= $2
      GROUP BY TO_CHAR(last_read_at, 'Mon'), EXTRACT(MONTH FROM last_read_at)
      ORDER BY EXTRACT(MONTH FROM last_read_at)
    `, [startDate, endDate]);

    // Get genre distribution
    const genreDataResult = await query(`
      SELECT 
        COALESCE(c.name, 'Unknown') as name,
        COUNT(DISTINCT rp.book_id) as value,
        '#' || LPAD(TO_HEX((RANDOM() * 16777215)::INTEGER), 6, '0') as color
      FROM reading_progress rp
      JOIN books b ON rp.book_id = b.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE rp.last_read_at >= $1 AND rp.last_read_at <= $2
      GROUP BY c.name
      ORDER BY value DESC
      LIMIT 10
    `, [startDate, endDate]);

    // Get top readers
    const topReadersResult = await query(`
      SELECT 
        rp.user_id,
        u.email as user_name,
        COUNT(DISTINCT rp.book_id) as books_read,
        SUM(rp.total_reading_time_seconds) / 3600.0 as total_hours,
        AVG(rp.words_read / NULLIF(rp.total_reading_time_seconds / 60.0, 0)) as average_speed
      FROM reading_progress rp
      JOIN users u ON rp.user_id = u.id
      WHERE rp.last_read_at >= $1 AND rp.last_read_at <= $2
      GROUP BY rp.user_id, u.email
      ORDER BY books_read DESC, total_hours DESC
      LIMIT 10
    `, [startDate, endDate]);

    // Get reading progress for popular books
    const readingProgressResult = await query(`
      SELECT 
        b.title as book_title,
        AVG(rp.progress_percentage) as average_progress,
        COUNT(rp.user_id) as readers_count
      FROM reading_progress rp
      JOIN books b ON rp.book_id = b.id
      WHERE rp.last_read_at >= $1 AND rp.last_read_at <= $2
      GROUP BY b.id, b.title
      HAVING COUNT(rp.user_id) >= 2
      ORDER BY readers_count DESC, average_progress DESC
      LIMIT 10
    `, [startDate, endDate]);

    return {
      totalUsers: parseInt(totalUsersResult.rows[0]?.count) || 0,
      totalBooksRead: parseInt(totalBooksResult.rows[0]?.count) || 0,
      averageReadingTime: Math.round((parseFloat(avgTimeResult.rows[0]?.avg_hours) || 0) * 100) / 100,
      averageReadingSpeed: 250, // Default pages per day
      monthlyReadingData: monthlyDataResult.rows.map(row => ({
        month: row.month,
        activeReaders: parseInt(row.active_readers) || 0,
        totalHours: Math.round((parseFloat(row.total_hours) || 0) * 100) / 100,
        booksCompleted: parseInt(row.books_completed) || 0
      })),
      categoryDistribution: [],
      genreDistribution: genreDataResult.rows.map(row => ({
        name: row.name,
        value: parseInt(row.value) || 0,
        color: row.color || '#3B82F6'
      })),
      topReaders: topReadersResult.rows.map(row => ({
        userId: parseInt(row.user_id),
        userName: row.user_name,
        booksRead: parseInt(row.books_read) || 0,
        totalHours: Math.round((parseFloat(row.total_hours) || 0) * 100) / 100,
        averageSpeed: Math.round((parseFloat(row.average_speed) || 0) * 100) / 100
      })),
      readingProgress: readingProgressResult.rows.map(row => ({
        bookTitle: row.book_title,
        averageProgress: Math.round((parseFloat(row.average_progress) || 0) * 100) / 100,
        readersCount: parseInt(row.readers_count) || 0
      })),
      userGoals: [],
      goalCompletion: [],
      topGoalAchievers: []
    };

  } catch (error) {
    logger.error('Error in getReadingAnalytics:', error);
    return {
      totalUsers: 0,
      totalBooksRead: 0,
      averageReadingTime: 0,
      averageReadingSpeed: 0,
      monthlyReadingData: [],
      categoryDistribution: [],
      genreDistribution: [],
      topReaders: [],
      readingProgress: [],
      userGoals: [],
      goalCompletion: [],
      topGoalAchievers: []
    };
  }
}