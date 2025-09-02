import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';
import { sanitizeInt } from '@/utils/security';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

function ensureUploadDir() {
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'covers');
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
}

// Extract metadata without altering book structure
async function extractEbookMetadata(buffer: Buffer, filename: string) {
  const metadata: any = {};
  
  try {
    if (filename.toLowerCase().endsWith('.epub')) {
      // Basic EPUB metadata extraction without structure changes
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(buffer);
      
      // Read container.xml to find OPF file
      const containerFile = zip.file('META-INF/container.xml');
      if (containerFile) {
        const containerXml = await containerFile.async('text');
        const opfMatch = containerXml.match(/full-path="([^"]+)"/i);
        
        if (opfMatch) {
          const opfFile = zip.file(opfMatch[1]);
          if (opfFile) {
            const opfXml = await opfFile.async('text');
            
            // Extract basic metadata
            const titleMatch = opfXml.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
            const creatorMatch = opfXml.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
            
            if (titleMatch) metadata.title = titleMatch[1];
            if (creatorMatch) metadata.creator = creatorMatch[1];
            
            // Count spine items for rough page estimation
            const spineMatches = opfXml.match(/<itemref[^>]*idref="[^"]+"/gi);
            if (spineMatches) {
              metadata.pageCount = Math.max(spineMatches.length * 2, 10);
            }
          }
        }
      }
    } else if (filename.toLowerCase().endsWith('.html') || filename.toLowerCase().endsWith('.htm')) {
      // Basic HTML metadata extraction
      const htmlContent = buffer.toString('utf-8');
      
      const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
      const authorMatch = htmlContent.match(/<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["']/i);
      
      if (titleMatch) metadata.title = titleMatch[1];
      if (authorMatch) metadata.creator = authorMatch[1];
      
      // Rough word count for page estimation
      const textContent = htmlContent.replace(/<[^>]*>/g, ' ');
      const words = textContent.trim().split(/\s+/).filter(w => w.length > 0);
      metadata.wordCount = words.length;
      metadata.pageCount = Math.ceil(words.length / 250); // 250 words per page
    }
  } catch (error) {
    console.warn('Metadata extraction failed:', error);
  }
  
  return metadata;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    
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
    const format = formData.get('format') as string || 'ebook';
    const stock_quantity = formData.get('stock_quantity') as string;
    const cover_image = formData.get('cover_image') as File;
    const ebook_file = formData.get('ebook_file') as File;



    if (!title || !author_id || !category_id || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!cover_image) {
      return NextResponse.json({ error: 'Cover image is required' }, { status: 400 });
    }

    if (format === 'ebook' && !ebook_file) {
      return NextResponse.json({ error: 'E-book file is required for ebook format' }, { status: 400 });
    }

    // Create book record
    const bookResult = await query(`
      INSERT INTO books (
        title, author_id, category_id, price, isbn, description, language, 
        pages, publication_date, publisher, format, stock_quantity, 
        status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING id
    `, [
      title,
      sanitizeInt(author_id),
      sanitizeInt(category_id),
      parseFloat(price),
      isbn || null,
      description || null,
      language || 'en',
      pages ? sanitizeInt(pages) : null,
      publication_date || null,
      publisher || null,
      format,
      stock_quantity ? sanitizeInt(stock_quantity) : 0,
      'published'
    ]);

    const bookId = bookResult.rows[0].id;

    // Upload cover image
    let coverUrl = null;
    try {
      const uploadDir = ensureUploadDir();
      const fileName = `${bookId}_cover_${Date.now()}.${cover_image.name.split('.').pop()}`;
      const filePath = join(uploadDir, fileName);
      
      const arrayBuffer = await cover_image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      writeFileSync(filePath, buffer);
      
      coverUrl = `/uploads/covers/${fileName}`;
    } catch (uploadError) {
      await query('DELETE FROM books WHERE id = $1', [bookId]);
      return NextResponse.json({ error: 'Failed to upload cover image' }, { status: 500 });
    }

    // Upload e-book file (preserve original structure)
    let ebookUrl = null;
    let extractedMetadata = {};
    if (ebook_file) {
      try {
        const ebookDir = join(process.cwd(), 'storage', 'ebooks');
        if (!existsSync(ebookDir)) {
          mkdirSync(ebookDir, { recursive: true });
        }
        
        const ebookFileName = `${bookId}_${ebook_file.name}`;
        const ebookFilePath = join(ebookDir, ebookFileName);
        
        const ebookBuffer = Buffer.from(await ebook_file.arrayBuffer());
        writeFileSync(ebookFilePath, ebookBuffer);
        
        ebookUrl = `/api/ebooks/${bookId}/${ebookFileName}`;
        
        // Extract metadata without altering structure
        extractedMetadata = await extractEbookMetadata(ebookBuffer, ebook_file.name);
        
      } catch (ebookError) {
        await query('DELETE FROM books WHERE id = $1', [bookId]);
        return NextResponse.json({ error: 'Failed to upload e-book file' }, { status: 500 });
      }
    }

    // Update book with file URLs and metadata
    await query(`
      UPDATE books SET 
        cover_image_url = $2,
        ebook_file_url = $3,
        word_count = $4,
        pages = COALESCE($5, pages)
      WHERE id = $1
    `, [
      bookId, 
      coverUrl, 
      ebookUrl,
      extractedMetadata.wordCount || 0,
      extractedMetadata.pageCount || sanitizeInt(pages)
    ]);

    // Get complete book data
    const bookData = await query(`
      SELECT b.*, a.name as author_name, c.name as category_name
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = $1
    `, [bookId]);

    const book = bookData.rows[0];

    return NextResponse.json({
      success: true,
      message: 'Book created successfully',
      book: {
        id: book.id,
        title: book.title,
        author: book.author_name,
        category: book.category_name,
        price: book.price,
        format: book.format,
        cover_image_url: book.cover_image_url,
        created_at: book.created_at
      }
    });

  } catch (error) {
    console.error('Book creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = sanitizeInt(searchParams.get('page'), 1);
    const limit = sanitizeInt(searchParams.get('limit'), 20);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const offset = (page - 1) * limit;

    let whereConditions = ['1=1'];
    let queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(b.title ILIKE $${paramIndex} OR b.isbn ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`b.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE ${whereClause}
    `, queryParams);

    const total = parseInt(countResult.rows[0].total);

    const booksResult = await query(`
      SELECT 
        b.id, b.title, b.price, b.format, b.cover_image_url, b.status, b.created_at,
        COALESCE(b.stock_quantity, 0) as stock_quantity,
        COALESCE(b.is_featured, false) as is_featured,
        a.name as author_name,
        c.name as category_name
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...queryParams, limit, offset]);

    return NextResponse.json({
      success: true,
      books: booksResult.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
};

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const bookIds = searchParams.get('ids');

    if (!bookIds) {
      return NextResponse.json({ error: 'Book IDs are required' }, { status: 400 });
    }

    const bookIdArray = bookIds.split(',').map(id => sanitizeInt(id.trim())).filter(id => id > 0);

    if (bookIdArray.length === 0) {
      return NextResponse.json({ error: 'No valid book IDs provided' }, { status: 400 });
    }

    let deletedCount = 0;
    const failedIds: number[] = [];
    const errors: string[] = [];

    for (const bookId of bookIdArray) {
      try {
        // Cascade delete from all related tables
        await query('DELETE FROM cart_items WHERE book_id = $1', [bookId]);
        await query('DELETE FROM order_items WHERE book_id = $1', [bookId]);
        await query('DELETE FROM user_library WHERE book_id = $1', [bookId]);
        await query('DELETE FROM book_reviews WHERE book_id = $1', [bookId]);
        await query('DELETE FROM reading_progress WHERE book_id = $1', [bookId]);
        
        // Delete the book record itself
        const deleteResult = await query('DELETE FROM books WHERE id = $1 RETURNING id', [bookId]);
        
        if (deleteResult.rows.length > 0) {
          deletedCount++;
        } else {
          failedIds.push(bookId);
          errors.push(`Book ${bookId}: Not found`);
        }
      } catch (error) {
        console.error(`Error deleting book ${bookId}:`, error);
        failedIds.push(bookId);
        errors.push(`Failed to delete book ${bookId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    console.error('Error in DELETE /api/admin/books:', error);
    return NextResponse.json({ error: 'Failed to delete books' }, { status: 500 });
  }
}