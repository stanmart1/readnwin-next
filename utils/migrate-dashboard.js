const { query } = require('./database');

async function migrateDashboard() {
  try {
    console.log('🔄 Starting dashboard migration...');

    // Create reading_goals table
    await query(`
      CREATE TABLE IF NOT EXISTS reading_goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('annual_books', 'monthly_pages', 'reading_streak', 'daily_hours')),
        target_value INTEGER NOT NULL,
        current_value INTEGER DEFAULT 0,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, goal_type, start_date)
      );
    `);
    console.log('✅ Created reading_goals table');

    // Create user_activity table
    await query(`
      CREATE TABLE IF NOT EXISTS user_activity (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('completed', 'review', 'started', 'achievement', 'purchase', 'bookmark', 'goal_reached')),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        book_id INTEGER REFERENCES books(id) ON DELETE SET NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created user_activity table');

    // Create user_notifications table
    await query(`
      CREATE TABLE IF NOT EXISTS user_notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL CHECK (type IN ('achievement', 'book', 'social', 'reminder', 'system')),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created user_notifications table');

    // Create user_achievements table
    await query(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        achievement_type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(100),
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB
      );
    `);
    console.log('✅ Created user_achievements table');

    // Create indexes for better performance
    await query('CREATE INDEX IF NOT EXISTS idx_reading_goals_user_id ON reading_goals(user_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_reading_goals_goal_type ON reading_goals(goal_type);');
    await query('CREATE INDEX IF NOT EXISTS idx_reading_goals_is_active ON reading_goals(is_active);');

    await query('CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_user_activity_activity_type ON user_activity(activity_type);');
    await query('CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);');

    await query('CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_user_notifications_type ON user_notifications(type);');
    await query('CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);');
    await query('CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at);');

    await query('CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_type ON user_achievements(achievement_type);');
    await query('CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at);');

    console.log('✅ Created all indexes');

    // Insert some sample data for testing
    console.log('🔄 Inserting sample data...');

    // Sample reading goals
    await query(`
      INSERT INTO reading_goals (user_id, goal_type, target_value, start_date, end_date)
      VALUES 
        (1, 'annual_books', 60, '2025-01-01', '2025-12-31'),
(1, 'monthly_pages', 1500, '2025-01-01', '2025-01-31'),
(1, 'reading_streak', 30, '2025-01-01', '2025-12-31')
      ON CONFLICT (user_id, goal_type, start_date) DO NOTHING;
    `);

    // Sample user activities
    await query(`
      INSERT INTO user_activity (user_id, activity_type, title, description, book_id)
      VALUES 
        (1, 'completed', 'Finished reading "The Alchemist"', 'Completed reading Paulo Coelho masterpiece', NULL),
        (1, 'review', 'Wrote review for "Dune"', 'Shared thoughts on Frank Herbert sci-fi epic', NULL),
        (1, 'started', 'Started reading "The Psychology of Money"', 'Began reading Morgan Housel financial insights', NULL),
        (1, 'achievement', 'Reached 50 books read this year!', 'Milestone achievement unlocked', NULL),
        (1, 'purchase', 'Purchased "Atomic Habits"', 'Added James Clear book to library', NULL),
        (1, 'bookmark', 'Added "The Midnight Library" to wishlist', 'Saved Matt Haig book for later', NULL)
      ON CONFLICT DO NOTHING;
    `);

    // Sample notifications
    await query(`
      INSERT INTO user_notifications (user_id, type, title, message)
      VALUES 
        (1, 'achievement', 'New Achievement Unlocked!', 'You reached your monthly reading goal'),
        (1, 'book', 'New Book Recommendation', 'Based on your reading history, we recommend The Seven Husbands of Evelyn Hugo'),
        (1, 'social', 'Review Liked', 'Someone found your review of Atomic Habits helpful'),
        (1, 'reminder', 'Reading Reminder', 'You have not read today. Continue with The Psychology of Money')
      ON CONFLICT DO NOTHING;
    `);

    // Sample achievements
    await query(`
      INSERT INTO user_achievements (user_id, achievement_type, title, description, icon)
      VALUES 
        (1, 'speed_reader', 'Speed Reader', 'Read 5 books in a month', 'ri-flashlight-line'),
        (1, 'diverse_reader', 'Diverse Reader', 'Read 5 different genres', 'ri-book-line')
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Inserted sample data');

    console.log('🎉 Dashboard migration completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateDashboard(); 