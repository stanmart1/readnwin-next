import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

export async function PATCH(request: NextRequest) {
  try {
    // Get admin session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !(session.user.role === 'admin' || session.user.role === 'super_admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reviewId, isFeatured } = body;

    if (!reviewId || typeof isFeatured !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: reviewId, isFeatured' },
        { status: 400 }
      );
    }

    // First, check if the review exists and is approved
    const reviewCheck = await query(
      'SELECT id, status FROM book_reviews WHERE id = $1',
      [reviewId]
    );

    if (reviewCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    const review = reviewCheck.rows[0];

    // Only approved reviews can be featured
    if (review.status !== 'approved') {
      return NextResponse.json(
        { error: 'Only approved reviews can be featured' },
        { status: 400 }
      );
    }

    // Update the review's featured status
    await query(
      'UPDATE book_reviews SET is_featured = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [isFeatured, reviewId]
    );

    // Log the action
    try {
      await query(
        'INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          session.user.id,
          isFeatured ? 'FEATURE_REVIEW' : 'UNFEATURE_REVIEW',
          'book_reviews',
          reviewId,
          JSON.stringify({ 
            is_featured: isFeatured,
            message: `Review ${isFeatured ? 'featured' : 'unfeatured'} for home page display`
          }),
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        ]
      );
    } catch (auditError) {
      console.error('Audit logging failed:', auditError);
      // Don't fail the request if audit logging fails
    }

    return NextResponse.json({
      success: true,
      message: `Review ${isFeatured ? 'featured' : 'unfeatured'} successfully`
    });

  } catch (error) {
    console.error('Error updating review featured status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 