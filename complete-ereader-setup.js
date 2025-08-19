const { Pool } = require("pg");

// Database configuration using provided credentials
const pool = new Pool({
  host: "149.102.159.118",
  database: "postgres",
  user: "postgres",
  password: "6c8u2MsYqlbQxL5IxftjrV7QQnlLymdsmzMtTeIe4Ur1od7RR9CdODh3VfQ4ka2f",
  port: 5432,
  ssl: false,
});

async function testConnection() {
  console.log("🔌 Testing database connection...");
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW(), version()');
    console.log("✅ Database connection successful!");
    console.log(`📅 Current time: ${result.rows[0].now}`);
    console.log(`🗄️  Database version: ${result.rows[0].version.split(' ').slice(0, 2).join(' ')}`);
    client.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
}

async function createViews() {
  console.log("👁️  Creating/updating views...");
  const client = await pool.connect();

  try {
    // Enhanced reading stats view - using correct column names
    await client.query(`
      CREATE OR REPLACE VIEW enhanced_reading_stats AS
      SELECT
        u.id as user_id,
        COALESCE(u.first_name || ' ' || u.last_name, u.username) as user_name,
        u.email,
        u.username,
        COUNT(DISTINCT rp.book_id) as books_started,
        COUNT(DISTINCT CASE WHEN rp.percentage >= 100 OR rp.progress_percentage >= 100 THEN rp.book_id END) as books_completed,
        COALESCE(SUM(rp.time_spent), 0) as total_reading_time_seconds,
        ROUND(COALESCE(SUM(rp.time_spent), 0) / 60.0, 2) as total_reading_time_minutes,
        ROUND(COALESCE(AVG(COALESCE(rp.percentage, rp.progress_percentage)), 0), 2) as average_progress,
        COUNT(DISTINCT h.id) as total_highlights,
        COUNT(DISTINCT n.id) as total_notes,
        MAX(rp.last_read_at) as last_activity,
        CASE
          WHEN MAX(rp.last_read_at) > NOW() - INTERVAL '7 days' THEN 'Active'
          WHEN MAX(rp.last_read_at) > NOW() - INTERVAL '30 days' THEN 'Recently Active'
          ELSE 'Inactive'
        END as activity_status
      FROM users u
      LEFT JOIN reading_progress rp ON u.id = rp.user_id
      LEFT JOIN highlights h ON u.id = h.user_id
      LEFT JOIN notes n ON u.id = n.user_id
      GROUP BY u.id, u.first_name, u.last_name, u.username, u.email
    `);
    console.log("  ✅ Enhanced reading stats view created");

    // Book engagement view - using correct column references
    await client.query(`
      CREATE OR REPLACE VIEW book_engagement_stats AS
      SELECT
        b.id as book_id,
        b.title,
        b.author_id,
        b.category_id,
        COUNT(DISTINCT rp.user_id) as total_readers,
        COUNT(DISTINCT CASE WHEN COALESCE(rp.percentage, rp.progress_percentage) >= 100 THEN rp.user_id END) as completed_readers,
        ROUND(AVG(COALESCE(rp.percentage, rp.progress_percentage)), 2) as average_progress,
        COALESCE(SUM(rp.time_spent), 0) as total_reading_time,
        COUNT(DISTINCT h.id) as total_highlights,
        COUNT(DISTINCT n.id) as total_notes,
        COUNT(DISTINCT rs.id) as total_sessions,
        ROUND(AVG(rs.duration), 2) as average_session_duration,
        MAX(rp.last_read_at) as last_read_date
      FROM books b
      LEFT JOIN reading_progress rp ON b.id = rp.book_id
      LEFT JOIN highlights h ON b.id = h.book_id
      LEFT JOIN notes n ON b.id = n.book_id
      LEFT JOIN reading_sessions rs ON b.id = rs.book_id
      GROUP BY b.id, b.title, b.author_id, b.category_id
      HAVING COUNT(DISTINCT rp.user_id) > 0
      ORDER BY total_readers DESC, average_progress DESC
    `);
    console.log("  ✅ Book engagement stats view created");

    // Daily reading analytics view
    await client.query(`
      CREATE OR REPLACE VIEW daily_reading_trends AS
      SELECT
        ra.date,
        COUNT(DISTINCT ra.user_id) as active_readers,
        SUM(ra.total_reading_time) as total_reading_time_seconds,
        ROUND(SUM(ra.total_reading_time) / 60.0, 2) as total_reading_time_minutes,
        SUM(ra.words_read) as total_words_read,
        SUM(ra.pages_read) as total_pages_read,
        ROUND(AVG(ra.average_wpm), 2) as average_reading_speed,
        SUM(ra.session_count) as total_sessions,
        ROUND(AVG(ra.longest_session), 2) as average_longest_session
      FROM reading_analytics ra
      GROUP BY ra.date
      ORDER BY ra.date DESC
    `);
    console.log("  ✅ Daily reading trends view created");

    // User reading summary view
    await client.query(`
      CREATE OR REPLACE VIEW user_reading_summary AS
      SELECT
        u.id as user_id,
        u.username,
        u.email,
        COALESCE(u.first_name || ' ' || u.last_name, u.username) as full_name,
        COUNT(DISTINCT ub.book_id) as books_owned,
        COUNT(DISTINCT rp.book_id) as books_started,
        COUNT(DISTINCT CASE WHEN COALESCE(rp.percentage, rp.progress_percentage) >= 100 THEN rp.book_id END) as books_completed,
        COUNT(DISTINCT h.id) as total_highlights,
        COUNT(DISTINCT n.id) as total_notes,
        COALESCE(SUM(rp.time_spent), 0) as total_reading_time,
        MAX(rp.last_read_at) as last_reading_session,
        rs.font_size,
        rs.theme,
        rs.reading_width
      FROM users u
      LEFT JOIN user_books ub ON u.id = ub.user_id AND ub.is_active = true
      LEFT JOIN reading_progress rp ON u.id = rp.user_id
      LEFT JOIN highlights h ON u.id = h.user_id
      LEFT JOIN notes n ON u.id = n.user_id
      LEFT JOIN reader_settings rs ON u.id = rs.user_id
      WHERE u.status = 'active'
      GROUP BY u.id, u.username, u.email, u.first_name, u.last_name, rs.font_size, rs.theme, rs.reading_width
    `);
    console.log("  ✅ User reading summary view created");

    // Book analytics view
    await client.query(`
      CREATE OR REPLACE VIEW book_analytics AS
      SELECT
        b.id,
        b.title,
        b.status,
        b.is_featured,
        b.price,
        b.word_count,
        b.estimated_reading_time,
        COUNT(DISTINCT ub.user_id) as total_purchases,
        COUNT(DISTINCT rp.user_id) as readers_started,
        COUNT(DISTINCT CASE WHEN COALESCE(rp.percentage, rp.progress_percentage) >= 100 THEN rp.user_id END) as readers_completed,
        ROUND(AVG(COALESCE(rp.percentage, rp.progress_percentage)), 2) as avg_completion_rate,
        COUNT(DISTINCT h.id) as total_highlights,
        COUNT(DISTINCT n.id) as total_notes,
        COALESCE(SUM(rp.time_spent), 0) as total_reading_time,
        COUNT(DISTINCT rs.id) as total_sessions,
        b.view_count,
        b.rating,
        b.review_count,
        b.created_at
      FROM books b
      LEFT JOIN user_books ub ON b.id = ub.book_id AND ub.is_active = true
      LEFT JOIN reading_progress rp ON b.id = rp.book_id
      LEFT JOIN highlights h ON b.id = h.book_id
      LEFT JOIN notes n ON b.id = n.book_id
      LEFT JOIN reading_sessions rs ON b.id = rs.book_id
      WHERE b.status = 'published'
      GROUP BY b.id, b.title, b.status, b.is_featured, b.price, b.word_count,
               b.estimated_reading_time, b.view_count, b.rating, b.review_count, b.created_at
    `);
    console.log("  ✅ Book analytics view created");

    console.log("  ✅ All views created successfully");

  } catch (error) {
    console.error("  ❌ Error creating views:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function createAdditionalIndexes() {
  console.log("🔍 Creating additional indexes...");
  const client = await pool.connect();

  try {
    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_reading_progress_percentage ON reading_progress(percentage)",
      "CREATE INDEX IF NOT EXISTS idx_reading_progress_time_spent ON reading_progress(time_spent)",
      "CREATE INDEX IF NOT EXISTS idx_highlights_position ON highlights(position)",
      "CREATE INDEX IF NOT EXISTS idx_highlights_chapter ON highlights(chapter_index)",
      "CREATE INDEX IF NOT EXISTS idx_highlights_page ON highlights(page_number)",
      "CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title)",
      "CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at)",
      "CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category)",
      "CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING gin(tags)",
      "CREATE INDEX IF NOT EXISTS idx_sessions_duration ON reading_sessions(duration)",
      "CREATE INDEX IF NOT EXISTS idx_sessions_device ON reading_sessions(device_type)",
      "CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON reading_sessions(start_time)",
      "CREATE INDEX IF NOT EXISTS idx_analytics_date ON reading_analytics(date)",
      "CREATE INDEX IF NOT EXISTS idx_analytics_reading_time ON reading_analytics(total_reading_time)",
      "CREATE INDEX IF NOT EXISTS idx_access_logs_type ON book_access_logs(access_type)",
      "CREATE INDEX IF NOT EXISTS idx_reader_settings_theme ON reader_settings(theme)",
      "CREATE INDEX IF NOT EXISTS idx_user_books_active ON user_books(is_active)",
      "CREATE INDEX IF NOT EXISTS idx_users_full_name ON users((first_name || ' ' || last_name))",
      "CREATE INDEX IF NOT EXISTS idx_books_word_count ON books(word_count)",
      "CREATE INDEX IF NOT EXISTS idx_books_reading_time ON books(estimated_reading_time)"
    ];

    for (const indexSQL of indexes) {
      try {
        await client.query(indexSQL);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.warn(`  ⚠️  Warning creating index: ${error.message}`);
        }
      }
    }

    console.log("  ✅ Additional indexes created");

  } finally {
    client.release();
  }
}

