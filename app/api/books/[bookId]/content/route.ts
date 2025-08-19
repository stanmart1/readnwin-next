import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';
import StorageService from '@/lib/services/StorageService';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookId = params.bookId;
    
    console.log(`Fetching content for book ${bookId}`);

    // Get book basic information
    const bookResult = await query(`
      SELECT 
        b.*,
        a.name as author_name,
        c.name as category_name
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = $1 AND b.status = 'published'
    `, [bookId]);

    if (bookResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Book not found or not published' },
        { status: 404 }
      );
    }

    const book = bookResult.rows[0];

    // Check if user has access to this book
    // This should be implemented based on your access control system
    const hasAccess = await checkUserBookAccess(session.user.id, bookId);
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied to this book' },
        { status: 403 }
      );
    }

    // Get book content structure
    const structureResult = await query(`
      SELECT * FROM book_content_structure 
      WHERE book_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [bookId]);

    if (structureResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Book content not available' },
        { status: 404 }
      );
    }

    const structure = structureResult.rows[0];

    // Get chapters
    const chaptersResult = await query(`
      SELECT 
        id,
        chapter_number,
        chapter_title,
        content_html,
        word_count,
        reading_time_minutes,
        content_start_offset,
        content_end_offset
      FROM book_chapters 
      WHERE book_id = $1 
      ORDER BY chapter_number ASC
    `, [bookId]);

    const chapters = chaptersResult.rows;

    // Process chapter content to update asset URLs
    const processedChapters = await Promise.all(
      chapters.map(async (chapter) => {
        let processedContent = chapter.content_html;
        
        // Get assets for this book
        const assetsResult = await query(`
          SELECT asset_path, original_path FROM book_assets 
          WHERE book_id = $1
        `, [bookId]);

        // Replace asset references with secure URLs
        for (const asset of assetsResult.rows) {
          if (StorageService.validateFilePath(asset.asset_path)) {
            const secureUrl = StorageService.createSecureUrl(asset.asset_path, 3600); // 1 hour expiry
            const regex = new RegExp(asset.original_path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            processedContent = processedContent.replace(regex, secureUrl);
          }
        }

        return {
          ...chapter,
          content_html: processedContent,
        };
      })
    );

    // Get table of contents
    const tableOfContents = structure.table_of_contents || [];

    // Log access for analytics
    await logBookAccess(session.user.id, bookId, 'read');

    // Prepare response
    const bookContent = {
      id: book.id,
      title: book.title,
      author: book.author_name,
      cover_image_url: book.cover_image_url,
      book_type: book.book_type,
      primary_format: book.primary_format,
      word_count: book.word_count,
      reading_time_minutes: book.reading_time_minutes,
      language: book.language,
      chapters: processedChapters,
      table_of_contents: tableOfContents,
    };

    return NextResponse.json({
      success: true,
      book: bookContent,
    });

  } catch (error) {
    console.error('Error fetching book content:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch book content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to check user access to book
async function checkUserBookAccess(userId: string, bookId: string): Promise<boolean> {
  try {
    // Check if user owns the book (purchased or in library)
    const accessResult = await query(`
      SELECT 1 FROM user_library 
      WHERE user_id = $1 AND book_id = $2
      UNION
      SELECT 1 FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.user_id = $1 AND oi.book_id = $2 AND o.status = 'completed'
      LIMIT 1
    `, [userId, bookId]);

    if (accessResult.rows.length > 0) {
      return true;
    }

    // Check if book is free or has public access
    const bookResult = await query(`
      SELECT price, visibility FROM books 
      WHERE id = $1 AND status = 'published'
    `, [bookId]);

    if (bookResult.rows.length > 0) {
      const book = bookResult.rows[0];
      
      // Free books or public visibility
      if (book.price === 0 || book.visibility === 'public') {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking book access:', error);
    return false;
  }
}

// Helper function to log book access
async function logBookAccess(userId: string, bookId: string, accessType: string): Promise<void> {
  try {
    await query(`
      INSERT INTO book_access_logs (book_id, user_id, access_type, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      bookId,
      userId,
      accessType,
      null, // IP address would be extracted from request headers
      null, // User agent would be extracted from request headers
    ]);
  } catch (error) {
    console.error('Error logging book access:', error);
    // Don't throw error as this is not critical
  }
}