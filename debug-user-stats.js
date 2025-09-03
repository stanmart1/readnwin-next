const { Pool } = require('pg');

// Database configuration from .env
const pool = new Pool({
  host: '149.102.159.118',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '6c8u2MsYqlbQxL5IxftjrV7QQnlLymdsmzMtTeIe4Ur1od7RR9CdODh3VfQ4ka2f',
  ssl: false
});

async function debugUserStats() {
  try {
    console.log('🔍 Debugging User Stats Issue...\n');

    // Check if user_library table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_library'
      );
    `);
    
    console.log('📊 user_library table exists:', tableCheck.rows[0].exists);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ user_library table does not exist!');
      return;
    }

    // Get total records in user_library
    const totalRecords = await pool.query('SELECT COUNT(*) FROM user_library');
    console.log('📈 Total records in user_library:', totalRecords.rows[0].count);

    // Get sample records
    const sampleRecords = await pool.query(`
      SELECT ul.*, u.email, u.first_name, b.title 
      FROM user_library ul
      LEFT JOIN users u ON ul.user_id = u.id
      LEFT JOIN books b ON ul.book_id = b.id
      ORDER BY ul.id DESC 
      LIMIT 10
    `);
    
    console.log('\n📋 Sample user_library records:');
    sampleRecords.rows.forEach(record => {
      console.log(`  - User: ${record.email} (${record.first_name})`);
      console.log(`    Book: ${record.title || 'Unknown'} (ID: ${record.book_id})`);
      console.log(`    Added: ${record.added_at || record.acquired_at}`);
      console.log('    ---');
    });

    // Check users table
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`\n👥 Total users: ${usersCount.rows[0].count}`);

    // Check books table
    const booksCount = await pool.query('SELECT COUNT(*) FROM books');
    console.log(`📚 Total books: ${booksCount.rows[0].count}`);

    // Test the stats query for a specific user
    const testUser = await pool.query(`
      SELECT id, email, first_name FROM users 
      WHERE email IS NOT NULL 
      ORDER BY id DESC 
      LIMIT 1
    `);

    if (testUser.rows.length > 0) {
      const userId = testUser.rows[0].id;
      console.log(`\n🧪 Testing stats for user: ${testUser.rows[0].email} (ID: ${userId})`);

      const statsResult = await pool.query(`
        SELECT 
          COUNT(DISTINCT ul.book_id) as total_books,
          COUNT(DISTINCT CASE WHEN rp.progress_percentage >= 100 THEN ul.book_id END) as completed_books,
          COUNT(DISTINCT CASE WHEN rp.progress_percentage > 0 AND rp.progress_percentage < 100 THEN ul.book_id END) as currently_reading,
          COALESCE(SUM(rp.total_reading_time_seconds), 0) as total_reading_time,
          COALESCE(SUM(rp.pages_read), 0) as total_pages_read,
          COALESCE(AVG(br.rating), 0) as average_rating
        FROM user_library ul
        LEFT JOIN reading_progress rp ON ul.book_id = rp.book_id AND ul.user_id = rp.user_id
        LEFT JOIN book_reviews br ON ul.book_id = br.book_id AND ul.user_id = br.user_id AND br.status = 'approved'
        WHERE ul.user_id = $1
      `, [userId]);

      const stats = statsResult.rows[0];
      console.log('📊 User Stats:');
      console.log(`  - Total Books: ${stats.total_books}`);
      console.log(`  - Completed Books: ${stats.completed_books}`);
      console.log(`  - Currently Reading: ${stats.currently_reading}`);
      console.log(`  - Total Reading Time: ${stats.total_reading_time} seconds`);
      console.log(`  - Total Pages Read: ${stats.total_pages_read}`);
      console.log(`  - Average Rating: ${stats.average_rating}`);

      // Check if this user has any books in their library
      const userBooks = await pool.query(`
        SELECT ul.*, b.title, b.format
        FROM user_library ul
        LEFT JOIN books b ON ul.book_id = b.id
        WHERE ul.user_id = $1
      `, [userId]);

      console.log(`\n📖 Books in user's library: ${userBooks.rows.length}`);
      userBooks.rows.forEach(book => {
        console.log(`  - ${book.title || 'Unknown'} (${book.format || 'unknown format'})`);
      });
    }

    // Check if there are any issues with the table structure
    console.log('\n🔧 Checking table structure...');
    const tableStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'user_library'
      ORDER BY ordinal_position
    `);

    console.log('📋 user_library table columns:');
    tableStructure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

debugUserStats();