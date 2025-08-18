const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || '149.102.159.118',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'S48lyoqo1mX7ytoiBvDZfCBB4TiCcGIU1rEdpu0NfBFP3V9q426PKDkGmV8aMD8b',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false, // SSL is disabled for the new database
});

async function testDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful:', result.rows[0].current_time);
    
    // Check if books table exists
    const tableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'books'
      );
    `);
    
    if (tableResult.rows[0].exists) {
      console.log('✅ Books table exists');
      
      // Count books
      const bookCount = await client.query('SELECT COUNT(*) as count FROM books');
      console.log(`📚 Total books in database: ${bookCount.rows[0].count}`);
      
      // Check published books
      const publishedBooks = await client.query('SELECT COUNT(*) as count FROM books WHERE status = $1', ['published']);
      console.log(`📖 Published books: ${publishedBooks.rows[0].count}`);
      
      // Show sample books
      const sampleBooks = await client.query(`
        SELECT id, title, author_id, status, is_featured 
        FROM books 
        LIMIT 5
      `);
      
      console.log('📋 Sample books:');
      sampleBooks.rows.forEach(book => {
        console.log(`   - ${book.title} (ID: ${book.id}, Status: ${book.status}, Featured: ${book.is_featured})`);
      });
      
    } else {
      console.log('❌ Books table does not exist');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDatabase()
    .then(() => {
      console.log('✅ Database test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database test failed:', error);
      process.exit(1);
    });
}

module.exports = { testDatabase }; 