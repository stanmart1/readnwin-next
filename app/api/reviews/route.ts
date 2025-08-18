import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ecommerceService } from '@/utils/ecommerce-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { book_id, rating, title, review_text } = body;

    // Validate required fields
    if (!book_id || !rating || !review_text) {
      return NextResponse.json(
        { error: 'Missing required fields: book_id, rating, review_text' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user has purchased the book (verified purchase)
    const hasPurchased = await ecommerceService.hasUserPurchasedBook(
      parseInt(session.user.id),
      parseInt(book_id)
    );

    // Create review
    const review = await ecommerceService.createReview({
      book_id: parseInt(book_id),
      user_id: parseInt(session.user.id),
      rating: parseInt(rating),
      title: title || null,
      review_text,
      is_verified_purchase: hasPurchased
    });

    // Check if this was an update to an existing review
    const isUpdate = review.updated_at !== review.created_at;
    const message = isUpdate 
      ? 'Review updated successfully' 
      : 'Review submitted successfully';

    return NextResponse.json({
      success: true,
      review,
      message
    });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { review_id, rating, title, review_text } = body;

    // Validate required fields
    if (!review_id || !rating || !review_text) {
      return NextResponse.json(
        { error: 'Missing required fields: review_id, rating, review_text' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if review exists and belongs to the user
    const existingReview = await ecommerceService.getReviewById(review_id);
    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if review belongs to the current user
    if (existingReview.user_id !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'Access denied. You can only update your own reviews.' },
        { status: 403 }
      );
    }

    // Check if review is approved - prevent updates for approved reviews
    if (existingReview.status === 'approved') {
      return NextResponse.json(
        { error: 'Cannot update review. This review has been approved by an admin and cannot be modified.' },
        { status: 403 }
      );
    }

    // Update review
    const updatedReview = await ecommerceService.updateUserReview(review_id, {
      rating: parseInt(rating),
      title: title || null,
      review_text
    });

    return NextResponse.json({
      success: true,
      review: updatedReview,
      message: 'Review updated successfully'
    });

  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      );
    }

    // Get reviews for the book
    const reviews = await ecommerceService.getBookReviews(parseInt(bookId), page, limit);

    return NextResponse.json({
      success: true,
      ...reviews
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 