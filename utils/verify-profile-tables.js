const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function verifyProfileTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking profile-related tables...');
    
    // Check users table structure
    const usersColumns = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Users table columns:');
    usersColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Check if student_info table exists
    const studentInfoExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'student_info'
      )
    `);
    
    console.log(`\n📚 student_info table exists: ${studentInfoExists.rows[0].exists}`);
    
    // Check if reading_progress table exists
    const readingProgressExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'reading_progress'
      )
    `);
    
    console.log(`📖 reading_progress table exists: ${readingProgressExists.rows[0].exists}`);
    
    // Check if genres table exists
    const genresExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'genres'
      )
    `);
    
    console.log(`🎭 genres table exists: ${genresExists.rows[0].exists}`);
    
    // Check if book_genres table exists
    const bookGenresExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'book_genres'
      )
    `);
    
    console.log(`📚🎭 book_genres table exists: ${bookGenresExists.rows[0].exists}`);
    
    return {
      usersColumns: usersColumns.rows,
      studentInfoExists: studentInfoExists.rows[0].exists,
      readingProgressExists: readingProgressExists.rows[0].exists,
      genresExists: genresExists.rows[0].exists,
      bookGenresExists: bookGenresExists.rows[0].exists
    };
    
  } catch (error) {
    console.error('❌ Error checking tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  verifyProfileTables()
    .then((result) => {
      console.log('\n✅ Table verification completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to verify tables:', error);
      process.exit(1);
    });
}

module.exports = { verifyProfileTables };