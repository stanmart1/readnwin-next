require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false
});

async function initDashboardTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Initializing dashboard tables...');

    // Create user_library table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_library (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        access_type VARCHAR(50) DEFAULT 'purchased',
        status VARCHAR(50) DEFAULT 'active',
        UNIQUE(user_id, book_id)
      )
    `);
    console.log('✅ user_library table created/verified');

    // Create reading_progress table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reading_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        progress_percentage DECIMAL(5,2) DEFAULT 0,
        current_chapter_id VARCHAR(255),
        current_position INTEGER DEFAULT 0,
        pages_read INTEGER DEFAULT 0,
        total_reading_time_seconds INTEGER DEFAULT 0,
        last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, book_id)
      )
    `);
    console.log('✅ reading_progress table created/verified');

    // Create user_notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        action_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP NULL
      )
    `);
    console.log('✅ user_notifications table created/verified');

    // Create user_activities table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        activity_type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ user_activities table created/verified');

    // Create user_goals table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        goal_type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        target_value INTEGER NOT NULL,
        current_value INTEGER DEFAULT 0,
        target_date DATE,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ user_goals table created/verified');

    // Create book_reviews table
    await client.query(`
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
    console.log('✅ book_reviews table created/verified');

    // Create reading_sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reading_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        session_end TIMESTAMP NULL,
        duration_seconds INTEGER DEFAULT 0,
        pages_read INTEGER DEFAULT 0,
        progress_start DECIMAL(5,2) DEFAULT 0,
        progress_end DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ reading_sessions table created/verified');

    console.log('🎉 All dashboard tables initialized successfully!');

  } catch (error) {
    console.error('❌ Error initializing dashboard tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the initialization
if (require.main === module) {
  initDashboardTables()
    .then(() => {
      console.log('✅ Dashboard tables initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Dashboard tables initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initDashboardTables };