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

    // Get review statistics
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating,
        SUM(is_helpful_count) as helpful_votes
      FROM book_reviews
      WHERE user_id = $1 AND status = 'approved'
    `, [userId]);

    // Get recent reviews
    const recentReviewsResult = await query(`
      SELECT 
        br.id,
        b.title as book_title,
        br.rating,
        br.review_text,
        br.is_helpful_count,
        br.created_at
      FROM book_reviews br
      JOIN books b ON br.book_id = b.id
      WHERE br.user_id = $1 AND br.status = 'approved'
      ORDER BY br.created_at DESC
      LIMIT 5
    `, [userId]);

    const stats = statsResult.rows[0] ? {
      totalReviews: parseInt(statsResult.rows[0].total_reviews) || 0,
      averageRating: Math.round(parseFloat(statsResult.rows[0].average_rating) * 10) / 10 || 0,
      helpfulVotes: parseInt(statsResult.rows[0].helpful_votes) || 0
    } : {
      totalReviews: 0,
      averageRating: 0,
      helpfulVotes: 0
    };

    const recentReviews = recentReviewsResult.rows.map(row => ({
      id: row.id,
      book_title: row.book_title,
      rating: parseInt(row.rating) || 0,
      review_text: row.review_text,
      is_helpful_count: parseInt(row.is_helpful_count) || 0,
      created_at: row.created_at
    }));

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        recentReviews
      }
    });

  } catch (error) {
    console.error('Error fetching review stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 