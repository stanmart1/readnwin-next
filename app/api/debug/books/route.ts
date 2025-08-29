import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Books API: Starting...');
    
    // Check session
    const session = await getServerSession(authOptions);
    console.log('Session:', session ? 'Found' : 'Not found');
    
    if (session?.user) {
      console.log('User ID:', session.user.id);
      console.log('User Role:', session.user.role);
      console.log('User Email:', session.user.email);
    }
    
    // Test database connection
    console.log('Testing database connection...');
    const dbTest = await query('SELECT NOW() as current_time');
    console.log('Database connection successful:', dbTest.rows[0].current_time);
    
    // Check if tables exist
    const tablesCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('books', 'authors', 'categories', 'users')
      ORDER BY table_name
    `);
    
    const existingTables = tablesCheck.rows.map(row => row.table_name);
    console.log('Existing tables:', existingTables);
    
    // Count records in each table
    const counts = {};
    for (const table of existingTables) {
      try {
        const countResult = await query(`SELECT COUNT(*) as count FROM ${table}`);
        counts[table] = parseInt(countResult.rows[0].count);
      } catch (error) {
        counts[table] = `Error: ${error.message}`;
      }
    }
    
    console.log('Table counts:', counts);
    
    // Try to fetch books with a simple query
    let booksData = [];
    let booksError = null;
    
    if (existingTables.includes('books')) {
      try {
        const booksResult = await query(`
          SELECT 
            b.id,
            b.title,
            b.status,
            b.created_at,
            COALESCE(b.price, 0) as price,
            COALESCE(b.stock_quantity, 0) as stock_quantity,
            COALESCE(b.is_featured, false) as is_featured
          FROM books b
          ORDER BY b.created_at DESC
          LIMIT 5
        `);
        booksData = booksResult.rows;
      } catch (error) {
        booksError = error.message;
      }
    }
    
    // Try to fetch books with joins
    let booksWithJoins = [];
    let joinsError = null;
    
    if (existingTables.includes('books') && existingTables.includes('authors') && existingTables.includes('categories')) {
      try {
        const joinResult = await query(`
          SELECT 
            b.id,
            b.title,
            b.status,
            b.created_at,
            a.name as author_name,
            c.name as category_name
          FROM books b
          LEFT JOIN authors a ON b.author_id = a.id
          LEFT JOIN categories c ON b.category_id = c.id
          ORDER BY b.created_at DESC
          LIMIT 3
        `);
        booksWithJoins = joinResult.rows;
      } catch (error) {
        joinsError = error.message;
      }
    }
    
    return NextResponse.json({
      success: true,
      debug: {
        session: session ? {
          userId: session.user?.id,
          userRole: session.user?.role,
          userEmail: session.user?.email
        } : null,
        database: {
          connected: true,
          currentTime: dbTest.rows[0].current_time
        },
        tables: {
          existing: existingTables,
          counts: counts
        },
        books: {
          simple: {
            data: booksData,
            error: booksError
          },
          withJoins: {
            data: booksWithJoins,
            error: joinsError
          }
        }
      }
    });
    
  } catch (error) {
    console.error('Debug API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      debug: {
        errorType: error.constructor.name,
        errorStack: error.stack
      }
    }, { status: 500 });
  }
}