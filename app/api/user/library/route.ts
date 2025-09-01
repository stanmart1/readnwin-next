import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ecommerceService } from '@/utils/ecommerce-service-new';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);

    // Tables should already exist from database migrations

    // Get user library using ecommerce service with fallback
    let libraryItems = [];
    try {
      libraryItems = await ecommerceService.getUserLibrary(userId);
    } catch (error) {
      console.error('Error fetching library from ecommerce service:', error);
      // Fallback: try direct query
      try {
        const fallbackResult = await query(`
          SELECT 
            ul.id, ul.user_id, ul.book_id, 
            ul.order_id, 
            COALESCE(ul.purchase_date, ul.added_at, ul.created_at, CURRENT_TIMESTAMP) as purchase_date,
            COALESCE(ul.download_count, 0) as download_count,
            ul.last_downloaded_at,
            COALESCE(ul.is_favorite, false) as is_favorite,
            b.title, b.author_name, b.category_name, b.cover_image_url, 
            b.format, b.ebook_file_url
          FROM user_library ul
          LEFT JOIN books b ON ul.book_id = b.id
          WHERE ul.user_id = $1
          ORDER BY COALESCE(ul.purchase_date, ul.added_at, ul.created_at) DESC
        `, [userId]);
        
        libraryItems = fallbackResult.rows.map(row => ({
          id: row.id,
          user_id: row.user_id,
          book_id: row.book_id,
          order_id: row.order_id,
          purchase_date: row.purchase_date,
          download_count: row.download_count,
          last_downloaded_at: row.last_downloaded_at,
          is_favorite: row.is_favorite,
          _dataSource: 'fallback_query',
          book: {
            id: row.book_id,
            title: row.title || '[DEFAULT] Unknown Title',
            author_name: row.author_name || '[DEFAULT] Unknown Author',
            category_name: row.category_name || '[DEFAULT] Uncategorized',
            cover_image_url: row.cover_image_url,
            format: row.format || 'ebook',
            ebook_file_url: row.ebook_file_url
          }
        }));
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        libraryItems = [];
      }
    }

    // Get reading progress for each book with error handling
    let progressResult = { rows: [] };
    try {
      progressResult = await query(`
        SELECT book_id, 
               COALESCE(progress_percentage, 0) as progress_percentage, 
               COALESCE(current_page, current_position, 0) as current_page, 
               COALESCE(total_pages, 0) as total_pages,
               last_read_at, completed_at, 
               COALESCE(total_reading_time_seconds, 0) as total_reading_time_seconds
        FROM reading_progress 
        WHERE user_id = $1
      `, [userId]);
    } catch (error) {
      console.error('Error fetching reading progress:', error);
      // Continue with empty progress data
    }

    const progressMap = new Map();
    progressResult.rows.forEach(row => {
      progressMap.set(row.book_id, {
        progressPercentage: parseFloat(row.progress_percentage) || 0,
        currentPage: row.current_page || 0,
        totalPages: row.total_pages || 0,
        lastReadAt: row.last_read_at,
        completedAt: row.completed_at,
        totalReadingTimeSeconds: row.total_reading_time_seconds || 0
      });
    });

    // Enhance library items with reading progress and transform for frontend
    const enhancedLibraryItems = libraryItems.map(item => {
      const progress = progressMap.get(item.book_id) || {};
      const status = progress.completedAt ? 'completed' : 
                    (progress.progressPercentage > 0 ? 'reading' : 'unread');

      return {
        id: item.id,
        user_id: item.user_id,
        book_id: item.book_id,
        book_title: item.book?.title,
        author_name: item.book?.author_name,
        category_name: item.book?.category_name,
        cover_image: item.book?.cover_image_url,
        format: item.book?.format,
        ebook_file_url: item.book?.ebook_file_url,
        purchase_date: item.purchase_date,
        download_count: item.download_count,
        last_downloaded_at: item.last_downloaded_at,
        is_favorite: item.is_favorite,
        status,
        progress_percentage: progress.progressPercentage || 0,
        current_page: progress.currentPage || 0,
        total_pages: progress.totalPages || 0,
        last_read_at: progress.lastReadAt,
        completed_at: progress.completedAt,
        total_reading_time_seconds: progress.totalReadingTimeSeconds || 0,
        readingProgress: progress,
        book: item.book,
        _dataSource: item._dataSource || 'ecommerce_service',
        _hasDefaultData: !!(item.book?.title?.includes('[DEFAULT]') || item.book?.author_name?.includes('[DEFAULT]'))
      };
    });

    return NextResponse.json({
      success: true,
      libraryItems: enhancedLibraryItems
    });

  } catch (error) {
    console.error('Error fetching user library:', error);
    return NextResponse.json({
      success: false,
      libraryItems: [],
      error: 'Failed to fetch library items'
    }, { status: 500 });
  }
} 