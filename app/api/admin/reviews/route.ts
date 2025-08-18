import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ecommerceService } from '@/utils/ecommerce-service';

export async function GET(request: NextRequest) {
  try {
    // Get admin session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !(session.user.role === 'admin' || session.user.role === 'super_admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || '';
    const rating = searchParams.get('rating') || '';
    const bookId = searchParams.get('bookId') || '';
    const userId = searchParams.get('userId') || '';
    const search = searchParams.get('search') || '';

    // Build filters
    const filters: any = {};
    if (status) filters.status = status;
    if (rating) filters.rating = parseInt(rating);
    if (bookId) filters.book_id = parseInt(bookId);
    if (userId) filters.user_id = parseInt(userId);
    if (search) filters.search = search;

    // Get reviews with pagination and filters
    try {
      const reviews = await ecommerceService.getAdminReviews(filters, page, limit);

      return NextResponse.json({
        success: true,
        ...reviews
      });
    } catch (dbError) {
      console.error('Database error fetching reviews:', dbError);
      
      // Return empty results if database query fails
      return NextResponse.json({
        success: true,
        reviews: [],
        total: 0,
        pages: 1
      });
    }

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const { reviewId, status, adminNotes } = body;

    if (!reviewId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: reviewId, status' },
        { status: 400 }
      );
    }

    // Update review status with error handling
    try {
      const review = await ecommerceService.updateReviewStatus(reviewId, status, adminNotes, session.user.id);

      return NextResponse.json({
        success: true,
        review
      });
    } catch (dbError) {
      console.error('Database error updating review:', dbError);
      return NextResponse.json(
        { error: 'Failed to update review. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get admin session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || !(session.user.role === 'admin' || session.user.role === 'super_admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    // Delete review
    const success = await ecommerceService.deleteReview(parseInt(reviewId), session.user.id);

    return NextResponse.json({
      success,
      message: success ? 'Review deleted successfully' : 'Failed to delete review'
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 