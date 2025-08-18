import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/database';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(params.id);
    
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Get user basic info
    const userResult = await query(`
      SELECT id, email, username, first_name, last_name
      FROM users
      WHERE id = $1
    `, [userId]);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];

    // Get user's reading progress data
    const readingProgressResult = await query(`
      SELECT 
        rp.*,
        b.title as book_title,
        b.author_id as book_author_id,
        b.pages as book_total_pages,
        c.name as category_name
      FROM reading_progress rp
      JOIN books b ON rp.book_id = b.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE rp.user_id = $1
      ORDER BY rp.last_read_at DESC
    `, [userId]);

    // Get user's library (purchased books)
    const userLibraryResult = await query(`
      SELECT 
        ul.*,
        b.title as book_title,
        b.author_id as book_author_id,
        b.pages as book_total_pages,
        c.name as category_name
      FROM user_library ul
      JOIN books b ON ul.book_id = b.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE ul.user_id = $1
      ORDER BY ul.purchase_date DESC
    `, [userId]);

    // Calculate total books read (books with progress > 0)
    const totalBooksRead = readingProgressResult.rows.filter(rp => rp.progress_percentage > 0).length;

    // Calculate total reading time (estimate based on pages read and average reading speed)
    const averageReadingSpeed = 200; // pages per hour (estimate)
    let totalReadingTime = 0;
    let totalPagesRead = 0;

    readingProgressResult.rows.forEach(rp => {
      if (rp.current_page > 0) {
        totalPagesRead += rp.current_page;
        totalReadingTime += (rp.current_page / averageReadingSpeed) * 60; // in minutes
      }
    });

    // Calculate average reading speed
    const averageReadingSpeedUser = totalReadingTime > 0 ? (totalPagesRead / (totalReadingTime / 60)) : 0;

    // Get favorite genres
    const genreStats = new Map<string, number>();
    readingProgressResult.rows.forEach(rp => {
      if (rp.category_name && rp.progress_percentage > 0) {
        const current = genreStats.get(rp.category_name) || 0;
        genreStats.set(rp.category_name, current + 1);
      }
    });

    const favoriteGenres = Array.from(genreStats.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / totalBooksRead) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get monthly activity for the last 12 months
    const monthlyActivity = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = month.toISOString().split('T')[0];
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString().split('T')[0];
      
      const monthData = readingProgressResult.rows.filter(rp => {
        const readDate = new Date(rp.last_read_at);
        return readDate >= month && readDate <= new Date(monthEnd);
      });

      const booksRead = monthData.length;
      const hoursSpent = monthData.reduce((total, rp) => {
        return total + ((rp.current_page / averageReadingSpeed) * 60);
      }, 0) / 60; // convert to hours
      
      const pagesRead = monthData.reduce((total, rp) => total + rp.current_page, 0);

      monthlyActivity.push({
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        booksRead,
        hoursSpent: Math.round(hoursSpent * 100) / 100,
        pagesRead
      });
    }

    // Get reading history (books with progress)
    const readingHistory = readingProgressResult.rows
      .filter(rp => rp.progress_percentage > 0)
      .map(rp => ({
        bookTitle: rp.book_title,
        progress: Math.round(rp.progress_percentage * 100) / 100,
        lastRead: new Date(rp.last_read_at).toLocaleDateString(),
        totalPages: rp.book_total_pages,
        currentPage: rp.current_page
      }))
      .sort((a, b) => new Date(b.lastRead).getTime() - new Date(a.lastRead).getTime());

    // Mock reading goals (you can implement actual goal tracking later)
    const readingGoals = {
      booksGoal: 12,
      booksCompleted: totalBooksRead,
      timeGoal: 100, // hours
      timeCompleted: Math.round((totalReadingTime / 60) * 100) / 100
    };

    const userReadingData = {
      userId: user.id,
      userName: `${user.first_name} ${user.last_name}`,
      email: user.email,
      totalBooksRead,
      totalReadingTime: Math.round((totalReadingTime / 60) * 100) / 100, // in hours
      averageReadingSpeed: Math.round(averageReadingSpeedUser * 100) / 100,
      favoriteGenres,
      readingHistory,
      monthlyActivity,
      readingGoals
    };

    return NextResponse.json(userReadingData);

  } catch (error) {
    console.error('Error fetching user reading analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user reading analytics' },
      { status: 500 }
    );
  }
} 