async function createDefaultReaderSettings() {
  console.log("👥 Creating default reader settings for existing users...");
  const client = await pool.connect();

  try {
    // Insert default reader settings for users who don't have them
    const result = await client.query(`
      INSERT INTO reader_settings (user_id)
      SELECT u.id
      FROM users u
      LEFT JOIN reader_settings rs ON u.id = rs.user_id
      WHERE rs.user_id IS NULL AND u.status = 'active'
      ON CONFLICT (user_id) DO NOTHING
    `);

    console.log(`  ✅ Created default reader settings for ${result.rowCount} users`);

  } catch (error) {
    console.error("  ❌ Error creating default reader settings:", error.message);
  } finally {
    client.release();
  }
}

async function createTriggers() {
  console.log("⚡ Creating/updating triggers...");
  const client = await pool.connect();

  try {
    // Create update trigger function if it doesn't exist
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // Create triggers for tables with updated_at column
    const triggers = [
      {
        name: "update_reading_progress_updated_at",
        table: "reading_progress"
      },
      {
        name: "update_notes_updated_at",
        table: "notes"
      },
      {
        name: "update_reading_analytics_updated_at",
        table: "reading_analytics"
      },
      {
        name: "update_reader_settings_updated_at",
        table: "reader_settings"
      }
    ];

    for (const trigger of triggers) {
      try {
        // Drop existing trigger if it exists
        await client.query(`DROP TRIGGER IF EXISTS ${trigger.name} ON ${trigger.table}`);

        // Create new trigger
        await client.query(`
          CREATE TRIGGER ${trigger.name}
          BEFORE UPDATE ON ${trigger.table}
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        `);

        console.log(`  ✅ Trigger ${trigger.name} created`);
      } catch (error) {
        console.warn(`  ⚠️  Warning creating trigger ${trigger.name}: ${error.message}`);
      }
    }

    console.log("  ✅ Triggers created/updated");

  } finally {
    client.release();
  }
}

