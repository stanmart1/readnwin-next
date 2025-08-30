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

    // Ensure required tables exist
    await query(`
      CREATE TABLE IF NOT EXISTS user_library (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        order_id INTEGER,
        purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        download_count INTEGER DEFAULT 0,
        last_downloaded_at TIMESTAMP,
        is_favorite BOOLEAN DEFAULT false,
        access_type VARCHAR(50) DEFAULT 'purchased',
        status VARCHAR(50) DEFAULT 'active',
        UNIQUE(user_id, book_id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS reading_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        progress_percentage DECIMAL(5,2) DEFAULT 0,
        current_page INTEGER DEFAULT 0,
        total_pages INTEGER DEFAULT 0,
        last_read_at TIMESTAMP,
        completed_at TIMESTAMP,
        total_reading_time_seconds INTEGER DEFAULT 0,
        UNIQUE(user_id, book_id)
      )
    `);

    // Get user library using ecommerce service
    const libraryItems = await ecommerceService.getUserLibrary(userId);

    // Get reading progress for each book
    const progressResult = await query(`
      SELECT book_id, progress_percentage, current_page, total_pages, 
             last_read_at, completed_at, total_reading_time_seconds
      FROM reading_progress 
      WHERE user_id = $1
    `, [userId]);

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
        book: item.book
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