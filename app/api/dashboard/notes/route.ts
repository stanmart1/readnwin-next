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

    let noteQuery = `
      SELECT 
        un.id,
        un.book_id,
        un.page_number,
        un.note_text,
        un.note_type,
        un.created_at,
        un.updated_at,
        b.title as book_title
      FROM user_notes un
      JOIN books b ON un.book_id = b.id
      WHERE un.user_id = $1
    `;
    const queryParams = [userId];

    if (bookId) {
      noteQuery += ` AND un.book_id = $${queryParams.length + 1}`;
      queryParams.push(bookId);
    }

    if (pageNumber) {
      noteQuery += ` AND un.page_number = $${queryParams.length + 1}`;
      queryParams.push(pageNumber);
    }

    noteQuery += ` ORDER BY un.created_at DESC`;

    const result = await query(noteQuery, queryParams);

    const notes = result.rows.map(row => ({
      id: row.id,
      book_id: row.book_id,
      page_number: row.page_number,
      note_text: row.note_text,
      note_type: row.note_type,
      created_at: row.created_at,
      updated_at: row.updated_at,
      book_title: row.book_title
    }));

    return NextResponse.json({
      success: true,
      notes
    });

  } catch (error) {
    console.error('Error fetching notes:', error);
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
    const { book_id, page_number, note_text, note_type = 'general' } = body;

    if (!book_id || !page_number || !note_text) {
      return NextResponse.json(
        { error: 'Missing required fields: book_id, page_number, note_text' },
        { status: 400 }
      );
    }

    // Create note
    const result = await query(`
      INSERT INTO user_notes (user_id, book_id, page_number, note_text, note_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [userId, book_id, page_number, note_text, note_type]);

    return NextResponse.json({
      success: true,
      note: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating note:', error);
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
    const { noteId, noteText, noteType } = body;

    if (!noteId || !noteText) {
      return NextResponse.json(
        { error: 'Missing required fields: noteId, noteText' },
        { status: 400 }
      );
    }

    // Update note
    const result = await query(`
      UPDATE user_notes 
      SET note_text = $3, note_type = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [noteId, userId, noteText, noteType || 'general']);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      note: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating note:', error);
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
        { error: 'Missing note ID' },
        { status: 400 }
      );
    }

    // Delete note
    const result = await query(`
      DELETE FROM user_notes 
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `, [id, userId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Note deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 