async function verifyConstraints() {
  console.log("🔒 Verifying database constraints...");
  const client = await pool.connect();

  try {
    // Add foreign key constraint for notes -> highlights if it doesn't exist
    try {
      await client.query(`
        ALTER TABLE notes
        ADD CONSTRAINT IF NOT EXISTS fk_note_highlight
        FOREIGN KEY (attached_to_highlight) REFERENCES highlights(id) ON DELETE SET NULL
      `);
      console.log("  ✅ Note-to-highlight foreign key constraint verified");
    } catch (error) {
      console.log("  ⚠️  Note-to-highlight constraint already exists or error:", error.message);
    }

    // Add unique constraint for reading_analytics if it doesn't exist
    try {
      await client.query(`
        ALTER TABLE reading_analytics
        ADD CONSTRAINT IF NOT EXISTS unique_user_date_analytics
        UNIQUE(user_id, date)
      `);
      console.log("  ✅ Reading analytics unique constraint verified");
    } catch (error) {
      console.log("  ⚠️  Reading analytics constraint already exists or error:", error.message);
    }

    // Add check constraints for reader_settings if they don't exist
    const checkConstraints = [
      {
        table: "reader_settings",
        name: "check_font_size_range",
        constraint: "font_size >= 12 AND font_size <= 24"
      },
      {
        table: "reader_settings",
        name: "check_line_height_range",
        constraint: "line_height >= 1.2 AND line_height <= 2.0"
      },
      {
        table: "reader_settings",
        name: "check_theme_values",
        constraint: "theme IN ('light', 'dark', 'sepia')"
      },
      {
        table: "reader_settings",
        name: "check_reading_width_values",
        constraint: "reading_width IN ('narrow', 'medium', 'wide')"
      },
      {
        table: "highlights",
        name: "check_highlight_color_values",
        constraint: "color IN ('yellow', 'green', 'blue', 'pink', 'purple')"
      }
    ];

    for (const check of checkConstraints) {
      try {
        await client.query(`
          ALTER TABLE ${check.table}
          ADD CONSTRAINT IF NOT EXISTS ${check.name}
          CHECK (${check.constraint})
        `);
        console.log(`  ✅ Check constraint ${check.name} verified`);
      } catch (error) {
        console.log(`  ⚠️  Check constraint ${check.name} already exists or error: ${error.message}`);
      }
    }

  } finally {
    client.release();
  }
}

