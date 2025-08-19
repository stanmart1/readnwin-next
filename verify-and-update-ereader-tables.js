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

async function checkTableStructure(tableName) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = $1 AND table_schema = 'public'
      ORDER BY ordinal_position
    `, [tableName]);

    return result.rows;
  } finally {
    client.release();
  }
}

async function tableExists(tableName) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_name = $1 AND table_schema = 'public'
    `, [tableName]);

    return result.rows[0].count > 0;
  } finally {
    client.release();
  }
}

async function columnExists(tableName, columnName) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.columns
      WHERE table_name = $1 AND column_name = $2 AND table_schema = 'public'
    `, [tableName, columnName]);

    return result.rows[0].count > 0;
  } finally {
    client.release();
  }
}

async function addMissingColumn(tableName, columnName, columnDefinition) {
  const client = await pool.connect();
  try {
    console.log(`  ➕ Adding column ${columnName} to ${tableName}...`);
    await client.query(`ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS ${columnName} ${columnDefinition}`);
    console.log(`  ✅ Column ${columnName} added successfully`);
  } catch (error) {
    console.error(`  ❌ Error adding column ${columnName} to ${tableName}:`, error.message);
  } finally {
    client.release();
  }
}

async function createMissingTable(tableName, tableDefinition) {
  const client = await pool.connect();
  try {
    console.log(`  🏗️ Creating table ${tableName}...`);
    await client.query(tableDefinition);
    console.log(`  ✅ Table ${tableName} created successfully`);
  } catch (error) {
    console.error(`  ❌ Error creating table ${tableName}:`, error.message);
  } finally {
    client.release();
  }
}

async function verifyAndUpdateEReaderTables() {
  console.log("🚀 Starting E-Reader tables verification and update...\n");

  // Test connection
  const connected = await testConnection();
  if (!connected) {
    throw new Error("Could not connect to database");
  }

  console.log("\n📋 Checking E-Reader tables and columns...\n");

  // Define required tables and their expected columns
  const requiredTables = {
    reading_progress: {
      columns: {
        id: "SERIAL PRIMARY KEY",
        book_id: "INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE",
        user_id: "INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE",
        current_position: "INTEGER DEFAULT 0",
        current_page: "INTEGER DEFAULT 0",
        total_pages: "INTEGER",
        percentage: "NUMERIC(5,2) DEFAULT 0.00",
        progress_percentage: "NUMERIC(5,2) DEFAULT 0.00",
        time_spent: "INTEGER DEFAULT 0",
        last_read_at: "TIMESTAMP DEFAULT NOW()",
        session_start_time: "TIMESTAMP DEFAULT NOW()",
        words_read: "INTEGER DEFAULT 0",
        chapters_completed: "INTEGER DEFAULT 0",
        created_at: "TIMESTAMP DEFAULT NOW()",
        updated_at: "TIMESTAMP DEFAULT NOW()"
      }
    },

    highlights: {
      columns: {
        id: "SERIAL PRIMARY KEY",
        book_id: "INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE",
        user_id: "INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE",
        text: "TEXT NOT NULL",
        start_offset: "INTEGER NOT NULL",
        end_offset: "INTEGER NOT NULL",
        color: "VARCHAR(20) DEFAULT 'yellow'",
        note: "TEXT",
        chapter_index: "INTEGER",
        position: "INTEGER DEFAULT 0",
        page_number: "INTEGER",
        created_at: "TIMESTAMP DEFAULT NOW()"
      }
    },

    notes: {
      columns: {
        id: "SERIAL PRIMARY KEY",
        book_id: "INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE",
        user_id: "INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE",
        title: "VARCHAR(500)",
        content: "TEXT NOT NULL",
        category: "VARCHAR(100) DEFAULT 'general'",
        note_type: "VARCHAR(50) DEFAULT 'general'",
        tags: "JSONB DEFAULT '[]'",
        attached_to_highlight: "INTEGER",
        position: "INTEGER DEFAULT 0",
        chapter_index: "INTEGER",
        page_number: "INTEGER",
        chapter_title: "VARCHAR(255)",
        color: "VARCHAR(7) DEFAULT '#3B82F6'",
        is_public: "BOOLEAN DEFAULT false",
        created_at: "TIMESTAMP DEFAULT NOW()",
        updated_at: "TIMESTAMP DEFAULT NOW()"
      }
    },

    reading_sessions: {
      columns: {
        id: "SERIAL PRIMARY KEY",
        book_id: "INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE",
        user_id: "INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE",
        session_id: "VARCHAR(100) NOT NULL",
        start_time: "TIMESTAMP NOT NULL",
        end_time: "TIMESTAMP",
        duration: "INTEGER DEFAULT 0",
        words_read: "INTEGER DEFAULT 0",
        progress_start: "NUMERIC(5,2) DEFAULT 0.00",
        progress_end: "NUMERIC(5,2) DEFAULT 0.00",
        device_type: "VARCHAR(50)",
        user_agent: "TEXT",
        created_at: "TIMESTAMP DEFAULT NOW()"
      }
    },

    reading_analytics: {
      columns: {
        id: "SERIAL PRIMARY KEY",
        user_id: "INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE",
        date: "DATE NOT NULL",
        total_reading_time: "INTEGER DEFAULT 0",
        words_read: "INTEGER DEFAULT 0",
        books_read: "INTEGER DEFAULT 0",
        pages_read: "INTEGER DEFAULT 0",
        average_wpm: "NUMERIC(6,2) DEFAULT 0.00",
        reading_streak: "INTEGER DEFAULT 0",
        session_count: "INTEGER DEFAULT 0",
        longest_session: "INTEGER DEFAULT 0",
        created_at: "TIMESTAMP DEFAULT NOW()",
        updated_at: "TIMESTAMP DEFAULT NOW()"
      }
    },

    reader_settings: {
      columns: {
        id: "SERIAL PRIMARY KEY",
        user_id: "INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE",
        font_size: "INTEGER DEFAULT 18",
        font_family: "VARCHAR(100) DEFAULT 'serif'",
        line_height: "NUMERIC(3,2) DEFAULT 1.6",
        font_weight: "INTEGER DEFAULT 400",
        theme: "VARCHAR(20) DEFAULT 'light'",
        reading_width: "VARCHAR(20) DEFAULT 'medium'",
        margins: "INTEGER DEFAULT 20",
        padding: "INTEGER DEFAULT 16",
        justify_text: "BOOLEAN DEFAULT true",
        show_progress_bar: "BOOLEAN DEFAULT true",
        show_chapter_numbers: "BOOLEAN DEFAULT true",
        tts_enabled: "BOOLEAN DEFAULT false",
        tts_voice: "VARCHAR(200) DEFAULT ''",
        tts_speed: "NUMERIC(3,2) DEFAULT 1.0",
        tts_auto_play: "BOOLEAN DEFAULT false",
        high_contrast: "BOOLEAN DEFAULT false",
        reduce_motion: "BOOLEAN DEFAULT false",
        screen_reader_mode: "BOOLEAN DEFAULT false",
        created_at: "TIMESTAMP DEFAULT NOW()",
        updated_at: "TIMESTAMP DEFAULT NOW()"
      }
    },

    book_access_logs: {
      columns: {
        id: "SERIAL PRIMARY KEY",
        book_id: "INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE",
        user_id: "INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE",
        access_type: "VARCHAR(50) NOT NULL",
        ip_address: "INET",
        user_agent: "TEXT",
        accessed_at: "TIMESTAMP DEFAULT NOW()"
      }
    }
  };

  // Check each table
  for (const [tableName, tableConfig] of Object.entries(requiredTables)) {
    console.log(`🔍 Checking table: ${tableName}`);

    const exists = await tableExists(tableName);

    if (!exists) {
      console.log(`  ❌ Table ${tableName} does not exist, creating...`);

      // Create table definition
      const columnDefs = Object.entries(tableConfig.columns)
        .map(([colName, colDef]) => `${colName} ${colDef}`)
        .join(',\n        ');

      const createTableSQL = `
        CREATE TABLE ${tableName} (
        ${columnDefs}
        )
      `;

      await createMissingTable(tableName, createTableSQL);
    } else {
      console.log(`  ✅ Table ${tableName} exists`);

      // Check for missing columns
      const currentStructure = await checkTableStructure(tableName);
      const currentColumns = new Set(currentStructure.map(col => col.column_name));

      for (const [columnName, columnDef] of Object.entries(tableConfig.columns)) {
        if (!currentColumns.has(columnName)) {
          console.log(`    ❌ Missing column: ${columnName}`);
          await addMissingColumn(tableName, columnName, columnDef.replace(/SERIAL PRIMARY KEY|REFERENCES.*|UNIQUE/, '').trim());
        } else {
          console.log(`    ✅ Column ${columnName} exists`);
        }
      }
    }
    console.log("");
  }

  // Create additional indexes if needed
  console.log("🔍 Creating additional indexes...");
  await createAdditionalIndexes();

  // Create views
  console.log("👁️  Creating/updating views...");
  await createViews();

  // Create default reader settings for existing users
  console.log("👥 Creating default reader settings for existing users...");
  await createDefaultReaderSettings();

  console.log("🎉 E-Reader tables verification and update completed successfully!");
}

async function createAdditionalIndexes() {
  const client = await pool.connect();

  try {
    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_reading_progress_percentage ON reading_progress(percentage)",
      "CREATE INDEX IF NOT EXISTS idx_reading_progress_time_spent ON reading_progress(time_spent)",
      "CREATE INDEX IF NOT EXISTS idx_highlights_position ON highlights(position)",
      "CREATE INDEX IF NOT EXISTS idx_highlights_chapter ON highlights(chapter_index)",
      "CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title)",
      "CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at)",
      "CREATE INDEX IF NOT EXISTS idx_sessions_duration ON reading_sessions(duration)",
      "CREATE INDEX IF NOT EXISTS idx_sessions_device ON reading_sessions(device_type)",
      "CREATE INDEX IF NOT EXISTS idx_analytics_date ON reading_analytics(date)",
      "CREATE INDEX IF NOT EXISTS idx_analytics_reading_time ON reading_analytics(total_reading_time)",
      "CREATE INDEX IF NOT EXISTS idx_access_logs_type ON book_access_logs(access_type)",
      "CREATE INDEX IF NOT EXISTS idx_reader_settings_theme ON reader_settings(theme)"
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

async function createViews() {
  const client = await pool.connect();

  try {
    // Enhanced reading stats view
    await client.query(`
      CREATE OR REPLACE VIEW enhanced_reading_stats AS
      SELECT
        u.id as user_id,
        u.name as user_name,
        u.email,
        COUNT(DISTINCT rp.book_id) as books_started,
        COUNT(DISTINCT CASE WHEN rp.percentage >= 100 THEN rp.book_id END) as books_completed,
        COALESCE(SUM(rp.time_spent), 0) as total_reading_time_seconds,
        ROUND(COALESCE(SUM(rp.time_spent), 0) / 60.0, 2) as total_reading_time_minutes,
        ROUND(COALESCE(AVG(rp.percentage), 0), 2) as average_progress,
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
      GROUP BY u.id, u.name, u.email
    `);

    // Book engagement view
    await client.query(`
      CREATE OR REPLACE VIEW book_engagement_stats AS
      SELECT
        b.id as book_id,
        b.title,
        b.author_id,
        b.category_id,
        COUNT(DISTINCT rp.user_id) as total_readers,
        COUNT(DISTINCT CASE WHEN rp.percentage >= 100 THEN rp.user_id END) as completed_readers,
        ROUND(AVG(rp.percentage), 2) as average_progress,
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

    console.log("  ✅ Views created/updated");

  } finally {
    client.release();
  }
}

