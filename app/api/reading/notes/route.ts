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
      INSERT INTO user_notes (
        user_id, book_id, chapter_id, highlight_id, title, content, 
        note_type, position_offset, tags, category
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      session.user.id,
      data.book_id,
      data.chapter_id,
      data.highlight_id,
      data.title,
      data.content,
      data.note_type || 'general',
      data.position_offset,
      data.tags || [],
      data.category
    ]);

    return NextResponse.json({
      success: true,
      note: result.rows[0],
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}