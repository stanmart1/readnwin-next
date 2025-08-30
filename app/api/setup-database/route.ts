import { NextResponse } from 'next/server';
import { query } from '@/utils/database';

export async function POST() {
  try {
    const createQueries = [
      // Book files table
      `CREATE TABLE IF NOT EXISTS book_files (
        id SERIAL PRIMARY KEY,
        book_id INTEGER NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        stored_filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size BIGINT NOT NULL,
        mime_type VARCHAR(100),
        file_format VARCHAR(50),
        processing_status VARCHAR(50) DEFAULT 'pending',
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(book_id, file_type)
      )`,
      
      // Orders table
      `CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        order_number VARCHAR(100) UNIQUE NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        payment_status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50),
        payment_reference VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Order items table
      `CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // User library table
      `CREATE TABLE IF NOT EXISTS user_library (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        access_type VARCHAR(50) DEFAULT 'purchased',
        status VARCHAR(50) DEFAULT 'active',
        UNIQUE(user_id, book_id)
      )`
    ];

    const results = [];
    for (const createQuery of createQueries) {
      try {
        await query(createQuery);
        const tableName = createQuery.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
        results.push({ table: tableName, success: true });
      } catch (error) {
        const tableName = createQuery.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
        results.push({ table: tableName, success: false, error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database tables created',
      results
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to create tables',
      details: error.message 
    }, { status: 500 });
  }
}