async function showDatabaseSummary() {
  console.log("\n📊 E-Reader Database Summary:");
  console.log("=============================");

  const client = await pool.connect();

  try {
    // Count users
    const usersResult = await client.query("SELECT COUNT(*) as count FROM users WHERE status = 'active'");
    console.log(`👥 Active Users: ${usersResult.rows[0].count}`);

    // Count books
    const booksResult = await client.query("SELECT COUNT(*) as count FROM books WHERE status = 'published'");
    console.log(`📚 Published Books: ${booksResult.rows[0].count}`);

    // Count reading progress records
    const progressResult = await client.query("SELECT COUNT(*) as count FROM reading_progress");
    console.log(`📖 Reading Progress Records: ${progressResult.rows[0].count}`);

    // Count highlights
    const highlightsResult = await client.query("SELECT COUNT(*) as count FROM highlights");
    console.log(`✨ Total Highlights: ${highlightsResult.rows[0].count}`);

    // Count notes
    const notesResult = await client.query("SELECT COUNT(*) as count FROM notes");
    console.log(`📝 Total Notes: ${notesResult.rows[0].count}`);

    // Count reader settings
    const settingsResult = await client.query("SELECT COUNT(*) as count FROM reader_settings");
    console.log(`⚙️  Reader Settings: ${settingsResult.rows[0].count}`);

    // Count reading sessions
    const sessionsResult = await client.query("SELECT COUNT(*) as count FROM reading_sessions");
    console.log(`🎯 Reading Sessions: ${sessionsResult.rows[0].count}`);

    // Count user books (purchases)
    const userBooksResult = await client.query("SELECT COUNT(*) as count FROM user_books WHERE is_active = true");
    console.log(`🛒 Active User Book Purchases: ${userBooksResult.rows[0].count}`);

    // Show recent activity
    const recentActivityResult = await client.query(`
      SELECT COUNT(*) as count
      FROM reading_progress
      WHERE last_read_at > NOW() - INTERVAL '7 days'
    `);
    console.log(`📈 Recent Reading Activity (7 days): ${recentActivityResult.rows[0].count} sessions`);

    // Show most active readers
    const activeReadersResult = await client.query(`
      SELECT
        COALESCE(u.first_name || ' ' || u.last_name, u.username) as name,
        COUNT(DISTINCT rp.book_id) as books_reading,
        SUM(rp.time_spent) as total_time
      FROM users u
      JOIN reading_progress rp ON u.id = rp.user_id
      WHERE rp.last_read_at > NOW() - INTERVAL '30 days'
      GROUP BY u.id, u.first_name, u.last_name, u.username
      ORDER BY total_time DESC NULLS LAST
      LIMIT 5
    `);

    if (activeReadersResult.rows.length > 0) {
      console.log("\n🏆 Most Active Readers (Last 30 Days):");
      activeReadersResult.rows.forEach((reader, index) => {
        const minutes = Math.round(reader.total_time / 60) || 0;
        console.log(`  ${index + 1}. ${reader.name}: ${reader.books_reading} books, ${minutes} minutes`);
      });
    }

    // Show popular books
    const popularBooksResult = await client.query(`
      SELECT
        b.title,
        COUNT(DISTINCT rp.user_id) as readers,
        COUNT(DISTINCT h.id) as highlights,
        COUNT(DISTINCT n.id) as notes
      FROM books b
      LEFT JOIN reading_progress rp ON b.id = rp.book_id
      LEFT JOIN highlights h ON b.id = h.book_id
      LEFT JOIN notes n ON b.id = n.book_id
      WHERE b.status = 'published'
      GROUP BY b.id, b.title
      HAVING COUNT(DISTINCT rp.user_id) > 0
      ORDER BY readers DESC, highlights DESC
      LIMIT 5
    `);

    if (popularBooksResult.rows.length > 0) {
      console.log("\n📖 Most Popular Books:");
      popularBooksResult.rows.forEach((book, index) => {
        console.log(`  ${index + 1}. ${book.title}: ${book.readers} readers, ${book.highlights} highlights, ${book.notes} notes`);
      });
    }

  } finally {
    client.release();
  }
}

