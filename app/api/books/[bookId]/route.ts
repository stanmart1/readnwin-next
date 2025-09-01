import { NextRequest, NextResponse } from 'next/server';
import { ecommerceService } from '@/utils/ecommerce-service-new';
import { query } from '@/utils/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const id = parseInt(params.bookId);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    const book = await ecommerceService.getBookById(id);
    
    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    // Get ebook file information if available
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

    return NextResponse.json({
      success: true,
      book
    });

  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 