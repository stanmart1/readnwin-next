import { NextResponse } from 'next/server';
import { query } from '@/utils/database';

export async function GET() {
  try {
    const result = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'books' 
      ORDER BY ordinal_position
    `);
    
    return NextResponse.json({
      columns: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}