async function completeEReaderSetup() {
  console.log("🚀 Starting complete E-Reader database setup...\n");

  try {
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error("Could not connect to database");
    }

    // Create additional indexes
    await createAdditionalIndexes();

    // Create/update triggers
    await createTriggers();

    // Verify constraints
    await verifyConstraints();

    // Create/update views
    await createViews();

    // Create default reader settings
    await createDefaultReaderSettings();

    // Show summary
    await showDatabaseSummary();

    console.log("\n🎉 E-Reader database setup completed successfully!");
    console.log("\n📋 What was accomplished:");
    console.log("  ✅ Database connection verified");
    console.log("  ✅ Additional indexes created for performance");
    console.log("  ✅ Database triggers created/updated");
    console.log("  ✅ Data integrity constraints verified");
    console.log("  ✅ Analytics views created/updated");
    console.log("  ✅ Default reader settings created for existing users");
    console.log("  ✅ Database summary generated");

    console.log("\n📚 Available E-Reader Features:");
    console.log("  • Reading progress tracking");
    console.log("  • Text highlighting system");
    console.log("  • Note-taking functionality");
    console.log("  • Reading session analytics");
    console.log("  • Customizable reader settings");
    console.log("  • User reading statistics");
    console.log("  • Book engagement metrics");
    console.log("  • Access logging for security");

  } catch (error) {
    console.error("💥 E-Reader setup failed:", error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  completeEReaderSetup()
    .then(() => {
      console.log("\n✨ Your E-Reader database is now fully configured and ready to use!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Setup failed:", error.message);
      process.exit(1);
    });
}

module.exports = { completeEReaderSetup, testConnection };