async function createDefaultReaderSettings() {
  const client = await pool.connect();

  try {
    // Insert default reader settings for users who don't have them
    const result = await client.query(`
      INSERT INTO reader_settings (user_id)
      SELECT u.id
      FROM users u
      LEFT JOIN reader_settings rs ON u.id = rs.user_id
      WHERE rs.user_id IS NULL
      ON CONFLICT (user_id) DO NOTHING
    `);

    console.log(`  ✅ Created default reader settings for ${result.rowCount} users`);

  } catch (error) {
    console.error("  ❌ Error creating default reader settings:", error.message);
  } finally {
    client.release();
  }
}

async function showDatabaseSummary() {
  console.log("\n📊 Database Summary:");
  console.log("====================");

  const client = await pool.connect();

  try {
    // Count users
    const usersResult = await client.query("SELECT COUNT(*) as count FROM users");
    console.log(`👥 Total Users: ${usersResult.rows[0].count}`);

    // Count books
    const booksResult = await client.query("SELECT COUNT(*) as count FROM books");
    console.log(`📚 Total Books: ${booksResult.rows[0].count}`);

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

    // Show recent activity
    const recentActivityResult = await client.query(`
      SELECT COUNT(*) as count
      FROM reading_progress
      WHERE last_read_at > NOW() - INTERVAL '7 days'
    `);
    console.log(`📈 Recent Activity (7 days): ${recentActivityResult.rows[0].count} reading sessions`);

  } finally {
    client.release();
  }
}

// Run the verification if this script is executed directly
if (require.main === module) {
  verifyAndUpdateEReaderTables()
    .then(async () => {
      await showDatabaseSummary();
      console.log("\n✨ E-Reader database is ready!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Verification failed:", error.message);
      process.exit(1);
    });
}

module.exports = { verifyAndUpdateEReaderTables, testConnection };
