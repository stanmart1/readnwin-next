import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';
import { sanitizeInt, sanitizeHtml } from '@/utils/security';

export async function PUT(request: NextRequest, context: any) {
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

    const { params } = context;
    const bookId = sanitizeInt(params.bookId);
    
    if (!bookId || bookId <= 0) {
      return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 });
    }

    const body = await request.json();
    const { 
      title, 
      author_id, 
      category_id, 
      price, 
      status, 
      stock_quantity, 
      is_featured,
      description,
      isbn,
      language,
      pages,
      publisher
    } = body;

    // Build dynamic update query
    const updates: string[] = [];
    const values: (string | number | boolean)[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(sanitizeHtml(title));
      paramIndex++;
    }

    if (author_id !== undefined) {
      const authorIdNum = sanitizeInt(author_id);
      if (authorIdNum > 0) {
        updates.push(`author_id = $${paramIndex}`);
        values.push(authorIdNum);
        paramIndex++;
      }
    }

    if (category_id !== undefined) {
      const categoryIdNum = sanitizeInt(category_id);
      if (categoryIdNum > 0) {
        updates.push(`category_id = $${paramIndex}`);
        values.push(categoryIdNum);
        paramIndex++;
      }
    }

    if (price !== undefined) {
      const priceNum = parseFloat(price);
      if (!isNaN(priceNum) && priceNum >= 0) {
        updates.push(`price = $${paramIndex}`);
        values.push(priceNum);
        paramIndex++;
      }
    }

    if (status !== undefined && ['published', 'draft', 'archived'].includes(status)) {
      updates.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    if (stock_quantity !== undefined) {
      const stockNum = sanitizeInt(stock_quantity);
      if (stockNum >= 0) {
        updates.push(`stock_quantity = $${paramIndex}`);
        values.push(stockNum);
        paramIndex++;
      }
    }

    if (is_featured !== undefined) {
      updates.push(`is_featured = $${paramIndex}`);
      values.push(Boolean(is_featured));
      paramIndex++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(sanitizeHtml(description));
      paramIndex++;
    }

    if (isbn !== undefined) {
      updates.push(`isbn = $${paramIndex}`);
      values.push(sanitizeHtml(isbn));
      paramIndex++;
    }

    if (language !== undefined) {
      updates.push(`language = $${paramIndex}`);
      values.push(sanitizeHtml(language));
      paramIndex++;
    }

    if (pages !== undefined) {
      const pagesNum = sanitizeInt(pages);
      if (pagesNum > 0) {
        updates.push(`pages = $${paramIndex}`);
        values.push(pagesNum);
        paramIndex++;
      }
    }

    if (publisher !== undefined) {
      updates.push(`publisher = $${paramIndex}`);
      values.push(sanitizeHtml(publisher));
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    // Add updated_at timestamp
    updates.push(`updated_at = NOW()`);
    
    // Add book ID as the last parameter
    values.push(bookId);

    const updateQuery = `
      UPDATE books 
      SET ${updates.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING id, title, status, is_featured
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Book updated successfully',
      book: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json(
      { error: 'Failed to update book' },
      { status: 500 }
    );
  }
}