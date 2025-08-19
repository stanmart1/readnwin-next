const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

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

async function checkExistingTables() {
  console.log("\n📋 Checking existing tables...");
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log(`Found ${result.rows.length} existing tables:`);
    const existingTables = {};

    result.rows.forEach(row => {
      console.log(`  📄 ${row.table_name} (${row.table_type})`);
      existingTables[row.table_name] = true;
    });

    return existingTables;
  } finally {
    client.release();
  }
}

async function createCoreTablesIfNeeded(existingTables) {
  console.log("\n🏗️  Checking core tables...");
  const client = await pool.connect();

  try {
    // Create users table if it doesn't exist
    if (!existingTables.users) {
      console.log("Creating users table...");
      await client.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255),
          email_verified BOOLEAN DEFAULT false,
          email_verification_token VARCHAR(255),
          reset_token VARCHAR(255),
          reset_token_expires TIMESTAMP,
          role VARCHAR(50) DEFAULT 'user',
          subscription_status VARCHAR(50) DEFAULT 'inactive',
          subscription_plan VARCHAR(50),
          subscription_expires TIMESTAMP,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log("✅ Users table created");
    } else {
      console.log("✅ Users table already exists");
    }

    // Create books table if it doesn't exist
    if (!existingTables.books) {
      console.log("Creating books table...");
      await client.query(`
        CREATE TABLE books (
          id SERIAL PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          author VARCHAR(255),
          description TEXT,
          cover_image VARCHAR(500),
          file_path VARCHAR(500),
          file_size BIGINT,
          file_type VARCHAR(50),
          epub_content TEXT,
          total_pages INTEGER DEFAULT 0,
          word_count INTEGER DEFAULT 0,
          language VARCHAR(10) DEFAULT 'en',
          isbn VARCHAR(20),
          publisher VARCHAR(255),
          published_date DATE,
          category VARCHAR(100),
          tags JSONB DEFAULT '[]',
          price DECIMAL(10,2) DEFAULT 0.00,
          is_free BOOLEAN DEFAULT false,
          is_featured BOOLEAN DEFAULT false,
          is_active BOOLEAN DEFAULT true,
          download_count INTEGER DEFAULT 0,
          view_count INTEGER DEFAULT 0,
          rating DECIMAL(3,2) DEFAULT 0.00,
          rating_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log("✅ Books table created");
    } else {
      console.log("✅ Books table already exists");
    }

    // Create orders table if it doesn't exist
    if (!existingTables.orders) {
      console.log("Creating orders table...");
      await client.query(`
        CREATE TABLE orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          total_amount DECIMAL(10,2) NOT NULL,
          payment_status VARCHAR(50) DEFAULT 'pending',
          payment_method VARCHAR(50),
          payment_reference VARCHAR(255),
          order_items JSONB NOT NULL DEFAULT '[]',
          billing_address JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log("✅ Orders table created");
    } else {
      console.log("✅ Orders table already exists");
    }

    // Create user_books table if it doesn't exist (for purchased books)
    if (!existingTables.user_books) {
      console.log("Creating user_books table...");
      await client.query(`
        CREATE TABLE user_books (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
          purchased_at TIMESTAMP DEFAULT NOW(),
          access_expires TIMESTAMP,
          is_active BOOLEAN DEFAULT true,
          CONSTRAINT unique_user_book UNIQUE(user_id, book_id)
        )
      `);
      console.log("✅ User_books table created");
    } else {
      console.log("✅ User_books table already exists");
    }

  } finally {
    client.release();
  }
}

