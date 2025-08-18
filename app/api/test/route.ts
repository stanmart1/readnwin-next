import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Test API called');
    
    // Test database connection
    const dbTest = await query('SELECT version()');
    console.log('✅ Database connection successful');
    
    // Test users table
    const userCount = await query('SELECT COUNT(*) as count FROM users');
    console.log('✅ Users table accessible');
    
    // Test books table
    const bookCount = await query('SELECT COUNT(*) as count FROM books');
    console.log('✅ Books table accessible');
    
    // Test orders table
    const orderCount = await query('SELECT COUNT(*) as count FROM orders');
    console.log('✅ Orders table accessible');
    
    // Test cart items table
    const cartCount = await query('SELECT COUNT(*) as count FROM cart_items');
    console.log('✅ Cart items table accessible');

    return NextResponse.json({
      success: true,
      message: 'All database connections working',
      data: {
        database_version: dbTest.rows[0].version,
        users_count: parseInt(userCount.rows[0].count),
        books_count: parseInt(bookCount.rows[0].count),
        orders_count: parseInt(orderCount.rows[0].count),
        cart_items_count: parseInt(cartCount.rows[0].count)
      }
    });

  } catch (error) {
    console.error('❌ Test API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 