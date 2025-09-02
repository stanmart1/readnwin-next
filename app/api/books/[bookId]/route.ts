import { NextRequest, NextResponse } from 'next/server';
import { ecommerceService } from '@/utils/ecommerce-service-new';
import { query } from '@/utils/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    console.log('Fetching book with ID:', params.bookId);
    
    const id = parseInt(params.bookId);
    
    if (isNaN(id)) {
      console.log('Invalid book ID provided:', params.bookId);
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    console.log('Calling ecommerceService.getBookById with ID:', id);
    const book = await ecommerceService.getBookById(id);
    console.log('Book result:', book ? 'Found' : 'Not found');
    
    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    // Get additional file information if available
    try {
      const fileResult = await query(`
        SELECT file_format, ebook_file_url
        FROM books
        WHERE id = $1
      `, [id]);

      if (fileResult.rows.length > 0) {
        const fileInfo = fileResult.rows[0];
        (book as any).file_format = fileInfo.file_format;
        (book as any).ebook_file_url = fileInfo.ebook_file_url;
      }
    } catch (fileError) {
      console.warn('Error fetching file info:', fileError);
      // Continue without file info
    }

    return NextResponse.json({
      success: true,
      book
    });

  } catch (error) {
    console.error('Error fetching book:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    );
  }
} 