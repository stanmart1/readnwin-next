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
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const bookId = parseInt(params.bookId);
    if (isNaN(bookId)) {
      return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 });
    }

    // Get total readers
    const totalReadersResult = await query(`
      SELECT COUNT(DISTINCT user_id) as total_readers
      FROM user_library 
      WHERE book_id = $1
    `, [bookId]);

    const totalReaders = parseInt(totalReadersResult.rows[0]?.total_readers || '0');

    // Get average progress and completion rate
    const progressResult = await query(`
      SELECT 
        AVG(COALESCE(rp.percentage, 0)) as avg_progress,
        COUNT(CASE WHEN rp.percentage >= 100 THEN 1 END) as completed_count,
        SUM(COALESCE(rp.time_spent, 0)) / 3600.0 as total_hours
      FROM user_library ul
      LEFT JOIN reading_progress rp ON ul.user_id = rp.user_id AND ul.book_id = rp.book_id
      WHERE ul.book_id = $1
    `, [bookId]);

    const progressData = progressResult.rows[0];
    const averageProgress = parseFloat(progressData?.avg_progress || '0');
    const completedCount = parseInt(progressData?.completed_count || '0');
    const totalReadingHours = parseFloat(progressData?.total_hours || '0');
    const completionRate = totalReaders > 0 ? (completedCount / totalReaders) * 100 : 0;

    // Get progress distribution
    const progressDistribution = await query(`
      SELECT 
        CASE 
          WHEN COALESCE(rp.percentage, 0) = 0 THEN 'Not Started'
          WHEN rp.percentage < 25 THEN '1-24%'
          WHEN rp.percentage < 50 THEN '25-49%'
          WHEN rp.percentage < 75 THEN '50-74%'
          WHEN rp.percentage < 100 THEN '75-99%'
          ELSE 'Completed'
        END as progress_range,
        COUNT(*) as count
      FROM user_library ul
      LEFT JOIN reading_progress rp ON ul.user_id = rp.user_id AND ul.book_id = rp.book_id
      WHERE ul.book_id = $1
      GROUP BY progress_range
      ORDER BY 
        CASE 
          WHEN COALESCE(rp.percentage, 0) = 0 THEN 1
          WHEN rp.percentage < 25 THEN 2
          WHEN rp.percentage < 50 THEN 3
          WHEN rp.percentage < 75 THEN 4
          WHEN rp.percentage < 100 THEN 5
          ELSE 6
        END
    `, [bookId]);

    const readersByProgress = progressDistribution.rows.map(row => ({
      range: row.progress_range,
      count: parseInt(row.count),
      percentage: totalReaders > 0 ? Math.round((parseInt(row.count) / totalReaders) * 100) : 0
    }));

    // Get top readers
    const topReadersResult = await query(`
      SELECT 
        u.id as user_id,
        COALESCE(u.first_name || ' ' || u.last_name, u.username, u.email) as user_name,
        COALESCE(rp.percentage, 0) as progress,
        COALESCE(rp.time_spent, 0) / 3600.0 as reading_time,
        COALESCE(rp.last_read_at, ul.acquired_at) as last_active
      FROM user_library ul
      JOIN users u ON ul.user_id = u.id
      LEFT JOIN reading_progress rp ON ul.user_id = rp.user_id AND ul.book_id = rp.book_id
      WHERE ul.book_id = $1
      ORDER BY COALESCE(rp.percentage, 0) DESC, reading_time DESC
      LIMIT 10
    `, [bookId]);

    const topReaders = topReadersResult.rows.map(row => ({
      userId: row.user_id,
      userName: row.user_name,
      progress: parseFloat(row.progress || '0'),
      readingTime: parseFloat(row.reading_time || '0'),
      lastActive: row.last_active
    }));

    // Get recent reading activity (last 30 days)
    const activityResult = await query(`
      SELECT 
        DATE(COALESCE(rp.last_read_at, ul.acquired_at)) as activity_date,
        COUNT(DISTINCT ul.user_id) as active_readers,
        COUNT(CASE WHEN rp.percentage >= 100 THEN 1 END) as completions
      FROM user_library ul
      LEFT JOIN reading_progress rp ON ul.user_id = rp.user_id AND ul.book_id = rp.book_id
      WHERE ul.book_id = $1 
        AND COALESCE(rp.last_read_at, ul.acquired_at) >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(COALESCE(rp.last_read_at, ul.acquired_at))
      ORDER BY activity_date DESC
      LIMIT 30
    `, [bookId]);

    const readingActivity = activityResult.rows.map(row => ({
      date: row.activity_date,
      activeReaders: parseInt(row.active_readers || '0'),
      newReaders: 0,
      completions: parseInt(row.completions || '0')
    }));

    const analytics = {
      totalReaders,
      averageProgress,
      completionRate,
      averageReadingTime: totalReaders > 0 ? totalReadingHours / totalReaders : 0,
      totalReadingHours,
      readersByProgress,
      readingActivity,
      topReaders
    };

    return NextResponse.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Error fetching book analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book analytics' },
      { status: 500 }
    );
  }
}