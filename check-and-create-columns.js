const { Pool } = require('pg');

const pool = new Pool({
  host: '149.102.159.118',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '6c8u2MsYqlbQxL5IxftjrV7QQnlLymdsmzMtTeIe4Ur1od7RR9CdODh3VfQ4ka2f',
  ssl: false
});

async function checkAndCreateColumns() {
  try {
    console.log('🔍 Checking existing columns...\n');

    // Check reading_progress table columns
    const rpColumns = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'reading_progress'
    `);
    
    const rpColumnNames = rpColumns.rows.map(row => row.column_name);
    console.log('reading_progress columns:', rpColumnNames);
    
    const needsPagesRead = !rpColumnNames.includes('pages_read');
    const needsReadingTime = !rpColumnNames.includes('total_reading_time_seconds');
    
    // Check user_library table columns
    const ulColumns = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'user_library'
    `);
    
    const ulColumnNames = ulColumns.rows.map(row => row.column_name);
    console.log('user_library columns:', ulColumnNames);
    
    const needsStatus = !ulColumnNames.includes('status');
    
    // Check if book_reviews table exists
    const reviewsExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'book_reviews'
      )
    `);
    
    console.log('book_reviews table exists:', reviewsExists.rows[0].exists);
    
    console.log('\n📋 Missing components:');
    if (needsPagesRead) console.log('  - pages_read column in reading_progress');
    if (needsReadingTime) console.log('  - total_reading_time_seconds column in reading_progress');
    if (needsStatus) console.log('  - status column in user_library');
    if (!reviewsExists.rows[0].exists) console.log('  - book_reviews table');
    
    // Create missing components
    if (needsPagesRead || needsReadingTime) {
      console.log('\n➕ Adding missing columns to reading_progress...');
      const alterQuery = [];
      if (needsPagesRead) alterQuery.push('ADD COLUMN pages_read INTEGER DEFAULT 0');
      if (needsReadingTime) alterQuery.push('ADD COLUMN total_reading_time_seconds INTEGER DEFAULT 0');
      
      await pool.query(`ALTER TABLE reading_progress ${alterQuery.join(', ')}`);
      console.log('✅ reading_progress columns added');
    }
    
    if (needsStatus) {
      console.log('\n➕ Adding status column to user_library...');
      await pool.query(`ALTER TABLE user_library ADD COLUMN status VARCHAR(50) DEFAULT 'active'`);
      console.log('✅ user_library status column added');
    }
    
    if (!reviewsExists.rows[0].exists) {
      console.log('\n➕ Creating book_reviews table...');
      await pool.query(`
        CREATE TABLE book_reviews (
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
      console.log('✅ book_reviews table created');
    }
    
    console.log('\n🎉 All required columns and tables are now ready!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAndCreateColumns();