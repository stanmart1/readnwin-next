import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    let dateFilter = '';
    switch (range) {
      case '7d':
        dateFilter = "AND created_at >= NOW() - INTERVAL '7 days'";
        break;
      case '30d':
        dateFilter = "AND created_at >= NOW() - INTERVAL '30 days'";
        break;
      case '90d':
        dateFilter = "AND created_at >= NOW() - INTERVAL '90 days'";
        break;
      case '1y':
        dateFilter = "AND created_at >= NOW() - INTERVAL '1 year'";
        break;
    }

    // Get total books
    const totalBooksQuery = `SELECT COUNT(*) as total FROM books WHERE status = 'published'`;
    const totalBooksResult = await query(totalBooksQuery);
    const totalBooks = parseInt(totalBooksResult.rows[0].total);

    // Get total reads (mock data for now)
    const totalReads = Math.floor(totalBooks * 15.5);

    // Get total reading time (mock data)
    const totalReadingTime = Math.floor(totalBooks * 45);

    // Get average rating (mock data)
    const averageRating = 4.2;

    // Get popular books
    const popularBooksQuery = `
      SELECT 
        b.id,
        b.title,
        b.author_name as author,
        b.cover_image_url,
        COALESCE(ul.read_count, 0) as reads,
        4.5 as rating
      FROM books b
      LEFT JOIN (
        SELECT book_id, COUNT(*) as read_count
        FROM user_libraries
        WHERE status = 'completed'
        GROUP BY book_id
      ) ul ON b.id = ul.book_id
      WHERE b.status = 'published'
      ORDER BY ul.read_count DESC NULLS LAST
      LIMIT 5
    `;
    const popularBooksResult = await query(popularBooksQuery);

    // Get category stats
    const categoryStatsQuery = `
      SELECT 
        c.name as category,
        COUNT(b.id) as count,
        ROUND((COUNT(b.id) * 100.0 / (SELECT COUNT(*) FROM books WHERE status = 'published')), 1) as percentage
      FROM categories c
      LEFT JOIN books b ON c.id = b.category_id AND b.status = 'published'
      GROUP BY c.id, c.name
      HAVING COUNT(b.id) > 0
      ORDER BY count DESC
      LIMIT 10
    `;
    const categoryStatsResult = await query(categoryStatsQuery);

    // Generate reading trends (mock data)
    const readingTrends = [];
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      readingTrends.push({
        date: date.toISOString().split('T')[0],
        reads: Math.floor(Math.random() * 50) + 10,
        newUsers: Math.floor(Math.random() * 10) + 1
      });
    }

    // User engagement stats (mock data)
    const userEngagement = {
      activeReaders: Math.floor(totalBooks * 2.3),
      completionRate: 68,
      averageSessionTime: 35
    };

    return NextResponse.json({
      totalBooks,
      totalReads,
      totalReadingTime,
      averageRating,
      popularBooks: popularBooksResult.rows,
      categoryStats: categoryStatsResult.rows,
      readingTrends,
      userEngagement
    });

  } catch (error) {
    console.error('Error fetching book analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}