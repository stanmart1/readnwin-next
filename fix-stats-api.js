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

async function fixStatsAPI() {
  try {
    console.log('🔧 Fixing Stats API to match actual database schema...\n');

    // Add missing columns to reading_progress table
    console.log('📋 Adding missing columns to reading_progress table...');
    
    await pool.query(`
      ALTER TABLE reading_progress 
      ADD COLUMN IF NOT EXISTS pages_read INTEGER DEFAULT 0
    `);
    
    console.log('✅ Added pages_read column');

    // Test the corrected stats query with actual columns
    const testUser = await pool.query(`
      SELECT ul.user_id, u.email, u.first_name, COUNT(ul.book_id) as book_count
      FROM user_library ul
      LEFT JOIN users u ON ul.user_id = u.id
      GROUP BY ul.user_id, u.email, u.first_name
      ORDER BY book_count DESC
      LIMIT 1
    `);

    if (testUser.rows.length > 0) {
      const userId = testUser.rows[0].user_id;
      console.log(`\n🧪 Testing corrected stats for user: ${testUser.rows[0].email} (ID: ${userId})`);

      const statsResult = await pool.query(`
        SELECT 
          COUNT(DISTINCT ul.book_id) as total_books,
          COUNT(DISTINCT CASE WHEN rp.progress_percentage >= 100 THEN ul.book_id END) as completed_books,
          COUNT(DISTINCT CASE WHEN rp.progress_percentage > 0 AND rp.progress_percentage < 100 THEN ul.book_id END) as currently_reading,
          COALESCE(SUM(COALESCE(rp.total_reading_time_seconds, rp.time_spent, 0)), 0) as total_reading_time,
          COALESCE(SUM(COALESCE(rp.pages_read, rp.current_page, 0)), 0) as total_pages_read,
          COALESCE(AVG(br.rating), 0) as average_rating
        FROM user_library ul
        LEFT JOIN reading_progress rp ON ul.book_id = rp.book_id AND ul.user_id = rp.user_id
        LEFT JOIN book_reviews br ON ul.book_id = br.book_id AND ul.user_id = br.user_id AND br.status = 'approved'
        WHERE ul.user_id = $1
      `, [userId]);

      const stats = statsResult.rows[0];
      console.log('📊 Final Stats Result:');
      console.log(`  - Total Books: ${stats.total_books}`);
      console.log(`  - Completed Books: ${stats.completed_books}`);
      console.log(`  - Currently Reading: ${stats.currently_reading}`);
      console.log(`  - Total Reading Time: ${stats.total_reading_time} seconds`);
      console.log(`  - Total Pages Read: ${stats.total_pages_read}`);
      console.log(`  - Average Rating: ${stats.average_rating}`);

      if (parseInt(stats.total_books) > 0) {
        console.log('\n✅ SUCCESS: User has books in library and stats are working!');
      } else {
        console.log('\n⚠️ User has no books in library');
      }
    }

    // Check book_reviews table structure
    console.log('\n📋 Checking book_reviews table...');
    const reviewsCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'book_reviews'
      );
    `);
    
    if (!reviewsCheck.rows[0].exists) {
      console.log('⚠️ book_reviews table does not exist. Creating it...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS book_reviews (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          book_id INTEGER NOT NULL,
          rating INTEGER CHECK (rating >= 1 AND rating <= 5),
          review_text TEXT,
          status VARCHAR(50) DEFAULT 'approved',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, book_id)
        )
      `);
      console.log('✅ Created book_reviews table');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixStatsAPI();