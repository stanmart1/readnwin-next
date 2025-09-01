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
    const limit = parseInt(searchParams.get('limit') || '20');

    // Create table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS reading_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        session_end TIMESTAMP NULL,
        duration_seconds INTEGER DEFAULT 0,
        pages_read INTEGER DEFAULT 0,
        progress_start DECIMAL(5,2) DEFAULT 0,
        progress_end DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    let sessionQuery = `
      SELECT 
        rs.id,
        rs.book_id,
        rs.session_start,
        rs.session_end,
        rs.duration_seconds,
        rs.pages_read,
        rs.progress_start,
        rs.progress_end,
        rs.created_at,
        COALESCE(b.title, 'Unknown Book') as book_title,
        COALESCE(a.name, 'Unknown Author') as author_name
      FROM reading_sessions rs
      LEFT JOIN books b ON rs.book_id = b.id
      LEFT JOIN authors a ON b.author_id = a.id
      WHERE rs.user_id = $1
    `;
    const queryParams = [userId];

    if (bookId) {
      sessionQuery += ` AND rs.book_id = $${queryParams.length + 1}`;
      queryParams.push(bookId);
    }

    sessionQuery += ` ORDER BY rs.session_start DESC LIMIT $${queryParams.length + 1}`;
    queryParams.push(limit.toString());

    const result = await query(sessionQuery, queryParams);

    const sessions = result.rows.map((row: {
      id: number;
      book_id: number;
      session_start: string;
      session_end: string | null;
      duration_seconds: number;
      pages_read: number;
      progress_start: string;
      progress_end: string;
      created_at: string;
      book_title: string;
      author_name: string;
    }) => ({
      id: row.id,
      bookId: row.book_id,
      sessionStart: row.session_start,
      sessionEnd: row.session_end,
      durationSeconds: row.duration_seconds,
      durationMinutes: Math.round((row.duration_seconds || 0) / 60 * 100) / 100,
      pagesRead: row.pages_read,
      progressStart: parseFloat(row.progress_start) || 0,
      progressEnd: parseFloat(row.progress_end) || 0,
      progressGain: Math.round(((parseFloat(row.progress_end) || 0) - (parseFloat(row.progress_start) || 0)) * 100) / 100,
      createdAt: row.created_at,
      bookTitle: row.book_title,
      authorName: row.author_name
    }));

    return NextResponse.json({
      success: true,
      sessions
    });

  } catch (error) {
    console.error('Error fetching reading sessions:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch reading sessions',
      sessions: []
    }, { status: 500 });
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
      bookId, 
      sessionStart, 
      sessionEnd, 
      durationSeconds, 
      pagesRead, 
      progressStart, 
      progressEnd 
    } = body;

    if (!bookId || !sessionStart) {
      return NextResponse.json(
        { error: 'Missing required fields: bookId, sessionStart' },
        { status: 400 }
      );
    }

    // Create table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS reading_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        session_end TIMESTAMP NULL,
        duration_seconds INTEGER DEFAULT 0,
        pages_read INTEGER DEFAULT 0,
        progress_start DECIMAL(5,2) DEFAULT 0,
        progress_end DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create reading session
    const result = await query(`
      INSERT INTO reading_sessions (
        user_id, book_id, session_start, session_end, duration_seconds,
        pages_read, progress_start, progress_end
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      userId, bookId, sessionStart, sessionEnd || null, durationSeconds || 0,
      pagesRead || 0, progressStart || 0, progressEnd || 0
    ]);

    // Update reading progress if session ended
    if (sessionEnd && progressEnd !== undefined) {
      await query(`
        CREATE TABLE IF NOT EXISTS reading_progress (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          book_id INTEGER NOT NULL,
          progress_percentage DECIMAL(5,2) DEFAULT 0,
          current_chapter_id VARCHAR(255),
          current_position INTEGER DEFAULT 0,
          pages_read INTEGER DEFAULT 0,
          total_reading_time_seconds INTEGER DEFAULT 0,
          last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, book_id)
        )
      `);

      await query(`
        INSERT INTO reading_progress (user_id, book_id, progress_percentage, pages_read, total_reading_time_seconds, last_read_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id, book_id) 
        DO UPDATE SET 
          progress_percentage = GREATEST(reading_progress.progress_percentage, $3),
          pages_read = GREATEST(reading_progress.pages_read, $4),
          total_reading_time_seconds = reading_progress.total_reading_time_seconds + $5,
          last_read_at = $6,
          updated_at = CURRENT_TIMESTAMP
      `, [userId, bookId, progressEnd, pagesRead || 0, durationSeconds || 0, sessionEnd]);
    }

    return NextResponse.json({
      success: true,
      session: {
        id: result.rows[0].id,
        bookId: result.rows[0].book_id,
        sessionStart: result.rows[0].session_start,
        sessionEnd: result.rows[0].session_end,
        durationSeconds: result.rows[0].duration_seconds,
        pagesRead: result.rows[0].pages_read,
        progressStart: parseFloat(result.rows[0].progress_start),
        progressEnd: parseFloat(result.rows[0].progress_end)
      }
    });

  } catch (error) {
    console.error('Error creating reading session:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create reading session'
    }, { status: 500 });
  }
}