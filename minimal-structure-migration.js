const { Pool } = require('pg');

const pool = new Pool({
  host: '149.102.159.118',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '6c8u2MsYqlbQxL5IxftjrV7QQnlLymdsmzMtTeIe4Ur1od7RR9CdODh3VfQ4ka2f'
});

async function applyMinimalMigration() {
  try {
    console.log('Adding structure preservation columns...');
    
    // Add columns to book_files table
    await pool.query(`
      ALTER TABLE book_files 
      ADD COLUMN IF NOT EXISTS preserve_structure BOOLEAN DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS original_structure JSONB,
      ADD COLUMN IF NOT EXISTS extraction_path TEXT
    `);
    
    // Create epub_structure table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS epub_structure (
        id SERIAL PRIMARY KEY,
        book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        file_id INTEGER NOT NULL,
        spine_order JSONB NOT NULL,
        manifest JSONB NOT NULL,
        navigation JSONB,
        title VARCHAR(500),
        creator VARCHAR(255),
        UNIQUE(book_id, file_id)
      )
    `);
    
    // Create html_structure table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS html_structure (
        id SERIAL PRIMARY KEY,
        book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        file_id INTEGER NOT NULL,
        chapter_structure JSONB,
        asset_files JSONB,
        title VARCHAR(500),
        author VARCHAR(255),
        UNIQUE(book_id, file_id)
      )
    `);
    
    console.log('✅ Structure preservation migration completed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await pool.end();
  }
}

applyMinimalMigration();