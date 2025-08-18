import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const bookId = parseInt(params.bookId);
    const body = await request.json();
    const { is_favorite } = body;

    if (isNaN(bookId)) {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    if (typeof is_favorite !== 'boolean') {
      return NextResponse.json(
        { error: 'is_favorite must be a boolean' },
        { status: 400 }
      );
    }

    // Update favorite status
    const result = await query(`
      UPDATE user_library 
      SET is_favorite = $1 
      WHERE user_id = $2 AND book_id = $3
    `, [is_favorite, userId, bookId]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Book not found in your library' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: is_favorite ? 'Book added to favorites' : 'Book removed from favorites'
    });

  } catch (error) {
    console.error('Error updating favorite status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 