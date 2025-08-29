import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { withPermission } from '@/utils/api-protection';
import { query } from '@/utils/database';
import { createHash } from 'crypto';
import { sanitizeForLog, sanitizeHtml, sanitizeInt } from '@/utils/security';
import { handleApiError } from '@/utils/error-handler';

// Lazy load file upload service only when needed
let fileUploadService: any = null;

function getFileUploadService() {
  if (!fileUploadService) {
    try {
      const { EnhancedFileUploadService } = require('@/utils/enhanced-file-upload-service');
      fileUploadService = new EnhancedFileUploadService();
    } catch (error) {
      console.warn('File upload service not available:', error);
      return null;
    }
  }
  return fileUploadService;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  const startTime = Date.now();
  
  try {
    console.log('🚀 Starting enhanced book creation process...');
    
    // Authentication handled by middleware
    console.log('✅ Stage 1 PASSED: User authenticated with proper permissions');

    // Stage 2: Parse Form Data
    console.log('📋 Stage 2: Parsing form data...');
    let formData: FormData;
    try {
      formData = await request.formData();
      console.log('✅ Stage 2 PASSED: Form data parsed');
    } catch (parseError) {
      console.log('❌ Stage 2 FAILED: Form data parsing error:', sanitizeForLog(parseError));
      return NextResponse.json(
        { error: 'Invalid form data' },
        { status: 400 }
      );
    }

    // Stage 3: Extract Basic Book Information
    console.log('📋 Stage 3: Extracting basic book information...');
    const title = formData.get('title') as string;
    const author_id = formData.get('author_id') as string;
    const category_id = formData.get('category_id') as string;
    const price = formData.get('price') as string;
    const isbn = formData.get('isbn') as string;
    const description = formData.get('description') as string;
    const language = formData.get('language') as string;
    const pages = formData.get('pages') as string;
    const publication_date = formData.get('publication_date') as string;
    const publisher = formData.get('publisher') as string;
    const book_type = formData.get('book_type') as string || 'ebook';
    const stock_quantity = formData.get('stock_quantity') as string;
    const inventory_enabled = formData.get('inventory_enabled') as string;
    const low_stock_threshold = formData.get('low_stock_threshold') as string;

    // Validate required fields
    if (!title || !author_id || !category_id || !price) {
      console.log('❌ Stage 3 FAILED: Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: title, author, category, and price are required' },
        { status: 400 }
      );
    }

    console.log('✅ Stage 3 PASSED: Basic book information extracted');

    // Stage 4: Extract Files
    console.log('📋 Stage 4: Extracting uploaded files...');
    const cover_image = formData.get('cover_image') as File;
    const ebook_file = formData.get('ebook_file') as File;

    console.log('📁 Files received:', {
      cover_image: cover_image ? `${cover_image.name} (${cover_image.size} bytes)` : 'none',
      ebook_file: ebook_file ? `${ebook_file.name} (${ebook_file.size} bytes)` : 'none'
    });

    // Validate file requirements based on book type
    if (book_type === 'ebook' && !ebook_file) {
      console.log('❌ Stage 4 FAILED: E-book file required for ebook type');
      return NextResponse.json(
        { error: 'E-book file is required for ebook type books' },
        { status: 400 }
      );
    }

    if (!cover_image) {
      console.log('❌ Stage 4 FAILED: Cover image required');
      return NextResponse.json(
        { error: 'Cover image is required' },
        { status: 400 }
      );
    }

    console.log('✅ Stage 4 PASSED: Files extracted and validated');

    // Stage 5: Create Book Record
    console.log('📋 Stage 5: Creating book record...');
    let bookId: number;
    
    try {
      const bookResult = await query(`
        INSERT INTO books (
          title, author_id, category_id, price, isbn, description, language, 
          pages, publication_date, publisher, book_type, stock_quantity, 
          inventory_enabled, low_stock_threshold, created_by, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id
      `, [
        title,
        sanitizeInt(author_id),
        sanitizeInt(category_id),
        sanitizeInt(price),
        isbn || null,
        description || null,
        language || 'en',
        pages ? sanitizeInt(pages) : null,
        publication_date || null,
        publisher || null,
        book_type,
        stock_quantity ? sanitizeInt(stock_quantity) : 0,
        inventory_enabled === 'true',
        low_stock_threshold ? sanitizeInt(low_stock_threshold, 10) : 10,
        sanitizeInt(session.user.id),
        'published'
      ]);

      bookId = bookResult.rows[0].id;
      console.log(`✅ Stage 5 PASSED: Book record created with ID ${bookId}`);
    } catch (dbError) {
      console.log('❌ Stage 5 FAILED: Database error:', sanitizeForLog(dbError));
      return NextResponse.json(
        { error: 'Failed to create book record' },
        { status: 500 }
      );
    }

    // Stage 6: Upload Cover Image
    console.log('📋 Stage 6: Uploading cover image...');
    try {
      const coverResult = await getFileUploadService().uploadBookFile(cover_image, bookId, 'cover');
      
      if (!coverResult.success) {
        console.log('❌ Stage 6 FAILED: Cover image upload failed:', sanitizeForLog(coverResult.error));
        // Clean up book record
        await query('DELETE FROM books WHERE id = $1', [bookId]);
        return NextResponse.json(
          { error: `Cover image upload failed: ${coverResult.error}` },
          { status: 500 }
        );
      }

      // Update book with cover image URL
      await query(`
        UPDATE books 
        SET cover_image_url = $2 
        WHERE id = $1
      `, [bookId, coverResult.filePath]);

      console.log('✅ Stage 6 PASSED: Cover image uploaded successfully');
    } catch (coverError) {
      console.log('❌ Stage 6 FAILED: Cover image upload error:', sanitizeForLog(coverError));
      // Clean up book record
      await query('DELETE FROM books WHERE id = $1', [bookId]);
      return NextResponse.json(
        { error: 'Failed to upload cover image' },
        { status: 500 }
      );
    }

    // Stage 7: Upload E-book File (if applicable)
    let ebookFileResult = null;
    if (ebook_file) {
      console.log('📋 Stage 7: Uploading e-book file...');
      try {
        ebookFileResult = await getFileUploadService().uploadBookFile(ebook_file, bookId, 'ebook');
        
        if (!ebookFileResult.success) {
          console.log('❌ Stage 7 FAILED: E-book file upload failed:', sanitizeForLog(ebookFileResult.error));
          // Clean up book record and files
          await getFileUploadService().deleteBookFiles(bookId);
          await query('DELETE FROM books WHERE id = $1', [bookId]);
          return NextResponse.json(
            { error: `E-book file upload failed: ${ebookFileResult.error}` },
            { status: 500 }
          );
        }

        // Update book with e-book file information
        await query(`
          UPDATE books 
          SET 
            ebook_file_url = $2,
            file_format = $3,
            file_size = $4,
            file_hash = $5
          WHERE id = $1
        `, [
          bookId,
          ebookFileResult.filePath,
          ebookFileResult.mimeType === 'application/epub+zip' ? 'epub' : 'html',
          ebookFileResult.fileSize,
          ebookFileResult.fileHash
        ]);

        console.log('✅ Stage 7 PASSED: E-book file uploaded successfully');
      } catch (ebookError) {
        console.log('❌ Stage 7 FAILED: E-book file upload error:', sanitizeForLog(ebookError));
        // Clean up book record and files
        await getFileUploadService().deleteBookFiles(bookId);
        await query('DELETE FROM books WHERE id = $1', [bookId]);
        return NextResponse.json(
          { error: 'Failed to upload e-book file' },
          { status: 500 }
        );
      }
    }

    // Stage 8: Generate Security Token
    console.log('📋 Stage 8: Generating security token...');
    try {
      const securityToken = await getFileUploadService().generateAccessToken(bookId, parseInt(session.user.id));
      console.log('✅ Stage 8 PASSED: Security token generated');
    } catch (tokenError) {
      console.log('⚠️ Stage 8 WARNING: Security token generation failed:', sanitizeForLog(tokenError));
      // Don't fail the request for token generation failure
    }

    // Stage 9: Fetch Complete Book Data
    console.log('📋 Stage 9: Fetching complete book data...');
    try {
      const bookData = await query(`
        SELECT 
          b.*,
          a.name as author_name,
          c.name as category_name,
          b.word_count,
          b.estimated_reading_time,
          b.pages as page_count,
          COALESCE(CASE WHEN b.chapters IS NOT NULL THEN jsonb_array_length(b.chapters) ELSE 0 END, 0) as chapter_count
        FROM books b
        LEFT JOIN authors a ON b.author_id = a.id
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE b.id = $1
      `, [bookId]);

      if (bookData.rows.length === 0) {
        throw new Error('Book not found after creation');
      }

      const book = bookData.rows[0];
      console.log('✅ Stage 9 PASSED: Complete book data fetched');

      // Stage 10: Success Response
      console.log('📋 Stage 10: Preparing success response...');
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      console.log('🎉 Book creation completed successfully');
      console.log(`⏱️ Total processing time: ${totalTime}ms`);

      return NextResponse.json({
        success: true,
        message: 'Book created successfully',
        book: {
          id: book.id,
          title: book.title,
          author: book.author_name,
          category: book.category_name,
          price: book.price,
          book_type: book.book_type,
          format: book.format,
          file_format: book.file_format,
          parsing_status: book.parsing_status,
          word_count: book.word_count,
          estimated_reading_time: book.estimated_reading_time,
          page_count: book.page_count,
          chapter_count: book.chapter_count,
          cover_image_url: book.cover_image_url,
          ebook_file_url: book.ebook_file_url,
          created_at: book.created_at
        },
        processingTime: `${totalTime}ms`,
        fileInfo: {
          cover_image: cover_image ? 'uploaded' : 'none',
          ebook_file: ebook_file ? 'uploaded' : 'none'
        },
        parsingInfo: {
          status: book.parsing_status,
          wordCount: book.word_count,
          estimatedReadingTime: book.estimated_reading_time,
          pageCount: book.page_count,
          chapterCount: book.chapter_count
        }
      });

    } catch (fetchError) {
      console.log('❌ Stage 9 FAILED: Error fetching book data:', sanitizeForLog(fetchError));
      return NextResponse.json(
        { error: 'Book created but failed to fetch complete data' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ UNEXPECTED ERROR in book creation:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
  } catch (error) {
    console.error('POST route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = async (request: NextRequest) => {
  try {
    console.log('📋 Admin Books GET: Starting request...');
    
    // Get session without strict permission checking for now
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('❌ Admin Books GET: No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log(`✅ Admin Books GET: User ${session.user.id} authenticated`);

    // Test database connection and basic table access
    try {
      const testResult = await query('SELECT COUNT(*) as count FROM books');
      console.log(`✅ Admin Books GET: Database connection test passed, found ${testResult.rows[0].count} books`);
    } catch (dbError) {
      console.error('❌ Admin Books GET: Database connection test failed:', dbError);
      // Return empty result instead of error to allow frontend to load
      return NextResponse.json({
        success: true,
        books: [],
        pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        error: 'Database connection failed'
      });
    }

    const { searchParams } = new URL(request.url);
    const page = sanitizeInt(searchParams.get('page'), 1);
    const limit = sanitizeInt(searchParams.get('limit'), 20);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const author = searchParams.get('author') || '';
    const status = searchParams.get('status') || '';
    const book_type = searchParams.get('book_type') || '';

    const offset = (page - 1) * limit;

    // Build query with filters
    let whereConditions = ['1=1'];
    let queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(b.title ILIKE $${paramIndex} OR b.isbn ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      whereConditions.push(`c.id = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }

    if (author) {
      whereConditions.push(`a.id = $${paramIndex}`);
      queryParams.push(author);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`b.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (book_type) {
      whereConditions.push(`b.book_type = $${paramIndex}`);
      queryParams.push(book_type);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE ${whereClause}
    `, queryParams);

    const total = parseInt(countResult.rows[0].total);

    // Get books with pagination - simplified query without problematic tables
    const booksResult = await query(`
      SELECT 
        b.id,
        b.title,
        b.author_id,
        b.category_id,
        b.price,
        b.isbn,
        b.description,
        b.language,
        b.pages,
        b.publication_date,
        b.publisher,
        COALESCE(b.book_type, 'ebook') as book_type,
        COALESCE(b.file_format, 'unknown') as format,
        COALESCE(b.processing_status, 'pending') as parsing_status,
        b.cover_image_url,
        b.ebook_file_url,
        b.status,
        b.created_at,
        b.updated_at,
        a.name as author_name,
        c.name as category_name,
        COALESCE(b.word_count, 0) as word_count,
        COALESCE(b.estimated_reading_time, 0) as estimated_reading_time,
        COALESCE(b.pages, 0) as page_count,
        0 as chapter_count,
        COALESCE(b.stock_quantity, 0) as stock_quantity,
        COALESCE(b.is_featured, false) as is_featured
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...queryParams, limit, offset]);

    const books = booksResult.rows.map(book => ({
      id: book.id,
      title: book.title || '',
      author_name: book.author_name || 'Unknown',
      category_name: book.category_name || 'Uncategorized',
      price: book.price || 0,
      book_type: book.book_type || 'ebook',
      format: book.format || 'unknown',
      parsing_status: book.parsing_status || 'pending',
      word_count: book.word_count || 0,
      estimated_reading_time: book.estimated_reading_time || 0,
      page_count: book.page_count || 0,
      chapter_count: book.chapter_count || 0,
      cover_image_url: book.cover_image_url || null,
      status: book.status || 'published',
      stock_quantity: book.stock_quantity || 0,
      is_featured: book.is_featured || false,
      created_at: book.created_at
    }));

    console.log(`✅ Admin Books GET: Successfully fetched ${books.length} books out of ${total} total`);
    
    return NextResponse.json({
      success: true,
      books,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Admin Books GET: Error fetching books:', error);
    console.error('❌ Admin Books GET: Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Return more detailed error information for debugging
    return NextResponse.json(
      { 
        error: 'Failed to fetch books',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    );
  }
};

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const bookIds = searchParams.get('ids');

    if (!bookIds) {
      return NextResponse.json(
        { error: 'Book IDs are required' },
        { status: 400 }
      );
    }

    const bookIdArray = bookIds.split(',').map(id => sanitizeInt(id.trim())).filter(id => id > 0);

    if (bookIdArray.length === 0) {
      return NextResponse.json(
        { error: 'No valid book IDs provided' },
        { status: 400 }
      );
    }

    let deletedCount = 0;
    const failedIds: number[] = [];
    const errors: string[] = [];

    for (const bookId of bookIdArray) {
      try {
        // Delete book files first (with error handling)
        try {
          const fileService = getFileUploadService();
          if (fileService && typeof fileService.deleteBookFiles === 'function') {
            await fileService.deleteBookFiles(bookId);
            console.log(`🗑️ Deleted files for book ${bookId}`);
          } else {
            console.log(`⚠️ File service not available for book ${bookId}`);
          }
        } catch (fileError) {
          console.warn(`⚠️ Failed to delete files for book ${sanitizeForLog(bookId)}:`, sanitizeForLog(fileError));
          // Continue with book deletion even if file deletion fails
        }

        // Delete book record
        const result = await query(`
          DELETE FROM books 
          WHERE id = $1
          RETURNING id
        `, [bookId]);

        if (result.rows.length > 0) {
          deletedCount++;
          console.log(`✅ Deleted book ${sanitizeForLog(bookId)}`);
        } else {
          failedIds.push(bookId);
          errors.push(`Book ${sanitizeHtml(String(bookId))} not found`);
        }
      } catch (error) {
        console.error(`❌ Error deleting book ${sanitizeForLog(bookId)}:`, sanitizeForLog(error));
        failedIds.push(bookId);
        errors.push(`Failed to delete book ${sanitizeHtml(String(bookId))}: ${sanitizeHtml(error instanceof Error ? error.message : 'Unknown error')}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} books`,
      deleted_count: deletedCount,
      failed_ids: failedIds,
      total_requested: bookIdArray.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error in bulk delete books:', sanitizeForLog(error));
    return NextResponse.json(
      { error: 'Failed to delete books' },
      { status: 500 }
    );
  }
}