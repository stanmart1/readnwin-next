const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '149.102.159.118',
  database: 'postgres',
  password: '6c8u2MsYqlbQxL5IxftjrV7QQnlLymdsmzMtTeIe4Ur1od7RR9CdODh3VfQ4ka2f',
  port: 5432,
  ssl: false
});

async function setupTables() {
  try {
    console.log('🚀 Setting up dashboard tables...');

    // Create all required tables
    const queries = [
      // Reading Progress Table
      `CREATE TABLE IF NOT EXISTS reading_progress (
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
      )`,

      // Reading Sessions Table
      `CREATE TABLE IF NOT EXISTS reading_sessions (
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
      )`,

      // User Library Table
      `CREATE TABLE IF NOT EXISTS user_library (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        access_type VARCHAR(50) DEFAULT 'purchased',
        status VARCHAR(50) DEFAULT 'active',
        UNIQUE(user_id, book_id)
      )`,

      // Book Reviews Table
      `CREATE TABLE IF NOT EXISTS book_reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        book_id INTEGER NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        status VARCHAR(50) DEFAULT 'approved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, book_id)
      )`,

      // User Goals Table
      `CREATE TABLE IF NOT EXISTS user_goals (
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
      )`,

      // User Activities Table
      `CREATE TABLE IF NOT EXISTS user_activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        activity_type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // User Notifications Table
      `CREATE TABLE IF NOT EXISTS user_notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        action_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP NULL
      )`
    ];

    // Execute table creation queries
    for (const query of queries) {
      await pool.query(query);
      console.log('✅ Created table:', query.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1]);
    }

    // Create indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON reading_progress(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id ON reading_sessions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_library_user_id ON user_library(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_book_reviews_user_id ON book_reviews(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id)'
    ];

    for (const index of indexes) {
      await pool.query(index);
    }
    console.log('✅ Created indexes');

    // Insert sample data for existing users
    const userResult = await pool.query('SELECT id FROM users LIMIT 5');
    const users = userResult.rows;

    if (users.length > 0) {
      console.log(`📊 Adding sample data for ${users.length} users...`);

      for (const user of users) {
        // Add sample goals
        await pool.query(`
          INSERT INTO user_goals (user_id, goal_type, title, description, target_value, target_date)
          VALUES 
            ($1, 'books_per_month', 'Read 2 Books This Month', 'Complete reading 2 books by the end of this month', 2, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day'),
            ($1, 'reading_time', 'Read 10 Hours This Month', 'Spend 10 hours reading this month', 36000, DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day'),
            ($1, 'yearly_books', 'Read 24 Books This Year', 'Complete reading 24 books by the end of this year', 24, DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year' - INTERVAL '1 day')
          ON CONFLICT DO NOTHING
        `, [user.id]);

        // Add sample activities
        await pool.query(`
          INSERT INTO user_activities (user_id, activity_type, title, description)
          VALUES 
            ($1, 'account_created', 'Welcome to ReadnWin!', 'Your account has been successfully created'),
            ($1, 'goal_created', 'Reading Goals Set', 'You have set your reading goals for this period')
          ON CONFLICT DO NOTHING
        `, [user.id]);

        // Add sample notification
        await pool.query(`
          INSERT INTO user_notifications (user_id, title, message, type)
          VALUES ($1, 'Welcome to ReadnWin!', 'Start your reading journey by exploring our book collection.', 'welcome')
          ON CONFLICT DO NOTHING
        `, [user.id]);
      }
    }

    console.log('🎉 Dashboard database setup complete!');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    await pool.end();
  }
}

setupTables();