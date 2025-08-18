const { query } = require('../utils/database.js');
const { AchievementChecker } = require('../utils/achievement-checker.js');

async function initializeDashboardTables() {
  try {
    console.log('🔄 Initializing Dashboard Database Tables...\n');

    // 1. Create achievements table
    console.log('1. Creating achievements table...');
    await query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id SERIAL PRIMARY KEY,
        achievement_type VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(100) NOT NULL,
        condition_type VARCHAR(50) NOT NULL,
        condition_value INTEGER NOT NULL,
        priority INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ achievements table created');

    // 2. Create user_achievements table
    console.log('2. Creating user_achievements table...');
    await query(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        achievement_type VARCHAR(100) NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, achievement_type)
      )
    `);
    console.log('   ✅ user_achievements table created');

    // 3. Create reading_goals table
    console.log('3. Creating reading_goals table...');
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
      )
    `);
    console.log('   ✅ reading_goals table created');

    // 4. Create user_activity table
    console.log('4. Creating user_activity table...');
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
      )
    `);
    console.log('   ✅ user_activity table created');

    // 5. Create user_notifications table
    console.log('5. Creating user_notifications table...');
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
      )
    `);
    console.log('   ✅ user_notifications table created');

    // 6. Create reading_sessions table
    console.log('6. Creating reading_sessions table...');
    await query(`
      CREATE TABLE IF NOT EXISTS reading_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        session_start TIMESTAMP NOT NULL,
        session_end TIMESTAMP,
        start_page INTEGER NOT NULL,
        end_page INTEGER,
        pages_read INTEGER DEFAULT 0,
        reading_time_minutes INTEGER DEFAULT 0,
        reading_speed_wpm DECIMAL(8,2),
        device_info JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ reading_sessions table created');

    // 7. Create user_bookmarks table
    console.log('7. Creating user_bookmarks table...');
    await query(`
      CREATE TABLE IF NOT EXISTS user_bookmarks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        page_number INTEGER NOT NULL,
        title VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, book_id, page_number)
      )
    `);
    console.log('   ✅ user_bookmarks table created');

    // 8. Create user_notes table
    console.log('8. Creating user_notes table...');
    await query(`
      CREATE TABLE IF NOT EXISTS user_notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        page_number INTEGER NOT NULL,
        note_text TEXT NOT NULL,
        note_type VARCHAR(20) DEFAULT 'general' CHECK (note_type IN ('general', 'summary', 'question', 'insight')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ user_notes table created');

    // 9. Create user_highlights table
    console.log('9. Creating user_highlights table...');
    await query(`
      CREATE TABLE IF NOT EXISTS user_highlights (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        page_number INTEGER NOT NULL,
        start_position INTEGER NOT NULL,
        end_position INTEGER NOT NULL,
        highlighted_text TEXT NOT NULL,
        highlight_color VARCHAR(20) DEFAULT 'yellow' CHECK (highlight_color IN ('yellow', 'green', 'blue', 'pink', 'orange')),
        note_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('   ✅ user_highlights table created');

    // 10. Create indexes for better performance
    console.log('10. Creating indexes...');
    await query(`
      CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_type ON user_achievements(achievement_type);
      CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at);
      CREATE INDEX IF NOT EXISTS idx_reading_goals_user_id ON reading_goals(user_id);
      CREATE INDEX IF NOT EXISTS idx_reading_goals_goal_type ON reading_goals(goal_type);
      CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_activity_activity_type ON user_activity(activity_type);
      CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);
      CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_notifications_type ON user_notifications(type);
      CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);
      CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id ON reading_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_reading_sessions_book_id ON reading_sessions(book_id);
      CREATE INDEX IF NOT EXISTS idx_reading_sessions_session_start ON reading_sessions(session_start);
      CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_bookmarks_book_id ON user_bookmarks(book_id);
      CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON user_notes(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_bookmarks_book_id ON user_notes(book_id);
      CREATE INDEX IF NOT EXISTS idx_user_highlights_user_id ON user_highlights(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_highlights_book_id ON user_highlights(book_id);
    `);
    console.log('   ✅ Indexes created');

    // 11. Initialize default achievements
    console.log('11. Initializing default achievements...');
    await AchievementChecker.initializeDefaultAchievements();
    console.log('   ✅ Default achievements initialized');

    console.log('\n🎉 Dashboard database initialization completed successfully!');
    console.log('\n📊 Dashboard Features Now Available:');
    console.log('   • Reading Goals Management');
    console.log('   • Achievement System');
    console.log('   • Reading Sessions Tracking');
    console.log('   • Bookmarks, Notes, and Highlights');
    console.log('   • User Activity Feed');
    console.log('   • Enhanced Notifications');
    console.log('   • Reading Analytics');

  } catch (error) {
    console.error('❌ Error initializing dashboard tables:', error);
    throw error;
  }
}

// Run the initialization if this script is executed directly
if (require.main === module) {
  initializeDashboardTables()
    .then(() => {
      console.log('\n✅ Dashboard initialization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Dashboard initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeDashboardTables }; 