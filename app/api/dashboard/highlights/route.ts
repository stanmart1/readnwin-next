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

    let highlightQuery = `
      SELECT 
        uh.id,
        uh.book_id,
        uh.page_number,
        uh.start_position,
        uh.end_position,
        uh.highlighted_text,
        uh.highlight_color,
        uh.note_text,
        uh.created_at,
        b.title as book_title
      FROM user_highlights uh
      JOIN books b ON uh.book_id = b.id
      WHERE uh.user_id = $1
    `;
    const queryParams = [userId];

    if (bookId) {
      highlightQuery += ` AND uh.book_id = $${queryParams.length + 1}`;
      queryParams.push(bookId);
    }

    if (pageNumber) {
      highlightQuery += ` AND uh.page_number = $${queryParams.length + 1}`;
      queryParams.push(pageNumber);
    }

    highlightQuery += ` ORDER BY uh.created_at DESC`;

    const result = await query(highlightQuery, queryParams);

    const highlights = result.rows.map(row => ({
      id: row.id,
      book_id: row.book_id,
      page_number: row.page_number,
      start_position: row.start_position,
      end_position: row.end_position,
      highlighted_text: row.highlighted_text,
      highlight_color: row.highlight_color,
      note_text: row.note_text,
      created_at: row.created_at,
      book_title: row.book_title
    }));

    return NextResponse.json({
      success: true,
      highlights
    });

  } catch (error) {
    console.error('Error fetching highlights:', error);
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
    const { 
      book_id, 
      page_number, 
      start_position, 
      end_position, 
      highlighted_text, 
      highlight_color = 'yellow',
      note_text 
    } = body;

    if (!book_id || !page_number || !start_position || !end_position || !highlighted_text) {
      return NextResponse.json(
        { error: 'Missing required fields: book_id, page_number, start_position, end_position, highlighted_text' },
        { status: 400 }
      );
    }

    // Create highlight
    const result = await query(`
      INSERT INTO user_highlights (
        user_id, book_id, page_number, start_position, end_position, 
        highlighted_text, highlight_color, note_text
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [userId, book_id, page_number, start_position, end_position, highlighted_text, highlight_color, note_text || null]);

    return NextResponse.json({
      success: true,
      highlight: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating highlight:', error);
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
    const { highlightId, highlightColor, noteText } = body;

    if (!highlightId) {
      return NextResponse.json(
        { error: 'Missing required field: highlightId' },
        { status: 400 }
      );
    }

    // Update highlight
    const result = await query(`
      UPDATE user_highlights 
      SET highlight_color = $3, note_text = $4
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [highlightId, userId, highlightColor, noteText]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Highlight not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      highlight: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating highlight:', error);
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
        { error: 'Missing highlight ID' },
        { status: 400 }
      );
    }

    // Delete highlight
    const result = await query(`
      DELETE FROM user_highlights 
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `, [id, userId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Highlight not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Highlight deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting highlight:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 