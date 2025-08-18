import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ecommerceService } from '@/utils/ecommerce-service';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    console.log('🔍 Dashboard stats API - Session:', session ? 'Present' : 'Not present');
    console.log('🔍 Dashboard stats API - Session user:', session?.user);
    
    if (!session?.user?.id) {
      console.log('❌ Dashboard stats API - No session or user ID');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    console.log('🔍 Dashboard stats API - User ID:', userId);

    // Fetch comprehensive user statistics with better error handling
    let basicStats, readingStats, libraryStats, goalStats;
    
    try {
      [basicStats, readingStats, libraryStats, goalStats] = await Promise.allSettled([
        ecommerceService.getUserStats(userId),
        getReadingStats(userId),
        getLibraryStats(userId),
        getGoalStats(userId)
      ]);

      // Handle individual promise results
      basicStats = basicStats.status === 'fulfilled' ? basicStats.value : { booksRead: 0, currentlyReading: 0, totalBooks: 0, totalHours: 0, streak: 0 };
      readingStats = readingStats.status === 'fulfilled' ? readingStats.value : { booksRead: 0, completedBooks: 0, currentlyReading: 0, totalPagesRead: 0, avgProgress: 0, lastReadingSession: null };
      libraryStats = libraryStats.status === 'fulfilled' ? libraryStats.value : { totalBooks: 0, favoriteBooks: 0, recentPurchases: 0 };
      goalStats = goalStats.status === 'fulfilled' ? goalStats.value : { totalGoals: 0, completedGoals: 0, avgGoalProgress: 0 };
      
      console.log('🔍 Dashboard stats API - Stats fetched successfully');
    } catch (error) {
      console.error('Error fetching stats with Promise.allSettled:', error);
      // Fallback to individual calls
      basicStats = await ecommerceService.getUserStats(userId).catch(() => ({ booksRead: 0, currentlyReading: 0, totalBooks: 0, totalHours: 0, streak: 0 }));
      readingStats = await getReadingStats(userId).catch(() => ({ booksRead: 0, completedBooks: 0, currentlyReading: 0, totalPagesRead: 0, avgProgress: 0, lastReadingSession: null }));
      libraryStats = await getLibraryStats(userId).catch(() => ({ totalBooks: 0, favoriteBooks: 0, recentPurchases: 0 }));
      goalStats = await getGoalStats(userId).catch(() => ({ totalGoals: 0, completedGoals: 0, avgGoalProgress: 0 }));
    }

    // Combine all stats
    const stats = {
      ...basicStats,
      ...readingStats,
      ...libraryStats,
      ...goalStats
    };

    console.log('🔍 Dashboard stats API - Combined stats:', stats);

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    
    // Return fallback data instead of error
    return NextResponse.json({
      success: true,
      stats: {
        booksRead: 0,
        currentlyReading: 0,
        totalBooks: 0,
        totalHours: 0,
        streak: 0,
        completedBooks: 0,
        totalPagesRead: 0,
        avgProgress: 0,
        lastReadingSession: null,
        favoriteBooks: 0,
        recentPurchases: 0,
        totalGoals: 0,
        completedGoals: 0,
        avgGoalProgress: 0
      }
    });
  }
}

async function getReadingStats(userId: number) {
  try {
    const result = await query(`
      SELECT 
        COUNT(DISTINCT book_id) as books_read,
        COUNT(DISTINCT CASE WHEN progress_percentage >= 100 THEN book_id END) as completed_books,
        COUNT(DISTINCT CASE WHEN progress_percentage > 0 AND progress_percentage < 100 THEN book_id END) as currently_reading,
        SUM(CASE WHEN progress_percentage > 0 THEN current_page ELSE 0 END) as total_pages_read,
        AVG(CASE WHEN progress_percentage > 0 THEN progress_percentage ELSE NULL END) as avg_progress,
        MAX(last_read_at) as last_reading_session
      FROM reading_progress 
      WHERE user_id = $1
    `, [userId]);

    const row = result.rows[0];
    return {
      booksRead: parseInt(row.books_read) || 0,
      completedBooks: parseInt(row.completed_books) || 0,
      currentlyReading: parseInt(row.currently_reading) || 0,
      totalPagesRead: parseInt(row.total_pages_read) || 0,
      avgProgress: parseFloat(row.avg_progress) || 0,
      lastReadingSession: row.last_reading_session
    };
  } catch (error) {
    console.error('Error fetching reading stats:', error);
    return {
      booksRead: 0,
      completedBooks: 0,
      currentlyReading: 0,
      totalPagesRead: 0,
      avgProgress: 0,
      lastReadingSession: null
    };
  }
}

async function getLibraryStats(userId: number) {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total_books,
        COUNT(CASE WHEN is_favorite = true THEN 1 END) as favorite_books,
        COUNT(CASE WHEN purchase_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_purchases
      FROM user_library 
      WHERE user_id = $1
    `, [userId]);

    const row = result.rows[0];
    return {
      totalBooks: parseInt(row.total_books) || 0,
      favoriteBooks: parseInt(row.favorite_books) || 0,
      recentPurchases: parseInt(row.recent_purchases) || 0
    };
  } catch (error) {
    console.error('Error fetching library stats:', error);
    return {
      totalBooks: 0,
      favoriteBooks: 0,
      recentPurchases: 0
    };
  }
}

async function getGoalStats(userId: number) {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total_goals,
        COUNT(CASE WHEN current_value >= target_value THEN 1 END) as completed_goals,
        AVG(CASE WHEN target_value > 0 THEN (current_value::float / target_value * 100) ELSE 0 END) as avg_goal_progress
      FROM reading_goals 
      WHERE user_id = $1 AND is_active = true
    `, [userId]);

    const row = result.rows[0];
    return {
      totalGoals: parseInt(row.total_goals) || 0,
      completedGoals: parseInt(row.completed_goals) || 0,
      avgGoalProgress: parseFloat(row.avg_goal_progress) || 0
    };
  } catch (error) {
    console.error('Error fetching goal stats:', error);
    return {
      totalGoals: 0,
      completedGoals: 0,
      avgGoalProgress: 0
    };
  }
} 