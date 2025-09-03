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

async function fixUserStats() {
  try {
    console.log('🔧 Fixing User Stats Issue...\n');

    // Check reading_progress table structure
    console.log('📋 Checking reading_progress table structure...');
    const rpStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'reading_progress'
      ORDER BY ordinal_position
    `);

    console.log('reading_progress table columns:');
    rpStructure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Check if total_reading_time_seconds column exists
    const hasTimeColumn = rpStructure.rows.some(col => col.column_name === 'total_reading_time_seconds');
    
    if (!hasTimeColumn) {
      console.log('\n⚠️ total_reading_time_seconds column missing. Adding it...');
      await pool.query(`
        ALTER TABLE reading_progress 
        ADD COLUMN IF NOT EXISTS total_reading_time_seconds INTEGER DEFAULT 0
      `);
      console.log('✅ Added total_reading_time_seconds column');
    }

    // Test the corrected stats query
    const testUser = await pool.query(`
      SELECT id, email, first_name FROM users 
      WHERE email IS NOT NULL 
      ORDER BY id DESC 
      LIMIT 1
    `);

    if (testUser.rows.length > 0) {
      const userId = testUser.rows[0].id;
      console.log(`\n🧪 Testing corrected stats for user: ${testUser.rows[0].email} (ID: ${userId})`);

      const statsResult = await pool.query(`
        SELECT 
          COUNT(DISTINCT ul.book_id) as total_books,
          COUNT(DISTINCT CASE WHEN rp.progress_percentage >= 100 THEN ul.book_id END) as completed_books,
          COUNT(DISTINCT CASE WHEN rp.progress_percentage > 0 AND rp.progress_percentage < 100 THEN ul.book_id END) as currently_reading,
          COALESCE(SUM(COALESCE(rp.total_reading_time_seconds, 0)), 0) as total_reading_time,
          COALESCE(SUM(rp.pages_read), 0) as total_pages_read,
          COALESCE(AVG(br.rating), 0) as average_rating
        FROM user_library ul
        LEFT JOIN reading_progress rp ON ul.book_id = rp.book_id AND ul.user_id = rp.user_id
        LEFT JOIN book_reviews br ON ul.book_id = br.book_id AND ul.user_id = br.user_id AND br.status = 'approved'
        WHERE ul.user_id = $1
      `, [userId]);

      const stats = statsResult.rows[0];
      console.log('📊 Corrected User Stats:');
      console.log(`  - Total Books: ${stats.total_books}`);
      console.log(`  - Completed Books: ${stats.completed_books}`);
      console.log(`  - Currently Reading: ${stats.currently_reading}`);
      console.log(`  - Total Reading Time: ${stats.total_reading_time} seconds`);
      console.log(`  - Total Pages Read: ${stats.total_pages_read}`);
      console.log(`  - Average Rating: ${stats.average_rating}`);
    }

    // Check the user who has a book in their library
    console.log('\n🔍 Checking user with book in library...');
    const userWithBook = await pool.query(`
      SELECT ul.user_id, u.email, u.first_name, COUNT(ul.book_id) as book_count
      FROM user_library ul
      LEFT JOIN users u ON ul.user_id = u.id
      GROUP BY ul.user_id, u.email, u.first_name
      ORDER BY book_count DESC
    `);

    console.log('Users with books:');
    userWithBook.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.first_name}): ${user.book_count} books`);
    });

    // Test stats for the user who actually has books
    if (userWithBook.rows.length > 0) {
      const userId = userWithBook.rows[0].user_id;
      console.log(`\n🧪 Testing stats for user with books: ${userWithBook.rows[0].email} (ID: ${userId})`);

      const statsResult = await pool.query(`
        SELECT 
          COUNT(DISTINCT ul.book_id) as total_books,
          COUNT(DISTINCT CASE WHEN rp.progress_percentage >= 100 THEN ul.book_id END) as completed_books,
          COUNT(DISTINCT CASE WHEN rp.progress_percentage > 0 AND rp.progress_percentage < 100 THEN ul.book_id END) as currently_reading,
          COALESCE(SUM(COALESCE(rp.total_reading_time_seconds, 0)), 0) as total_reading_time,
          COALESCE(SUM(rp.pages_read), 0) as total_pages_read,
          COALESCE(AVG(br.rating), 0) as average_rating
        FROM user_library ul
        LEFT JOIN reading_progress rp ON ul.book_id = rp.book_id AND ul.user_id = rp.user_id
        LEFT JOIN book_reviews br ON ul.book_id = br.book_id AND ul.user_id = br.user_id AND br.status = 'approved'
        WHERE ul.user_id = $1
      `, [userId]);

      const stats = statsResult.rows[0];
      console.log('📊 Stats for user with books:');
      console.log(`  - Total Books: ${stats.total_books}`);
      console.log(`  - Completed Books: ${stats.completed_books}`);
      console.log(`  - Currently Reading: ${stats.currently_reading}`);
      console.log(`  - Total Reading Time: ${stats.total_reading_time} seconds`);
      console.log(`  - Total Pages Read: ${stats.total_pages_read}`);
      console.log(`  - Average Rating: ${stats.average_rating}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixUserStats();