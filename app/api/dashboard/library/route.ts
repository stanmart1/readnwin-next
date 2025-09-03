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

    // Get all books from user_library (both purchased and assigned)
    let libraryItems = [];
    
    try {
      // Get all books from user_library table
      const { query } = await import('@/utils/database');
      const libraryResult = await query(`
        SELECT 
          ul.id,
          ul.user_id,
          ul.book_id,
          ul.order_id,
          COALESCE(ul.purchase_date, ul.acquired_at) as purchase_date,
          COALESCE(ul.download_count, 0) as download_count,
          ul.last_downloaded_at,
          COALESCE(ul.is_favorite, false) as is_favorite,
          COALESCE(ul.access_type, 'purchased') as access_type,
          b.title,
          b.cover_image_url,
          b.format,
          b.ebook_file_url,
          COALESCE(a.name, 'Unknown Author') as author_name,
          COALESCE(c.name, 'Uncategorized') as category_name
        FROM user_library ul
        LEFT JOIN books b ON ul.book_id = b.id
        LEFT JOIN authors a ON b.author_id = a.id
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE ul.user_id = $1
        ORDER BY COALESCE(ul.purchase_date, ul.acquired_at) DESC
      `, [userId]);
      
      // Convert to library format
      libraryItems = libraryResult.rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        book_id: row.book_id,
        order_id: row.order_id,
        purchase_date: row.purchase_date,
        download_count: row.download_count,
        last_downloaded_at: row.last_downloaded_at,
        is_favorite: row.is_favorite,
        access_type: row.access_type,
        book: {
          id: row.book_id,
          title: row.title || 'Unknown Title',
          author_name: row.author_name || 'Unknown Author',
          category_name: row.category_name || 'Uncategorized',
          cover_image_url: row.cover_image_url,
          format: row.format || 'ebook',
          ebook_file_url: row.ebook_file_url
        }
      }));
      
    } catch (error) {
      console.error('Error fetching library:', error);
      libraryItems = [];
    }

    // Transform to match dashboard component expectations with validation
    const books = libraryItems
      .filter(item => item.book_id && item.book) // Filter out invalid entries
      .map(item => ({
        id: item.book_id,
        title: sanitizeHtml(item.book?.title || 'Untitled Book'),
        author_name: sanitizeHtml(item.book?.author_name || 'Unknown Author'),
        cover_image_url: item.book?.cover_image_url || null,
        format: item.book?.format || 'ebook',
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