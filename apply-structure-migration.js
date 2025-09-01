const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  host: '149.102.159.118',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '6c8u2MsYqlbQxL5IxftjrV7QQnlLymdsmzMtTeIe4Ur1od7RR9CdODh3VfQ4ka2f'
});

async function applyMigration() {
  try {
    console.log('Applying EPUB structure preservation migration...');
    const sql = fs.readFileSync('./database/migrations/008_epub_structure_preservation.sql', 'utf8');
    await pool.query(sql);
    console.log('✅ Migration applied successfully');
    
    // Verify tables exist
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('epub_structure', 'html_structure')
    `);
    console.log('✅ Created tables:', result.rows.map(r => r.table_name));
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await pool.end();
  }
}

applyMigration();