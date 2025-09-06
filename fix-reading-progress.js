#!/usr/bin/env node

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false
});

async function fixReadingProgress() {
  try {
    const client = await pool.connect();
    
    // Check if reading_progress table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'reading_progress'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('Creating reading_progress table...');
      
      await client.query(`
        CREATE TABLE reading_progress (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          book_id INTEGER NOT NULL,
          progress_percentage DECIMAL(5,2) DEFAULT 0,
          current_chapter_id VARCHAR(255),
          total_reading_time_seconds INTEGER DEFAULT 0,
          last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, book_id)
        );
      `);
      
      console.log('✅ reading_progress table created');
    } else {
      console.log('✅ reading_progress table already exists');
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixReadingProgress();