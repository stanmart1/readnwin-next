const { Pool } = require('pg');

const pool = new Pool({
  host: '149.102.159.118',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '6c8u2MsYqlbQxL5IxftjrV7QQnlLymdsmzMtTeIe4Ur1od7RR9CdODh3VfQ4ka2f',
  ssl: false
});

async function testDashboardStats() {
  try {
    console.log('🧪 Testing Dashboard Stats...\n');

    // Find user with books
    const userWithBooks = await pool.query(`
      SELECT ul.user_id, u.email, COUNT(ul.book_id) as book_count
      FROM user_library ul
      LEFT JOIN users u ON ul.user_id = u.id
      WHERE ul.status IS NULL OR ul.status = 'active'
      GROUP BY ul.user_id, u.email
      ORDER BY book_count DESC
      LIMIT 1
    `);

    if (userWithBooks.rows.length === 0) {
      console.log('❌ No users with books found');
      return;
    }

    const userId = userWithBooks.rows[0].user_id;
    const userEmail = userWithBooks.rows[0].email;
    console.log(`👤 Testing for user: ${userEmail} (ID: ${userId})`);

    // Test the exact query from the API
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
    `, [userId]);

    const stats = statsResult.rows[0];
    
    console.log('📊 Dashboard Stats Result:');
    console.log(`  - Total Books: ${stats.total_books}`);
    console.log(`  - Completed Books: ${stats.completed_books}`);
    console.log(`  - Currently Reading: ${stats.currently_reading}`);
    console.log(`  - Total Reading Time: ${stats.total_reading_time} seconds`);
    console.log(`  - Total Pages Read: ${stats.total_pages_read}`);
    console.log(`  - Average Rating: ${stats.average_rating}`);

    if (parseInt(stats.total_books) > 0) {
      console.log('\n✅ SUCCESS: Dashboard should now show correct book count!');
    } else {
      console.log('\n⚠️ Issue: User has books but query returns 0');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testDashboardStats();