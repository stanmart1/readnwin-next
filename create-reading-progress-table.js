#!/usr/bin/env node

require('dotenv').config();
const { query } = require('./utils/database');

async function createReadingProgressTable() {
  try {
    console.log('🔧 Creating reading_progress table...');

    await query(`
      CREATE TABLE IF NOT EXISTS reading_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
        current_position INTEGER DEFAULT 0,
        pages_read INTEGER DEFAULT 0,
        last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        total_reading_time_seconds INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, book_id)
      )
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON reading_progress(user_id);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_reading_progress_book_id ON reading_progress(book_id);
    `);

    console.log('✅ reading_progress table created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  }
}

createReadingProgressTable();