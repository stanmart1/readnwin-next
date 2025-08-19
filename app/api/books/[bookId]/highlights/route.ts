import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

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
      SELECT ul.user_id
      FROM user_library ul
      WHERE ul.book_id = $1 AND ul.user_id = $2
    `, [bookId, userId]);

    if (accessCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Access denied. Book not in your library.' },
        { status: 403 }
      );
    }

    // Get highlights for this book
    const highlightsResult = await query(`
      SELECT
        id,
        book_id as "bookId",
        user_id as "userId",
        text,
        start_offset as "startOffset",
        end_offset as "endOffset",
        color,
        note,
        created_at as "createdAt",
        chapter_index as "chapterIndex",
        position
      FROM highlights
      WHERE book_id = $1 AND user_id = $2
      ORDER BY created_at DESC
    `, [bookId, userId]);

    const highlights = highlightsResult.rows.map(row => ({
      id: row.id,
      bookId: row.bookId,
      userId: row.userId,
      text: row.text,
      startOffset: row.startOffset,
      endOffset: row.endOffset,
      color: row.color,
      note: row.note,
      createdAt: row.createdAt,
      chapterIndex: row.chapterIndex,
      position: row.position
    }));

    return NextResponse.json(highlights);

  } catch (error) {
    console.error('Error fetching highlights:', error);
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

    if (isNaN(bookId)) {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    const highlightData = await request.json();

    // Validate required fields
    if (!highlightData.text ||
        typeof highlightData.startOffset !== 'number' ||
        typeof highlightData.endOffset !== 'number' ||
        !highlightData.color) {
      return NextResponse.json(
        { error: 'Invalid highlight data' },
        { status: 400 }
      );
    }

    // Check if user has access to this book
    const accessCheck = await query(`
      SELECT ul.user_id
      FROM user_library ul
      WHERE ul.book_id = $1 AND ul.user_id = $2
    `, [bookId, userId]);

    if (accessCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Access denied. Book not in your library.' },
        { status: 403 }
      );
    }

    // Insert new highlight
    const result = await query(`
      INSERT INTO highlights (
        book_id,
        user_id,
        text,
        start_offset,
        end_offset,
        color,
        note,
        chapter_index,
        position,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *
    `, [
      bookId,
      userId,
      highlightData.text,
      highlightData.startOffset,
      highlightData.endOffset,
      highlightData.color,
      highlightData.note || null,
      highlightData.chapterIndex || null,
      highlightData.position || 0
    ]);

    const newHighlight = result.rows[0];

    return NextResponse.json({
      success: true,
      highlight: {
        id: newHighlight.id,
        bookId: newHighlight.book_id,
        userId: newHighlight.user_id,
        text: newHighlight.text,
        startOffset: newHighlight.start_offset,
        endOffset: newHighlight.end_offset,
        color: newHighlight.color,
        note: newHighlight.note,
        createdAt: newHighlight.created_at,
        chapterIndex: newHighlight.chapter_index,
        position: newHighlight.position
      }
    });

  } catch (error) {
    console.error('Error creating highlight:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const { searchParams } = new URL(request.url);
    const highlightId = searchParams.get('highlightId');

    if (isNaN(bookId)) {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    if (!highlightId) {
      return NextResponse.json(
        { error: 'Highlight ID required' },
        { status: 400 }
      );
    }

    // Delete highlight (only if user owns it)
    const result = await query(`
      DELETE FROM highlights
      WHERE id = $1 AND book_id = $2 AND user_id = $3
      RETURNING id
    `, [highlightId, bookId, userId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Highlight not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting highlight:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
