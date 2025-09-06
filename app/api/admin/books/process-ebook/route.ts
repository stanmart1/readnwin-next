import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireAdmin } from '@/middleware/auth';
import { EnhancedBookProcessor } from '@/lib/services/EnhancedBookProcessor';
import { query } from '@/utils/database';
import logger from '@/lib/logger';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin(request);
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { bookId } = body;

    if (!bookId || isNaN(parseInt(bookId))) {
      return NextResponse.json({ error: 'Valid book ID is required' }, { status: 400 });
    }

    const bookIdNum = parseInt(bookId);

    // Get book information
    const bookResult = await query(`
      SELECT id, title, ebook_file_url, file_format, processing_status
      FROM books 
      WHERE id = $1
    `, [bookIdNum]);

    if (bookResult.rows.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const book = bookResult.rows[0];

    if (!book.ebook_file_url) {
      return NextResponse.json({ error: 'No ebook file found for this book' }, { status: 400 });
    }

    if (book.processing_status === 'processing') {
      return NextResponse.json({ error: 'Book is already being processed' }, { status: 409 });
    }

    // Update processing status
    await query(`
      UPDATE books SET 
        processing_status = 'processing',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [bookIdNum]);

    try {
      // Determine file path
      let filePath: string;
      
      if (book.ebook_file_url.startsWith('/api/')) {
        // New format: stored in /storage/books/{id}/
        const fileName = book.ebook_file_url.split('/').pop();
        filePath = path.join(process.cwd(), 'storage', 'books', bookIdNum.toString(), fileName);
      } else {
        // Legacy format: stored in /storage/ebooks/
        const fileName = book.ebook_file_url.split('/').pop();
        filePath = path.join(process.cwd(), 'storage', 'ebooks', fileName);
      }

      // Get original filename from the stored filename
      const originalFileName = book.ebook_file_url.split('/').pop() || 'unknown.epub';

      // Process the book
      const result = await EnhancedBookProcessor.processUploadedBook(
        bookIdNum,
        filePath,
        originalFileName
      );

      if (result.success) {
        logger.info(`Successfully processed book ${bookIdNum}: ${book.title}`);
        
        return NextResponse.json({
          success: true,
          message: 'Book processed successfully',
          data: {
            bookId: bookIdNum,
            title: book.title,
            chapters: result.data?.chapters.length || 0,
            wordCount: result.data?.metadata.wordCount || 0,
            estimatedReadingTime: result.data?.metadata.estimatedReadingTime || 0
          }
        });
      } else {
        // Update processing status to failed
        await query(`
          UPDATE books SET 
            processing_status = 'failed',
            parsing_error = $1,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [result.error, bookIdNum]);

        logger.error(`Failed to process book ${bookIdNum}:`, result.error);
        
        return NextResponse.json({
          success: false,
          error: result.error || 'Processing failed'
        }, { status: 500 });
      }
    } catch (processingError) {
      // Update processing status to failed
      await query(`
        UPDATE books SET 
          processing_status = 'failed',
          parsing_error = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [processingError instanceof Error ? processingError.message : 'Unknown error', bookIdNum]);

      throw processingError;
    }

  } catch (error) {
    logger.error('Error in process-ebook endpoint:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// GET endpoint to check processing status
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');

    if (!bookId || isNaN(parseInt(bookId))) {
      return NextResponse.json({ error: 'Valid book ID is required' }, { status: 400 });
    }

    const bookResult = await query(`
      SELECT 
        id, title, processing_status, parsing_error,
        word_count, estimated_reading_time, pages,
        (SELECT COUNT(*) FROM book_chapters WHERE book_id = books.id) as chapter_count
      FROM books 
      WHERE id = $1
    `, [parseInt(bookId)]);

    if (bookResult.rows.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const book = bookResult.rows[0];

    return NextResponse.json({
      bookId: book.id,
      title: book.title,
      processingStatus: book.processing_status,
      error: book.parsing_error,
      stats: {
        wordCount: book.word_count,
        estimatedReadingTime: book.estimated_reading_time,
        pages: book.pages,
        chapterCount: book.chapter_count
      }
    });

  } catch (error) {
    logger.error('Error checking processing status:', error);
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}