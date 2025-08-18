import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ecommerceService } from '@/utils/ecommerce-service';

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    // Fetch user's library
    const library = await ecommerceService.getUserLibrary(userId);
    
    // Fetch reading progress for all books
    const readingProgress = await Promise.all(
      library.map(async (book) => {
        const progress = await ecommerceService.getReadingProgress(userId, book.id);
        return {
          bookId: book.id,
          progress: progress?.progress_percentage || 0,
          currentPage: progress?.current_page || 0,
          totalPages: progress?.total_pages || book.pages || 0,
          lastReadAt: progress?.last_read_at
        };
      })
    );

    // Filter books based on the requested filter
    let filteredLibrary = library;
    switch (filter) {
      case 'reading':
        filteredLibrary = library.filter((book, index) => {
          const progress = readingProgress[index];
          return progress.progress > 0 && progress.progress < 100;
        });
        break;
      case 'completed':
        filteredLibrary = library.filter((book, index) => {
          const progress = readingProgress[index];
          return progress.progress >= 100;
        });
        break;
      case 'wishlist':
        // For now, return empty array as wishlist is handled separately
        filteredLibrary = [];
        break;
      default:
        // 'all' - return all books
        break;
    }

    // Combine library with progress data
    const libraryWithProgress = filteredLibrary.map((book, index) => ({
      ...book,
      progress: readingProgress.find(p => p.bookId === book.id)?.progress || 0,
      currentPage: readingProgress.find(p => p.bookId === book.id)?.currentPage || 0,
      totalPages: readingProgress.find(p => p.bookId === book.id)?.totalPages || book.pages || 0,
      lastReadAt: readingProgress.find(p => p.bookId === book.id)?.lastReadAt
    }));

    return NextResponse.json({
      success: true,
      library: libraryWithProgress,
      total: libraryWithProgress.length
    });

  } catch (error) {
    console.error('Error fetching user library:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 