const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '149.102.159.118',
  database: 'postgres',
  password: '6c8u2MsYqlbQxL5IxftjrV7QQnlLymdsmzMtTeIe4Ur1od7RR9CdODh3VfQ4ka2f',
  port: 5432,
});

async function checkTables() {
  try {
    // Check if user_library table exists and its columns
    const userLibraryCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_library' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 user_library table columns:');
    if (userLibraryCheck.rows.length === 0) {
      console.log('❌ user_library table does not exist');
    } else {
      userLibraryCheck.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });
    }
    
    // Check if reading_progress table exists and its columns
    const readingProgressCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'reading_progress' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 reading_progress table columns:');
    if (readingProgressCheck.rows.length === 0) {
      console.log('❌ reading_progress table does not exist');
    } else {
      readingProgressCheck.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();