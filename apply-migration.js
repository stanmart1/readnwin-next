const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/readnwin_db'
});

async function runMigration() {
  try {
    const sql = fs.readFileSync('./database/migrations/008_epub_structure_preservation.sql', 'utf8');
    await pool.query(sql);
    console.log('✅ Migration 008_epub_structure_preservation.sql applied successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await pool.end();
  }
}

runMigration();
