import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/utils/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const bookId = parseInt(params.bookId);

    if (isNaN(bookId)) {
      return NextResponse.json({ error: "Invalid book ID" }, { status: 400 });
    }

    // Check if user has access to this book
    const accessCheck = await query(
      `
      SELECT ul.user_id
      FROM user_library ul
      WHERE ul.book_id = $1 AND ul.user_id = $2
    `,
      [bookId, userId],
    );

    if (accessCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Access denied. Book not in your library." },
        { status: 403 },
      );
    }

    // Get notes for this book
    const notesResult = await query(
      `
      SELECT
        id,
        book_id as "bookId",
        user_id as "userId",
        title,
        content,
        category,
        tags,
        attached_to_highlight as "attachedToHighlight",
        position,
        chapter_index as "chapterIndex",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM notes
      WHERE book_id = $1 AND user_id = $2
      ORDER BY created_at DESC
    `,
      [bookId, userId],
    );

    const notes = notesResult.rows.map((row) => ({
      id: row.id,
      bookId: row.bookId,
      userId: row.userId,
      title: row.title,
      content: row.content,
      category: row.category,
      tags: row.tags ? JSON.parse(row.tags) : [],
      attachedToHighlight: row.attachedToHighlight,
      position: row.position,
      chapterIndex: row.chapterIndex,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { bookId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const bookId = parseInt(params.bookId);

    if (isNaN(bookId)) {
      return NextResponse.json({ error: "Invalid book ID" }, { status: 400 });
    }

    const noteData = await request.json();

    // Validate required fields
    if (!noteData.title || !noteData.content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 },
      );
    }

    // Check if user has access to this book
    const accessCheck = await query(
      `
      SELECT ul.user_id
      FROM user_library ul
      WHERE ul.book_id = $1 AND ul.user_id = $2
    `,
      [bookId, userId],
    );

    if (accessCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Access denied. Book not in your library." },
        { status: 403 },
      );
    }

    // Insert new note
    const result = await query(
      `
      INSERT INTO notes (
        book_id,
        user_id,
        title,
        content,
        category,
        tags,
        attached_to_highlight,
        position,
        chapter_index,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
    `,
      [
        bookId,
        userId,
        noteData.title,
        noteData.content,
        noteData.category || null,
        noteData.tags ? JSON.stringify(noteData.tags) : null,
        noteData.attachedToHighlight || null,
        noteData.position || 0,
        noteData.chapterIndex || null,
      ],
    );

    const newNote = result.rows[0];

    return NextResponse.json({
      success: true,
      note: {
        id: newNote.id,
        bookId: newNote.book_id,
        userId: newNote.user_id,
        title: newNote.title,
        content: newNote.content,
        category: newNote.category,
        tags: newNote.tags ? JSON.parse(newNote.tags) : [],
        attachedToHighlight: newNote.attached_to_highlight,
        position: newNote.position,
        chapterIndex: newNote.chapter_index,
        createdAt: newNote.created_at,
        updatedAt: newNote.updated_at,
      },
    });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { bookId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const bookId = parseInt(params.bookId);
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get("noteId");

    if (isNaN(bookId)) {
      return NextResponse.json({ error: "Invalid book ID" }, { status: 400 });
    }

    if (!noteId) {
      return NextResponse.json({ error: "Note ID required" }, { status: 400 });
    }

    const updateData = await request.json();

    // Update note (only if user owns it)
    const result = await query(
      `
      UPDATE notes
      SET
        title = COALESCE($1, title),
        content = COALESCE($2, content),
        category = COALESCE($3, category),
        tags = COALESCE($4, tags),
        updated_at = NOW()
      WHERE id = $5 AND book_id = $6 AND user_id = $7
      RETURNING *
    `,
      [
        updateData.title,
        updateData.content,
        updateData.category,
        updateData.tags ? JSON.stringify(updateData.tags) : null,
        noteId,
        bookId,
        userId,
      ],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Note not found or access denied" },
        { status: 404 },
      );
    }

    const updatedNote = result.rows[0];

    return NextResponse.json({
      success: true,
      note: {
        id: updatedNote.id,
        bookId: updatedNote.book_id,
        userId: updatedNote.user_id,
        title: updatedNote.title,
        content: updatedNote.content,
        category: updatedNote.category,
        tags: updatedNote.tags ? JSON.parse(updatedNote.tags) : [],
        attachedToHighlight: updatedNote.attached_to_highlight,
        position: updatedNote.position,
        chapterIndex: updatedNote.chapter_index,
        createdAt: updatedNote.created_at,
        updatedAt: updatedNote.updated_at,
      },
    });
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { bookId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const bookId = parseInt(params.bookId);
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get("noteId");

    if (isNaN(bookId)) {
      return NextResponse.json({ error: "Invalid book ID" }, { status: 400 });
    }

    if (!noteId) {
      return NextResponse.json({ error: "Note ID required" }, { status: 400 });
    }

    // Delete note (only if user owns it)
    const result = await query(
      `
      DELETE FROM notes
      WHERE id = $1 AND book_id = $2 AND user_id = $3
      RETURNING id
    `,
      [noteId, bookId, userId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Note not found or access denied" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
