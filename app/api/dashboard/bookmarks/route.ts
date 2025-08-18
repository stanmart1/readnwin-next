import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const pageNumber = searchParams.get('pageNumber');

    let bookmarkQuery = `
      SELECT 
        ub.id,
        ub.book_id,
        ub.page_number,
        ub.title,
        ub.description,
        ub.created_at,
        b.title as book_title
      FROM user_bookmarks ub
      JOIN books b ON ub.book_id = b.id
      WHERE ub.user_id = $1
    `;
    const queryParams = [userId];

    if (bookId) {
      bookmarkQuery += ` AND ub.book_id = $${queryParams.length + 1}`;
      queryParams.push(bookId);
    }

    if (pageNumber) {
      bookmarkQuery += ` AND ub.page_number = $${queryParams.length + 1}`;
      queryParams.push(pageNumber);
    }

    bookmarkQuery += ` ORDER BY ub.created_at DESC`;

    const result = await query(bookmarkQuery, queryParams);

    const bookmarks = result.rows.map(row => ({
      id: row.id,
      book_id: row.book_id,
      page_number: row.page_number,
      title: row.title,
      description: row.description,
      created_at: row.created_at,
      book_title: row.book_title
    }));

    return NextResponse.json({
      success: true,
      bookmarks
    });

  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { book_id, page_number, title, description } = body;

    if (!book_id || !page_number) {
      return NextResponse.json(
        { error: 'Missing required fields: book_id, page_number' },
        { status: 400 }
      );
    }

    // Check if bookmark already exists
    const existingResult = await query(`
      SELECT id FROM user_bookmarks 
      WHERE user_id = $1 AND book_id = $2 AND page_number = $3
    `, [userId, book_id, page_number]);

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Bookmark already exists for this page' },
        { status: 409 }
      );
    }

    // Create bookmark
    const result = await query(`
      INSERT INTO user_bookmarks (user_id, book_id, page_number, title, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [userId, book_id, page_number, title || null, description || null]);

    return NextResponse.json({
      success: true,
      bookmark: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const { bookmarkId, title, description } = body;

    if (!bookmarkId) {
      return NextResponse.json(
        { error: 'Missing required field: bookmarkId' },
        { status: 400 }
      );
    }

    // Update bookmark
    const result = await query(`
      UPDATE user_bookmarks 
      SET title = $3, description = $4
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [bookmarkId, userId, title, description]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      bookmark: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing bookmark ID' },
        { status: 400 }
      );
    }

    // Delete bookmark
    const result = await query(`
      DELETE FROM user_bookmarks 
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `, [id, userId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bookmark deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 