import { NextResponse } from 'next/server';
import { query } from '@/utils/database';

export async function GET() {
  try {
    const requiredTables = [
      'reading_progress',
      'reading_sessions', 
      'user_library',
      'book_reviews',
      'user_goals',
      'user_activities',
      'user_notifications',
      'users',
      'books'
    ];

    const results = {};

    for (const tableName of requiredTables) {
      const result = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [tableName]);
      
      results[tableName] = result.rows[0].exists;
    }

    return NextResponse.json({
      success: true,
      tables: results
    });

  } catch (error) {
    console.error('Error checking tables:', error);
    return NextResponse.json({ 
      error: 'Failed to check tables',
      details: error.message 
    }, { status: 500 });
  }
}