import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ecommerceService } from '@/utils/ecommerce-service';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  let session;
  try {
    // Get user session
    session = await getServerSession(authOptions);
    console.log('🔍 Dashboard reading-progress API - Session:', session ? 'Present' : 'Not present');
    console.log('🔍 Dashboard reading-progress API - Session user:', session?.user);
    
    if (!session?.user?.id) {
      console.log('❌ No session or user ID found in reading progress API');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access this resource' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    console.log('🔍 Dashboard reading-progress API - User ID:', userId);

    // Get weekly reading activity - Simplified query
    console.log('🔍 Dashboard reading-progress API - Fetching weekly data...');
    const weeklyData = await query(`
      SELECT 
        DATE(last_read_at) as day,
        SUM(current_page) as pages_read,
        COUNT(DISTINCT book_id) as books_read,
        SUM(current_page * 0.016) as hours_read
      FROM reading_progress
      WHERE user_id = $1 
        AND last_read_at >= CURRENT_DATE - INTERVAL '7 days'
        AND last_read_at < CURRENT_DATE + INTERVAL '1 day'
      GROUP BY DATE(last_read_at)
      ORDER BY day
    `, [userId]);
    console.log('🔍 Dashboard reading-progress API - Weekly data result:', weeklyData.rows);

    // Get currently reading books with progress
    console.log('🔍 Dashboard reading-progress API - Fetching currently reading books...');
    const currentlyReading = await query(`
      SELECT 
        b.id,
        b.title,
        a.name as author_name,
        b.cover_image_url,
        b.pages as total_pages,
        rp.current_page,
        rp.progress_percentage,
        rp.last_read_at
      FROM reading_progress rp
      JOIN books b ON rp.book_id = b.id
      LEFT JOIN authors a ON b.author_id = a.id
      WHERE rp.user_id = $1 
        AND rp.progress_percentage > 0 
        AND rp.progress_percentage < 100
      ORDER BY rp.last_read_at DESC
      LIMIT 5
    `, [userId]);
    console.log('🔍 Dashboard reading-progress API - Currently reading result:', currentlyReading.rows);

    // Format weekly data for charts
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyChartData = daysOfWeek.map((day, index) => {
      const dayData = weeklyData.rows.find(row => {
        const date = new Date(row.day);
        return date.getDay() === index;
      });
      
      return {
        day,
        pages: dayData ? parseInt(dayData.pages_read) || 0 : 0,
        hours: dayData ? parseFloat(dayData.hours_read) || 0 : 0,
        books: dayData ? parseInt(dayData.books_read) || 0 : 0
      };
    });

    // Format currently reading books
    const currentBooks = currentlyReading.rows.map(book => ({
      title: book.title,
      author: book.author_name,
      progress: parseFloat(book.progress_percentage) || 0,
      cover: book.cover_image_url,
      currentPage: book.current_page || 0,
      totalPages: book.total_pages || 0,
      lastReadAt: book.last_read_at
    }));

    return NextResponse.json({
      success: true,
      weeklyData: weeklyChartData,
      currentlyReading: currentBooks
    });

  } catch (error) {
    console.error('Error fetching reading progress:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId: session?.user?.id
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ No session or user ID found in reading progress POST API');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access this resource' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { bookId, currentPage, totalPages } = body;

    if (!bookId || currentPage === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: bookId, currentPage' },
        { status: 400 }
      );
    }

    // Update reading progress
    const progress = await ecommerceService.updateReadingProgress(userId, bookId, currentPage, totalPages);

    return NextResponse.json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('Error updating reading progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 