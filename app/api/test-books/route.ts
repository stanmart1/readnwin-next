import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing books API...');
    
    // Simple query to get books
    const result = await query(`
      SELECT 
        b.id,
        b.title,
        b.author_id,
        b.status,
        a.name as author_name,
        c.name as category_name
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.status = 'published'
      LIMIT 5
    `);
    
    console.log('✅ Query successful, found books:', result.rows.length);
    
    return NextResponse.json({
      success: true,
      books: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('❌ Test books API failed:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 