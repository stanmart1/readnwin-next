const { Pool } = require('pg');

const pool = new Pool({
  host: '149.102.159.118',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '6c8u2MsYqlbQxL5IxftjrV7QQnlLymdsmzMtTeIe4Ur1od7RR9CdODh3VfQ4ka2f',
  ssl: false
});

async function createMissingColumns() {
  try {
    console.log('Adding missing columns...');

    // Add missing columns to reading_progress
    await pool.query(`
      ALTER TABLE reading_progress 
      ADD COLUMN IF NOT EXISTS pages_read INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS total_reading_time_seconds INTEGER DEFAULT 0
    `);

    // Add missing columns to user_library
    await pool.query(`
      ALTER TABLE user_library 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'
    `);

    // Create book_reviews table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS book_reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        status VARCHAR(50) DEFAULT 'approved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, book_id)
      )
    `);

    console.log('✅ Missing columns created successfully');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createMissingColumns();