const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || '149.102.159.118',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || '6c8u2MsYqlbQxL5IxftjrV7QQnlLymdsmzMtTeIe4Ur1od7RR9CdODh3VfQ4ka2f',
  port: parseInt(process.env.DB_PORT) || 5432,
  ssl: false
});

async function checkTables() {
  try {
    console.log('🔍 Checking dashboard tables...');
    
    const requiredTables = [
      'reading_progress',
      'reading_sessions', 
      'user_library',
      'book_reviews',
      'user_goals',
      'user_activities',
      'user_notifications'
    ];

    for (const tableName of requiredTables) {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [tableName]);
      
      const exists = result.rows[0].exists;
      console.log(`📋 Table ${tableName}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
      
      if (exists) {
        // Check columns
        const columns = await pool.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = $1 
          ORDER BY ordinal_position;
        `, [tableName]);
        
        console.log(`   Columns: ${columns.rows.map(c => c.column_name).join(', ')}`);
      }
    }

    // Check if users table exists and has data
    const usersCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (usersCheck.rows[0].exists) {
      const userCount = await pool.query('SELECT COUNT(*) FROM users');
      console.log(`👥 Users table: ✅ EXISTS (${userCount.rows[0].count} users)`);
    } else {
      console.log('👥 Users table: ❌ MISSING');
    }

    // Check books table
    const booksCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'books'
      );
    `);
    
    if (booksCheck.rows[0].exists) {
      const bookCount = await pool.query('SELECT COUNT(*) FROM books');
      console.log(`📚 Books table: ✅ EXISTS (${bookCount.rows[0].count} books)`);
    } else {
      console.log('📚 Books table: ❌ MISSING');
    }

  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();