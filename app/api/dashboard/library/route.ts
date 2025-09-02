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

    // Get both purchased and assigned books
    let libraryItems = [];
    
    try {
      // Get purchased books from user_library
      const purchasedBooks = await ecommerceService.getUserLibrary(userId);
      
      // Get assigned books from book_assignments table
      const { query } = await import('@/utils/database');
      const assignedResult = await query(`
        SELECT 
          ba.id, ba.user_id, ba.book_id, ba.assigned_at as purchase_date,
          'assigned' as access_type, false as is_favorite,
          b.title, b.cover_image_url, b.format, b.ebook_file_url,
          a.name as author_name, c.name as category_name
        FROM book_assignments ba
        LEFT JOIN books b ON ba.book_id = b.id
        LEFT JOIN authors a ON b.author_id = a.id
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE ba.user_id = $1 AND ba.status = 'active'
        ORDER BY ba.assigned_at DESC
      `, [userId]);
      
      // Convert assigned books to library format
      const assignedBooks = assignedResult.rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        book_id: row.book_id,
        order_id: null,
        purchase_date: row.purchase_date,
        download_count: 0,
        last_downloaded_at: null,
        is_favorite: false,
        access_type: 'assigned',
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
      
      // Combine both lists, removing duplicates (prefer purchased over assigned)
      const bookIds = new Set();
      libraryItems = [];
      
      // Add purchased books first
      purchasedBooks.forEach(book => {
        if (!bookIds.has(book.book_id)) {
          libraryItems.push({ ...book, access_type: 'purchased' });
          bookIds.add(book.book_id);
        }
      });
      
      // Add assigned books that aren't already purchased
      assignedBooks.forEach(book => {
        if (!bookIds.has(book.book_id)) {
          libraryItems.push(book);
          bookIds.add(book.book_id);
        }
      });
      
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