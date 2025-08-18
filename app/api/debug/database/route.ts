import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Database connection test requested');

    // Test 1: Basic connection test
    const connectionTest = await query('SELECT NOW() as current_time, version() as db_version');
    
    // Test 2: Check if books table exists
    const tableCheck = await query(`
      SELECT 
        table_name,
        column_name,
        data_type
      FROM information_schema.columns 
      WHERE table_name = 'books' 
      ORDER BY ordinal_position
    `);

    // Test 3: Count books
    const bookCount = await query('SELECT COUNT(*) as count FROM books');

    // Test 4: Check if specific book exists
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    
    let bookExists = null;
    if (bookId) {
      const bookCheck = await query('SELECT id, title FROM books WHERE id = $1', [parseInt(bookId)]);
      bookExists = bookCheck.rowCount && bookCheck.rowCount > 0 ? bookCheck.rows[0] : null;
    }

    return NextResponse.json({
      success: true,
      connection: {
        current_time: connectionTest.rows[0]?.current_time,
        db_version: connectionTest.rows[0]?.db_version?.split(' ')[0] // Just the version number
      },
      books_table: {
        exists: tableCheck.rowCount && tableCheck.rowCount > 0,
        columns: tableCheck.rows.map(row => ({ name: row.column_name, type: row.data_type })),
        total_books: bookCount.rows[0]?.count || 0
      },
      specific_book: bookExists ? {
        id: bookExists.id,
        title: bookExists.title,
        exists: true
      } : {
        id: bookId,
        exists: false
      }
    });

  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code || 'Unknown'
    }, { status: 500 });
  }
} 