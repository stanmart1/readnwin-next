import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');

    // Get featured reviews that are approved and featured
    const result = await query(`
      SELECT 
        br.id,
        br.rating,
        br.title,
        br.review_text,
        br.is_verified_purchase,
        br.is_helpful_count,
        br.created_at,
        u.first_name,
        u.last_name,
        b.title as book_title,
        b.cover_image_url as book_cover,
        a.name as book_author
      FROM book_reviews br
      LEFT JOIN users u ON br.user_id = u.id
      LEFT JOIN books b ON br.book_id = b.id
      LEFT JOIN authors a ON b.author_id = a.id
      WHERE br.status = 'approved' AND br.is_featured = true
      ORDER BY br.created_at DESC
      LIMIT $1
    `, [limit]);

    return NextResponse.json({
      success: true,
      reviews: result.rows
    });

  } catch (error) {
    console.error('Error fetching featured reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 