async function createEReaderTables() {
  console.log("\n📚 Creating E-Reader tables...");
  const client = await pool.connect();

  try {
    // Create reading_progress table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reading_progress (
        id SERIAL PRIMARY KEY,
        book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        current_position INTEGER DEFAULT 0,
        percentage NUMERIC(5,2) DEFAULT 0.00,
        time_spent INTEGER DEFAULT 0,
        last_read_at TIMESTAMP DEFAULT NOW(),
        session_start_time TIMESTAMP DEFAULT NOW(),
        words_read INTEGER DEFAULT 0,
        chapters_completed INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT unique_user_book_progress UNIQUE(book_id, user_id)
      )
    `);
    console.log("✅ Reading progress table created");

    // Create highlights table
    await client.query(`
      CREATE TABLE IF NOT EXISTS highlights (
        id SERIAL PRIMARY KEY,
        book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        start_offset INTEGER NOT NULL,
        end_offset INTEGER NOT NULL,
        color VARCHAR(20) DEFAULT 'yellow' CHECK (color IN ('yellow', 'green', 'blue', 'pink', 'purple')),
        note TEXT,
        chapter_index INTEGER,
        position INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Highlights table created");

    // Create notes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id SERIAL PRIMARY KEY,
        book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100) DEFAULT 'general',
        tags JSONB DEFAULT '[]',
        attached_to_highlight INTEGER REFERENCES highlights(id) ON DELETE SET NULL,
        position INTEGER DEFAULT 0,
        chapter_index INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Notes table created");

    // Create reading_sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reading_sessions (
        id SERIAL PRIMARY KEY,
        book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session_id VARCHAR(100) NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        duration INTEGER DEFAULT 0,
        words_read INTEGER DEFAULT 0,
        progress_start NUMERIC(5,2) DEFAULT 0.00,
        progress_end NUMERIC(5,2) DEFAULT 0.00,
        device_type VARCHAR(50),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Reading sessions table created");

    // Create reading_analytics table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reading_analytics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        total_reading_time INTEGER DEFAULT 0,
        words_read INTEGER DEFAULT 0,
        books_read INTEGER DEFAULT 0,
        pages_read INTEGER DEFAULT 0,
        average_wpm NUMERIC(6,2) DEFAULT 0.00,
        reading_streak INTEGER DEFAULT 0,
        session_count INTEGER DEFAULT 0,
        longest_session INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT unique_user_date_analytics UNIQUE(user_id, date)
      )
    `);
    console.log("✅ Reading analytics table created");

    // Create reader_settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reader_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        font_size INTEGER DEFAULT 18 CHECK (font_size >= 12 AND font_size <= 24),
        font_family VARCHAR(100) DEFAULT 'serif',
        line_height NUMERIC(3,2) DEFAULT 1.6 CHECK (line_height >= 1.2 AND line_height <= 2.0),
        font_weight INTEGER DEFAULT 400,
        theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'sepia')),
        reading_width VARCHAR(20) DEFAULT 'medium' CHECK (reading_width IN ('narrow', 'medium', 'wide')),
        margins INTEGER DEFAULT 20 CHECK (margins >= 0 AND margins <= 100),
        padding INTEGER DEFAULT 16 CHECK (padding >= 0 AND padding <= 50),
        justify_text BOOLEAN DEFAULT true,
        show_progress_bar BOOLEAN DEFAULT true,
        show_chapter_numbers BOOLEAN DEFAULT true,
        tts_enabled BOOLEAN DEFAULT false,
        tts_voice VARCHAR(200) DEFAULT '',
        tts_speed NUMERIC(3,2) DEFAULT 1.0 CHECK (tts_speed >= 0.5 AND tts_speed <= 2.0),
        tts_auto_play BOOLEAN DEFAULT false,
        high_contrast BOOLEAN DEFAULT false,
        reduce_motion BOOLEAN DEFAULT false,
        screen_reader_mode BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Reader settings table created");

    // Create book_access_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS book_access_logs (
        id SERIAL PRIMARY KEY,
        book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        access_type VARCHAR(50) NOT NULL,
        ip_address INET,
        user_agent TEXT,
        accessed_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("✅ Book access logs table created");

  } finally {
    client.release();
  }
}

async function createIndexes() {
  console.log("\n🔍 Creating indexes for better performance...");
  const client = await pool.connect();

  try {
    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_reading_progress_user_book ON reading_progress(user_id, book_id)",
      "CREATE INDEX IF NOT EXISTS idx_reading_progress_last_read ON reading_progress(last_read_at)",
      "CREATE INDEX IF NOT EXISTS idx_highlights_user_book ON highlights(user_id, book_id)",
      "CREATE INDEX IF NOT EXISTS idx_highlights_created ON highlights(created_at)",
      "CREATE INDEX IF NOT EXISTS idx_notes_user_book ON notes(user_id, book_id)",
      "CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category)",
      "CREATE INDEX IF NOT EXISTS idx_notes_created ON notes(created_at)",
      "CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING gin(tags)",
      "CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON reading_sessions(user_id, start_time)",
      "CREATE INDEX IF NOT EXISTS idx_analytics_user_date ON reading_analytics(user_id, date)",
      "CREATE INDEX IF NOT EXISTS idx_access_logs_user_date ON book_access_logs(user_id, accessed_at)",
      "CREATE INDEX IF NOT EXISTS idx_access_logs_book ON book_access_logs(book_id)",
      "CREATE INDEX IF NOT EXISTS idx_books_category ON books(category)",
      "CREATE INDEX IF NOT EXISTS idx_books_is_active ON books(is_active)",
      "CREATE INDEX IF NOT EXISTS idx_books_is_featured ON books(is_featured)",
      "CREATE INDEX IF NOT EXISTS idx_user_books_user_id ON user_books(user_id)",
      "CREATE INDEX IF NOT EXISTS idx_user_books_book_id ON user_books(book_id)"
    ];

    for (const indexSQL of indexes) {
      await client.query(indexSQL);
    }

    console.log(`✅ Created ${indexes.length} indexes`);

  } finally {
    client.release();
  }
}

async function createTriggers() {
  console.log("\n⚡ Creating triggers...");
  const client = await pool.connect();

  try {
    // Create update trigger function
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
      "CREATE TRIGGER IF NOT EXISTS update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
      "CREATE TRIGGER IF NOT EXISTS update_books_updated_at BEFORE UPDATE ON books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
      "CREATE TRIGGER IF NOT EXISTS update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
      "CREATE TRIGGER IF NOT EXISTS update_reading_progress_updated_at BEFORE UPDATE ON reading_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
      "CREATE TRIGGER IF NOT EXISTS update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
      "CREATE TRIGGER IF NOT EXISTS update_analytics_updated_at BEFORE UPDATE ON reading_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()",
      "CREATE TRIGGER IF NOT EXISTS update_settings_updated_at BEFORE UPDATE ON reader_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()"
    ];

    for (const triggerSQL of triggers) {
      try {
        await client.query(triggerSQL);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.warn(`Warning creating trigger: ${error.message}`);
        }
      }
    }

    console.log("✅ Triggers created");

  } finally {
    client.release();
  }
}

async function createViews() {
  console.log("\n👁️  Creating views...");
  const client = await pool.connect();

  try {
    // Reading stats view
    await client.query(`
      CREATE OR REPLACE VIEW reading_stats_view AS
      SELECT
        u.id as user_id,
        u.name as user_name,
        COUNT(DISTINCT rp.book_id) as books_started,
        COUNT(DISTINCT CASE WHEN rp.percentage >= 100 THEN rp.book_id END) as books_completed,
        SUM(rp.time_spent) as total_reading_time,
        AVG(rp.percentage) as average_progress,
        COUNT(DISTINCT h.id) as total_highlights,
        COUNT(DISTINCT n.id) as total_notes,
        MAX(rp.last_read_at) as last_activity
      FROM users u
      LEFT JOIN reading_progress rp ON u.id = rp.user_id
      LEFT JOIN highlights h ON u.id = h.user_id
      LEFT JOIN notes n ON u.id = n.user_id
      GROUP BY u.id, u.name
    `);

    // Book popularity view
    await client.query(`
      CREATE OR REPLACE VIEW book_popularity_view AS
      SELECT
        b.id as book_id,
        b.title,
        b.author,
        COUNT(DISTINCT rp.user_id) as readers_count,
        AVG(rp.percentage) as average_progress,
        COUNT(DISTINCT h.id) as total_highlights,
        COUNT(DISTINCT n.id) as total_notes,
        AVG(rp.time_spent) as average_reading_time
      FROM books b
      LEFT JOIN reading_progress rp ON b.id = rp.book_id
      LEFT JOIN highlights h ON b.id = h.book_id
      LEFT JOIN notes n ON b.id = n.book_id
      WHERE rp.percentage > 0 OR h.id IS NOT NULL OR n.id IS NOT NULL
      GROUP BY b.id, b.title, b.author
      ORDER BY readers_count DESC, average_progress DESC
    `);

    console.log("✅ Views created");

  } finally {
    client.release();
  }
}

async function verifySetup() {
  console.log("\n🔍 Verifying database setup...");
  const client = await pool.connect();

  try {
    // Check all required tables
    const requiredTables = [
      'users', 'books', 'orders', 'user_books',
      'reading_progress', 'highlights', 'notes', 'reading_sessions',
      'reading_analytics', 'reader_settings', 'book_access_logs'
    ];

    console.log("Checking tables:");
    for (const table of requiredTables) {
      const result = await client.query(
        "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = $1",
        [table]
      );

      if (result.rows[0].count > 0) {
        console.log(`  ✅ ${table}`);
      } else {
        console.log(`  ❌ ${table} - MISSING!`);
      }
    }

    // Check views
    console.log("\nChecking views:");
    const views = ['reading_stats_view', 'book_popularity_view'];
    for (const view of views) {
      const result = await client.query(
        "SELECT COUNT(*) as count FROM information_schema.views WHERE table_name = $1",
        [view]
      );

      if (result.rows[0].count > 0) {
        console.log(`  ✅ ${view}`);
      } else {
        console.log(`  ❌ ${view} - MISSING!`);
      }
    }

    // Count existing data
    console.log("\nExisting data:");
    const dataQueries = [
      { table: 'users', label: 'Users' },
      { table: 'books', label: 'Books' },
      { table: 'orders', label: 'Orders' },
      { table: 'user_books', label: 'User Books' },
      { table: 'reading_progress', label: 'Reading Progress Records' },
      { table: 'highlights', label: 'Highlights' },
      { table: 'notes', label: 'Notes' },
      { table: 'reader_settings', label: 'Reader Settings' }
    ];

    for (const query of dataQueries) {
      try {
        const result = await client.query(`SELECT COUNT(*) as count FROM ${query.table}`);
        console.log(`  📊 ${query.label}: ${result.rows[0].count}`);
      } catch (error) {
        console.log(`  ❌ ${query.label}: Error - ${error.message}`);
      }
    }

  } finally {
    client.release();
  }
}

async function setupCompleteDatabase() {
  console.log("🚀 Starting complete database setup...");

  try {
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error("Could not connect to database");
    }

    // Check existing tables
    const existingTables = await checkExistingTables();

    // Create core tables if needed
    await createCoreTablesIfNeeded(existingTables);

    // Create e-reader tables
    await createEReaderTables();

    // Create indexes
    await createIndexes();

    // Create triggers
    await createTriggers();

    // Create views
    await createViews();

    // Verify setup
    await verifySetup();

    console.log("\n🎉 Database setup completed successfully!");
    console.log("\n📋 Summary:");
    console.log("  ✅ Database connection verified");
    console.log("  ✅ Core tables created/verified");
    console.log("  ✅ E-reader tables created");
    console.log("  ✅ Indexes created for performance");
    console.log("  ✅ Triggers created for automatic updates");
    console.log("  ✅ Views created for analytics");
    console.log("  ✅ Setup verification completed");

  } catch (error) {
    console.error("💥 Database setup failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupCompleteDatabase()
    .then(() => {
      console.log("\n✨ All done! Your database is ready for the e-reader system.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Setup failed:", error.message);
      process.exit(1);
    });
}

module.exports = { setupCompleteDatabase, testConnection };
