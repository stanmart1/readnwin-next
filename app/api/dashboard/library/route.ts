import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ecommerceService } from '@/utils/ecommerce-service-new';
import { sanitizeHtmlSafe as sanitizeHtml } from '@/utils/security-safe';

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

    // Use the unified ecommerce service for library data with fallback
    let libraryItems = [];
    let serviceError = null;
    try {
      libraryItems = await ecommerceService.getUserLibrary(userId);
    } catch (error) {
      console.error('Error fetching library from ecommerce service:', error);
      serviceError = error;
      libraryItems = [];
      
      // For critical service failures, inform the user
      if (error instanceof Error && error.message.includes('connection')) {
        return NextResponse.json({ 
          success: false,
          error: 'Service temporarily unavailable. Please try again later.',
          books: []
        }, { status: 503 });
      }
    }

    // Transform to match dashboard component expectations with validation
    const books = libraryItems
      .filter(item => item.book_id && item.book) // Filter out invalid entries
      .map(item => ({
        id: item.book_id,
        title: sanitizeHtml(item.book?.title || 'Untitled Book'),
        author_name: sanitizeHtml(item.book?.author_name || 'Unknown Author'),
        cover_image_url: item.book?.cover_image_url || null,
        book_type: item.book?.format === 'physical' ? 'physical' : 'ebook',
        primary_format: item.book?.format || 'ebook',
        progress_percentage: 0, // Will be populated by reading progress API
        last_read_at: null,
        completed_at: null,
        total_reading_time_seconds: 0,
        added_at: item.purchase_date || new Date().toISOString(),
        access_type: item.access_type || 'purchased',
        ebook_file_url: item.book?.ebook_file_url || null,
        is_favorite: Boolean(item.is_favorite)
      }));

    return NextResponse.json({
      success: true,
      books,
      count: books.length,
      timestamp: new Date().toISOString()
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
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }
    
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