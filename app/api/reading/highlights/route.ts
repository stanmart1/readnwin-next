import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    const result = await query(`
      INSERT INTO user_highlights (
        user_id, book_id, chapter_id, highlighted_text, start_offset, 
        end_offset, color, note, context_before, context_after
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      session.user.id,
      data.book_id,
      data.chapter_id,
      data.highlighted_text,
      data.start_offset,
      data.end_offset,
      data.color || 'yellow',
      data.note,
      data.context_before,
      data.context_after
    ]);

    return NextResponse.json({
      success: true,
      highlight: result.rows[0],
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create highlight' }, { status: 500 });
  }
}