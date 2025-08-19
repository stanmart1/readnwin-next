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

    // Get user's library books with reading progress
    const result = await query(`
      SELECT 
        b.id,
        b.title,
        a.name as author_name,
        b.cover_image_url,
        b.book_type,
        b.primary_format,
        COALESCE(rp.progress_percentage, 0) as progress_percentage,
        rp.last_read_at,
        rp.completed_at,
        COALESCE(rp.total_reading_time_seconds, 0) as total_reading_time_seconds,
        ul.added_at
      FROM user_library ul
      JOIN books b ON ul.book_id = b.id
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN reading_progress rp ON (rp.book_id = b.id AND rp.user_id = ul.user_id)
      WHERE ul.user_id = $1 AND b.status = 'published'
      ORDER BY 
        CASE 
          WHEN rp.last_read_at IS NOT NULL THEN rp.last_read_at 
          ELSE ul.added_at 
        END DESC
    `, [userId]);

    const books = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      author_name: row.author_name || 'Unknown Author',
      cover_image_url: row.cover_image_url,
      book_type: row.book_type,
      primary_format: row.primary_format,
      progress_percentage: parseFloat(row.progress_percentage) || 0,
      last_read_at: row.last_read_at,
      completed_at: row.completed_at,
      total_reading_time_seconds: parseInt(row.total_reading_time_seconds) || 0
    }));

    return NextResponse.json({
      success: true,
      books
    });

  } catch (error) {
    console.error('Error fetching user library:', error);
    return NextResponse.json({ error: 'Failed to fetch library' }, { status: 500 });
  }
}