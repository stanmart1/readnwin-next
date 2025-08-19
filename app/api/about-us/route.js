import { NextResponse } from 'next/server';
import { query } from '@/utils/database';

export async function GET() {
  try {
    const result = await query(
      'SELECT section, title, content, image_url, sort_order FROM about_us WHERE is_active = true ORDER BY sort_order, id'
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching about us content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch about us content' },
      { status: 500 }
    );
  }
}