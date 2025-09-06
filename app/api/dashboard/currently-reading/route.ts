import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const client = await pool.connect();

    try {
      // Get currently reading books
      const result = await client.query(`
        SELECT 
          b.id,
          b.title,
          b.cover_image_url,
          COALESCE(rp.progress_percentage, 0) as progress_percentage,
          rp.current_page,
          COALESCE(rp.total_reading_time_seconds, 0) as total_reading_time_seconds,
          rp.last_read_at,
          COALESCE(a.name, 'Unknown Author') as author_name
        FROM reading_progress rp
        JOIN books b ON rp.book_id = b.id
        LEFT JOIN authors a ON b.author_id = a.id
        WHERE rp.user_id = $1 AND rp.progress_percentage > 0 AND rp.progress_percentage < 100
        ORDER BY rp.last_read_at DESC
        LIMIT 5
      `, [userId]);

      const books = result.rows.map(row => ({
        id: row.id,
        title: row.title,
        author_name: row.author_name,
        cover_image_url: row.cover_image_url,
        progress_percentage: parseFloat(row.progress_percentage) || 0,
        current_page: row.current_page,
        total_reading_time_seconds: parseInt(row.total_reading_time_seconds) || 0,
        last_read_at: row.last_read_at
      }));

      return NextResponse.json({
        success: true,
        books
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error fetching currently reading:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch currently reading books',
      books: []
    }, { status: 500 });
  }
}