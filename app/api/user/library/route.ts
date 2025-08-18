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
    const libraryItems = await ecommerceService.getUserLibrary(userId);

    // Fetch reading progress for all books
    const readingProgressData = await query(`
      SELECT 
        book_id,
        current_page,
        total_pages,
        progress_percentage,
        last_read_at
      FROM reading_progress
      WHERE user_id = $1
    `, [userId]);

    // Create a map of book_id to reading progress
    const readingProgressMap = new Map();
    readingProgressData.rows.forEach(row => {
      readingProgressMap.set(row.book_id, {
        currentPage: row.current_page || 0,
        totalPages: row.total_pages || 0,
        progressPercentage: parseFloat(row.progress_percentage) || 0,
        lastReadAt: row.last_read_at
      });
    });

    // Add reading progress to library items
    const libraryItemsWithProgress = libraryItems.map(item => ({
      ...item,
      readingProgress: readingProgressMap.get(item.book_id) || {
        currentPage: 0,
        totalPages: 0,
        progressPercentage: 0,
        lastReadAt: null
      }
    }));

    return NextResponse.json({
      success: true,
      libraryItems: libraryItemsWithProgress
    });

  } catch (error) {
    console.error('Error fetching user library:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 