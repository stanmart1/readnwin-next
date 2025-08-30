import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ecommerceService } from '@/utils/ecommerce-service-new';
import { sanitizeHtml } from '@/utils/security';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Use the unified ecommerce service for library data
    const libraryItems = await ecommerceService.getUserLibrary(userId);

    // Transform to match dashboard component expectations
    const books = libraryItems.map(item => ({
      id: item.book_id,
      title: sanitizeHtml(item.book?.title || ''),
      author_name: sanitizeHtml(item.book?.author_name || 'Unknown Author'),
      cover_image_url: item.book?.cover_image_url,
      book_type: item.book?.format === 'physical' ? 'physical' : 'ebook',
      primary_format: item.book?.format || 'ebook',
      progress_percentage: 0, // Will be populated by reading progress API
      last_read_at: null,
      completed_at: null,
      total_reading_time_seconds: 0,
      added_at: item.purchase_date,
      access_type: 'purchased',
      ebook_file_url: item.book?.ebook_file_url,
      is_favorite: item.is_favorite || false
    }));

    return NextResponse.json({
      success: true,
      books
    });

  } catch (error) {
    console.error('Error fetching library:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch library',
      books: []
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { bookId } = await request.json();

    if (!bookId || isNaN(parseInt(bookId))) {
      return NextResponse.json({ error: 'Valid book ID is required' }, { status: 400 });
    }

    // Add book to user library using ecommerce service
    await ecommerceService.addToUserLibrary(userId, parseInt(bookId));

    return NextResponse.json({
      success: true,
      message: 'Book added to library successfully'
    });

  } catch (error) {
    console.error('Error adding book to library:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to add book to library'
    }, { status: 500 });
  }
}