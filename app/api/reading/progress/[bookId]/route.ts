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
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(`
      SELECT * FROM reading_progress 
      WHERE book_id = $1 AND user_id = $2
    `, [params.bookId, session.user.id]);

    return NextResponse.json({
      success: true,
      progress: result.rows[0] || null
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const progress = await request.json();

    await query(`
      INSERT INTO reading_progress (book_id, user_id, current_position, progress_percentage, last_read_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (book_id, user_id) 
      DO UPDATE SET 
        current_position = $3,
        progress_percentage = $4,
        last_read_at = NOW()
    `, [params.bookId, session.user.id, progress.current_position, progress.progress_percentage]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
  }
}