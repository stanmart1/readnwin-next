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

async function fixDashboardStats() {
  try {
    console.log('🔧 Fixing Dashboard Stats - Adding Missing Database Components...\n');

    // 1. Add missing columns to reading_progress table
    console.log('📋 Adding missing columns to reading_progress table...');
    
    await pool.query(`
      ALTER TABLE reading_progress 
      ADD COLUMN IF NOT EXISTS pages_read INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS total_reading_time_seconds INTEGER DEFAULT 0
    `);
    
    console.log('✅ Added missing columns to reading_progress');

    // 2. Create book_reviews table if it doesn't exist
    console.log('\n📋 Creating book_reviews table if missing...');
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
    console.log('✅ book_reviews table ready');

    // 3. Ensure user_library table has proper structure
    console.log('\n📋 Ensuring user_library table has proper structure...');
    await pool.query(`
      ALTER TABLE user_library 
      ADD COLUMN IF NOT EXISTS added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS access_type VARCHAR(50) DEFAULT 'purchased',
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'
    `);
    console.log('✅ user_library table structure updated');

    // 4. Test the stats query with all users who have books
    console.log('\n🧪 Testing stats for all users with books...');
    const usersWithBooks = await pool.query(`
      SELECT ul.user_id, u.email, u.first_name, COUNT(ul.book_id) as book_count
      FROM user_library ul
      LEFT JOIN users u ON ul.user_id = u.id
      WHERE ul.status IS NULL OR ul.status = 'active'
      GROUP BY ul.user_id, u.email, u.first_name
      ORDER BY book_count DESC
    `);

    console.log(`Found ${usersWithBooks.rows.length} users with books:`);
    
    for (const user of usersWithBooks.rows) {
      console.log(`\n👤 User: ${user.email} (${user.first_name || 'No name'}) - ${user.book_count} books`);
      
      // Test stats query for this user
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
        WHERE ul.user_id = $1 AND (ul.status IS NULL OR ul.status = 'active')
      `, [user.user_id]);

      const stats = statsResult.rows[0];
      console.log(`  📊 Stats: ${stats.total_books} total, ${stats.completed_books} completed, ${stats.currently_reading} reading`);
    }

    // 5. Create indexes for better performance
    console.log('\n📋 Creating performance indexes...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_library_user_id ON user_library(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_library_book_id ON user_library(book_id);
      CREATE INDEX IF NOT EXISTS idx_reading_progress_user_book ON reading_progress(user_id, book_id);
      CREATE INDEX IF NOT EXISTS idx_book_reviews_user_book ON book_reviews(user_id, book_id);
    `);
    console.log('✅ Performance indexes created');

    console.log('\n🎉 Dashboard stats fix completed successfully!');
    console.log('📝 Next steps:');
    console.log('   1. The user stats API should now work correctly');
    console.log('   2. Users with books in their library will see proper counts');
    console.log('   3. The dashboard hero section will display accurate book statistics');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

fixDashboardStats();