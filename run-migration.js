const { Pool } = require('pg');
const fs = require('fs');

async function runMigration() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL 
  });
  
  try {
    const sql = fs.readFileSync('database/migrations/010_add_format_to_user_library.sql', 'utf8');
    await pool.query(sql);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();