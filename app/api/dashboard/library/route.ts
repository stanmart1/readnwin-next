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

    // Create required tables
    await query(`
      CREATE TABLE IF NOT EXISTS authors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author_id INTEGER REFERENCES authors(id),
        cover_image_url TEXT,
        format VARCHAR(50) DEFAULT 'ebook',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS user_library (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        access_type VARCHAR(50) DEFAULT 'purchased',
        status VARCHAR(50) DEFAULT 'active',
        UNIQUE(user_id, book_id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS reading_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        progress_percentage DECIMAL(5,2) DEFAULT 0,
        last_read_at TIMESTAMP,
        completed_at TIMESTAMP,
        total_reading_time_seconds INTEGER DEFAULT 0,
        UNIQUE(user_id, book_id)
      )
    `);

    // Get user library books
    const result = await query(`
      SELECT 
        b.id,
        b.title,
        COALESCE(a.name, 'Unknown Author') as author_name,
        b.cover_image_url,
        COALESCE(b.book_type, 'ebook') as book_type,
        COALESCE(b.book_type, 'ebook') as primary_format,
        COALESCE(rp.progress_percentage, 0) as progress_percentage,
        rp.last_read_at,
        rp.completed_at,
        COALESCE(rp.total_reading_time_seconds, 0) as total_reading_time_seconds,
        ul.added_at,
        ul.access_type
      FROM user_library ul
      JOIN books b ON ul.book_id = b.id
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN reading_progress rp ON ul.book_id = rp.book_id AND ul.user_id = rp.user_id
      WHERE ul.user_id = $1 AND ul.status = 'active'
      ORDER BY ul.added_at DESC
    `, [userId]);

    const books = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      author_name: row.author_name,
      cover_image_url: row.cover_image_url,
      book_type: row.book_type || 'ebook',
      primary_format: row.primary_format || 'ebook',
      progress_percentage: parseFloat(row.progress_percentage) || 0,
      last_read_at: row.last_read_at,
      completed_at: row.completed_at,
      total_reading_time_seconds: parseInt(row.total_reading_time_seconds) || 0,
      added_at: row.added_at,
      access_type: row.access_type
    }));

    return NextResponse.json({
      success: true,
      books
    });

  } catch (error) {
    console.error('Error fetching library:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch library',
      books: []
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
    const { bookId, accessType = 'purchased' } = await request.json();

    // Add book to user library
    await query(`
      INSERT INTO user_library (user_id, book_id, access_type)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, book_id) DO NOTHING
    `, [userId, bookId, accessType]);

    return NextResponse.json({
      success: true,
      message: 'Book added to library successfully'
    });

  } catch (error) {
    console.error('Error adding book to library:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to add book to library'
    }, { status: 500 });
  }
}