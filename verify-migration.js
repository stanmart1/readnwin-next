const { Pool } = require('pg');

const pool = new Pool({
  host: '149.102.159.118',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '6c8u2MsYqlbQxL5IxftjrV7QQnlLymdsmzMtTeIe4Ur1od7RR9CdODh3VfQ4ka2f'
});

async function verifyMigration() {
  try {
    // Check book_files columns
    const bookFilesColumns = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'book_files' AND column_name IN ('preserve_structure', 'original_structure', 'extraction_path')
    `);
    console.log('book_files new columns:', bookFilesColumns.rows.map(r => r.column_name));
    
    // Check new tables
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name IN ('epub_structure', 'html_structure')
    `);
    console.log('New tables:', tables.rows.map(r => r.table_name));
    
    console.log('✅ Migration verification complete');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await pool.end();
  }
}

verifyMigration();