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

    // Create tables if they don't exist
    await query(`
      CREATE TABLE IF NOT EXISTS reading_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        session_end TIMESTAMP NULL,
        start_page INTEGER,
        end_page INTEGER,
        pages_read INTEGER DEFAULT 0,
        reading_time_minutes INTEGER DEFAULT 0,
        reading_speed_wpm DECIMAL(5,2),
        device_info JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    let sessionQuery = `
      SELECT 
        rs.id,
        rs.book_id,
        rs.session_start,
        rs.session_end,
        rs.start_page,
        rs.end_page,
        rs.pages_read,
        rs.reading_time_minutes,
        rs.reading_speed_wpm,
        rs.device_info,
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

    const sessions = result.rows.map(row => ({
      id: row.id,
      book_id: row.book_id,
      session_start: row.session_start,
      session_end: row.session_end,
      start_page: row.start_page,
      end_page: row.end_page,
      pages_read: row.pages_read,
      reading_time_minutes: row.reading_time_minutes,
      reading_speed_wpm: row.reading_speed_wpm,
      device_info: row.device_info,
      created_at: row.created_at,
      book_title: row.book_title,
      book_author: row.author_name
    }));

    return NextResponse.json({
      success: true,
      sessions
    });

  } catch (error) {
    console.error('Error fetching reading sessions:', error);
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
      session_start, 
      session_end, 
      start_page, 
      end_page, 
      pages_read, 
      reading_time_minutes, 
      reading_speed_wpm,
      device_info 
    } = body;

    if (!book_id || !session_start || !start_page) {
      return NextResponse.json(
        { error: 'Missing required fields: book_id, session_start, start_page' },
        { status: 400 }
      );
    }

    // Create reading session
    const result = await query(`
      INSERT INTO reading_sessions (
        user_id, book_id, session_start, session_end, start_page, end_page,
        pages_read, reading_time_minutes, reading_speed_wpm, device_info
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      userId, book_id, session_start, session_end || null, start_page, 
      end_page || null, pages_read || 0, reading_time_minutes || 0, 
      reading_speed_wpm || null, device_info || null
    ]);

    // Update reading progress if session ended
    if (session_end && end_page) {
      await query(`
        INSERT INTO reading_progress (user_id, book_id, current_page, total_pages, progress_percentage, last_read_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id, book_id) 
        DO UPDATE SET 
          current_page = EXCLUDED.current_page,
          total_pages = EXCLUDED.total_pages,
          progress_percentage = EXCLUDED.progress_percentage,
          last_read_at = EXCLUDED.last_read_at,
          updated_at = CURRENT_TIMESTAMP
      `, [userId, book_id, end_page, end_page, 100, session_end]);
    }

    return NextResponse.json({
      success: true,
      session: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating reading session:', error);
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { 
      session_id, 
      session_end, 
      end_page, 
      pages_read, 
      reading_time_minutes, 
      reading_speed_wpm 
    } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: 'Missing required field: session_id' },
        { status: 400 }
      );
    }

    // Update reading session
    const result = await query(`
      UPDATE reading_sessions 
      SET 
        session_end = COALESCE($1, session_end),
        end_page = COALESCE($2, end_page),
        pages_read = COALESCE($3, pages_read),
        reading_time_minutes = COALESCE($4, reading_time_minutes),
        reading_speed_wpm = COALESCE($5, reading_speed_wpm)
      WHERE id = $6 AND user_id = $7
      RETURNING *
    `, [session_end, end_page, pages_read, reading_time_minutes, reading_speed_wpm, session_id, userId]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Reading session not found' },
        { status: 404 }
      );
    }

    // Update reading progress if session ended
    if (session_end && end_page) {
      const sessionData = result.rows[0];
      await query(`
        INSERT INTO reading_progress (user_id, book_id, current_page, total_pages, progress_percentage, last_read_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id, book_id) 
        DO UPDATE SET 
          current_page = EXCLUDED.current_page,
          total_pages = EXCLUDED.total_pages,
          progress_percentage = EXCLUDED.progress_percentage,
          last_read_at = EXCLUDED.last_read_at,
          updated_at = CURRENT_TIMESTAMP
      `, [userId, sessionData.book_id, end_page, end_page, 100, session_end]);
    }

    return NextResponse.json({
      success: true,
      session: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating reading session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 