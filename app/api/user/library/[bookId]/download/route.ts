import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ecommerceService } from '@/utils/ecommerce-service-new';

export async function POST(
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

    if (isNaN(bookId)) {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    // Check if user owns this book
    const libraryItems = await ecommerceService.getUserLibrary(userId);
    const ownedBook = libraryItems.find(item => item.book_id === bookId);

    if (!ownedBook) {
      return NextResponse.json(
        { error: 'Book not found in your library' },
        { status: 404 }
      );
    }

    // Get book details
    const book = await ecommerceService.getBookById(bookId);
    if (!book || !book.ebook_file_url) {
      return NextResponse.json(
        { error: 'Ebook file not available' },
        { status: 404 }
      );
    }

    // Update download count
    await ecommerceService.updateDownloadCount(userId, bookId);

    // For now, return a redirect to the file URL
    // In a production environment, you might want to serve the file directly
    // or implement proper file serving with authentication
    return NextResponse.json({
      success: true,
      downloadUrl: book.ebook_file_url,
      message: 'Download count updated'
    });

  } catch (error) {
    console.error('Error downloading book:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 