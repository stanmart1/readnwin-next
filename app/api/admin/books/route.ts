import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';
import { sanitizeInt } from '@/utils/security';
import { imageStorageService } from '@/utils/image-storage-service';
import { SecurityUtils } from '@/utils/security-utils';

export const dynamic = 'force-dynamic';

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
      const buffer = Buffer.from(await cover_image.arrayBuffer());
      const timestamp = Date.now();
      const safeExtension = SecurityUtils.sanitizeFilename(cover_image.name.split('.').pop() || 'jpg');
      const filename = `${bookId}_cover_${timestamp}.${safeExtension}`;
      
      const imageId = await imageStorageService.uploadImage({
        filename,
        originalFilename: cover_image.name,
        mimeType: cover_image.type,
        buffer,
        category: 'cover',
        entityType: 'book',
        entityId: bookId,
        uploadedBy: parseInt(session.user.id)
      });
      
      coverUrl = `/api/images/covers/${filename}`;
    } catch (uploadError) {
      await query('DELETE FROM books WHERE id = $1', [bookId]);
      console.error('Cover upload failed:', SecurityUtils.sanitizeForLog(uploadError));
      return NextResponse.json({ error: 'Failed to upload cover image' }, { status: 500 });
    }

    // Store ebook file directly without processing
    let ebookUrl = null;
    if (ebook_file) {
      try {
        const ebookBuffer = Buffer.from(await ebook_file.arrayBuffer());
        
        const { writeFileSync, mkdirSync, existsSync } = require('fs');
        const { join } = require('path');
        
        const storageDir = join(process.cwd(), 'storage', 'books', bookId.toString());
        if (!existsSync(storageDir)) {
          mkdirSync(storageDir, { recursive: true });
        }
        
        const timestamp = Date.now();
        const safeFilename = SecurityUtils.sanitizeFilename(ebook_file.name);
        const fileExtension = safeFilename.split('.').pop() || 'epub';
        const filename = `book_${bookId}_${timestamp}.${fileExtension}`;
        const filePath = join(storageDir, filename);
        
        writeFileSync(filePath, ebookBuffer);
        ebookUrl = `/storage/books/${bookId}/${filename}`;
        
      } catch (ebookError) {
        await query('DELETE FROM books WHERE id = $1', [bookId]);
        console.error('Ebook save error:', ebookError);
        return NextResponse.json({ error: 'Failed to save e-book file' }, { status: 500 });
      }
    }

    // Update book with file URLs
    await query(`
      UPDATE books SET 
        cover_image_url = $2,
        ebook_file_url = $3
      WHERE id = $1
    `, [bookId, coverUrl, ebookUrl]);

    return NextResponse.json({
      success: true,
      message: 'Book uploaded successfully',
      bookId,
      ebookUrl
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

    try {
      await query('BEGIN');
      
      for (const bookId of bookIdArray) {
        await query('DELETE FROM cart_items WHERE book_id = $1', [bookId]);
        await query('DELETE FROM order_items WHERE book_id = $1', [bookId]);
        await query('DELETE FROM user_library WHERE book_id = $1', [bookId]);
        await query('DELETE FROM book_reviews WHERE book_id = $1', [bookId]);
        await query('DELETE FROM reading_progress WHERE book_id = $1', [bookId]);
        
        const deleteResult = await query('DELETE FROM books WHERE id = $1 RETURNING id', [bookId]);
        
        if (deleteResult.rows.length > 0) {
          deletedCount++;
        }
      }
      
      await query('COMMIT');
    } catch (transactionError) {
      await query('ROLLBACK');
      throw transactionError;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} books`,
      deleted_count: deletedCount
    });

  } catch (error) {
    console.error('Error in DELETE /api/admin/books:', error);
    return NextResponse.json({ error: 'Failed to delete books' }, { status: 500 });
  }
}