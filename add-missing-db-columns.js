const { Pool } = require('pg');

const pool = new Pool({
  host: '149.102.159.118',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '6c8u2MsYqlbQxL5IxftjrV7QQnlLymdsmzMtTeIe4Ur1od7RR9CdODh3VfQ4ka2f'
});

async function addMissingColumns() {
  try {
    console.log('Adding missing database columns...');
    
    // Add missing columns to book_files
    await pool.query(`
      ALTER TABLE book_files 
      ADD COLUMN IF NOT EXISTS original_format VARCHAR(10),
      ADD COLUMN IF NOT EXISTS asset_count INTEGER DEFAULT 0
    `);
    
    console.log('✅ Added original_format and asset_count columns');
    
    // Verify all columns exist
    const columns = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'book_files' 
      AND column_name IN ('preserve_structure', 'original_structure', 'extraction_path', 'original_format', 'asset_count')
    `);
    
    console.log('book_files columns:', columns.rows.map(r => r.column_name));
    
  } catch (error) {
    console.error('❌ Failed:', error.message);
  } finally {
    await pool.end();
  }
}

addMissingColumns();