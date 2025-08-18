import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';
import { FileProcessor } from '@/utils/fileProcessor';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const bookId = parseInt(params.bookId);

    if (isNaN(bookId)) {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    // Check if user has access to this book
    const accessCheck = await query(`
      SELECT b.id, b.title, b.author, b.format, b.book_type, b.parsing_status, b.parsing_error,
             b.cover_image_url, b.ebook_file_url, b.word_count, b.estimated_reading_time,
             ul.user_id
      FROM books b
      LEFT JOIN user_library ul ON b.id = ul.book_id AND ul.user_id = $1
      WHERE b.id = $2
    `, [userId, bookId]);

    if (accessCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    const book = accessCheck.rows[0];
    
    // Check if user has access to this book
    if (!book.user_id) {
      return NextResponse.json(
        { error: 'Access denied. Book not in your library.' },
        { status: 403 }
      );
    }

    // Check if book has been parsed successfully
    if (book.parsing_status !== 'completed') {
      return NextResponse.json({
        success: false,
        error: 'Book content is not ready',
        parsing_status: book.parsing_status,
        parsing_error: book.parsing_error,
        message: book.parsing_status === 'processing' 
          ? 'Book is being processed. Please try again in a few minutes.'
          : 'Book processing failed. Please contact support.'
      }, { status: 202 });
    }

    // Get book content from file system
    let content = '';
    let contentType: 'markdown' | 'html' | 'epub' = 'html';

    if (book.ebook_file_url) {
      try {
        // Determine file path
        let filePath: string;
        if (book.ebook_file_url.startsWith('/uploads/')) {
          const mediaRootDir = process.env.NODE_ENV === 'production' 
            ? '/uploads' 
            : join(process.cwd(), 'uploads');
          const relativePath = book.ebook_file_url.replace('/uploads/', '');
          filePath = join(mediaRootDir, relativePath);
        } else {
          filePath = book.ebook_file_url;
        }

        if (existsSync(filePath)) {
          const fileContent = readFileSync(filePath, 'utf8');
          
          // Determine content type based on file extension
          const extension = book.ebook_file_url.toLowerCase().split('.').pop();
          switch (extension) {
            case 'md':
            case 'markdown':
              contentType = 'markdown';
              break;
            case 'epub':
              contentType = 'epub';
              break;
            default:
              contentType = 'html';
          }

          // Process content based on type
          if (contentType === 'markdown') {
            content = FileProcessor.preprocessContent(fileContent, 'markdown');
          } else if (contentType === 'epub') {
            // For EPUB, we'll return the processed HTML content
            content = fileContent; // This should be the processed HTML from EPUB
          } else {
            content = FileProcessor.preprocessContent(fileContent, 'html');
          }
        } else {
          throw new Error('Book file not found');
        }
      } catch (error) {
        console.error('Error reading book file:', error);
        return NextResponse.json(
          { error: 'Failed to read book content' },
          { status: 500 }
        );
      }
    }

    // Log access for security tracking
    try {
      await query(`
        INSERT INTO book_access_logs (book_id, user_id, access_type, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        bookId,
        userId,
        'read',
        request.headers.get('x-forwarded-for') || request.ip || null,
        request.headers.get('user-agent') || null
      ]);
    } catch (error) {
      // Ignore logging errors - table might not exist
      console.warn('Failed to log book access:', error);
    }

    return NextResponse.json({
      success: true,
      title: book.title,
      author: book.author,
      content: content,
      contentType: contentType,
      wordCount: book.word_count || 0,
      filePath: book.ebook_file_url,
      coverImage: book.cover_image_url,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error in book content API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const bookId = parseInt(params.bookId);
    const { chapterId, position, wordsRead } = await request.json();

    if (isNaN(bookId)) {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    // Update reading progress
    await query(`
      INSERT INTO reading_progress (book_id, user_id, current_position, words_read, last_read_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (book_id, user_id) 
      DO UPDATE SET 
        current_position = $3,
        words_read = $4,
        last_read_at = NOW()
    `, [bookId, userId, position || 0, wordsRead || 0]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating reading progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 