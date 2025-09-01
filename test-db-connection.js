const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'readnwin_db',
  user: 'postgres',
  password: 'password'
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0]);
    
    // Check if book_files table exists
    const tables = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'book_files' AND table_schema = 'public'
    `);
    console.log('book_files columns:', tables.rows.map(r => r.column_name));
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();