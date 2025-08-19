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
    const result = await client.query('SELECT NOW()');
    console.log("✅ Database connection successful!");
    client.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
}

async function getTestUser() {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT id, username, email FROM users WHERE status = 'active' LIMIT 1");
    if (result.rows.length === 0) {
      throw new Error("No active users found for testing");
    }
    return result.rows[0];
  } finally {
    client.release();
  }
}

async function getTestBook() {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT id, title FROM books WHERE status = 'published' LIMIT 1");
    if (result.rows.length === 0) {
      throw new Error("No published books found for testing");
    }
    return result.rows[0];
  } finally {
    client.release();
  }
}

async function testReaderSettings() {
  console.log("\n📱 Testing Reader Settings...");
  const client = await pool.connect();

  try {
    const testUser = await getTestUser();
    console.log(`  Testing with user: ${testUser.username} (ID: ${testUser.id})`);

    // Test getting reader settings
    const settingsResult = await client.query(
      "SELECT * FROM reader_settings WHERE user_id = $1",
      [testUser.id]
    );

    if (settingsResult.rows.length > 0) {
      const settings = settingsResult.rows[0];
      console.log("  ✅ Reader settings found:");
      console.log(`    - Font size: ${settings.font_size}px`);
      console.log(`    - Theme: ${settings.theme}`);
      console.log(`    - Reading width: ${settings.reading_width}`);
      console.log(`    - TTS enabled: ${settings.tts_enabled}`);
    } else {
      console.log("  ❌ No reader settings found for user");
      return false;
    }

    // Test updating reader settings
    await client.query(`
      UPDATE reader_settings
      SET font_size = 20, theme = 'dark', reading_width = 'wide'
      WHERE user_id = $1
    `, [testUser.id]);

    console.log("  ✅ Successfully updated reader settings");

    // Verify the update
    const updatedResult = await client.query(
      "SELECT font_size, theme, reading_width FROM reader_settings WHERE user_id = $1",
      [testUser.id]
    );

    const updated = updatedResult.rows[0];
    console.log("  ✅ Settings update verified:");
    console.log(`    - Font size: ${updated.font_size}px`);
    console.log(`    - Theme: ${updated.theme}`);
    console.log(`    - Reading width: ${updated.reading_width}`);

    return true;
  } catch (error) {
    console.error("  ❌ Reader settings test failed:", error.message);
    return false;
  } finally {
    client.release();
  }
}

async function testReadingProgress() {
  console.log("\n📖 Testing Reading Progress...");
  const client = await pool.connect();

  try {
    const testUser = await getTestUser();
    const testBook = await getTestBook();

    console.log(`  Testing with user: ${testUser.username}, book: ${testBook.title}`);

    // Create or update reading progress
    await client.query(`
      INSERT INTO reading_progress (user_id, book_id, current_position, percentage, time_spent, words_read, current_page, total_pages)
      VALUES ($1, $2, 1500, 25.5, 1800, 500, 10, 40)
      ON CONFLICT (user_id, book_id)
      DO UPDATE SET
        current_position = EXCLUDED.current_position,
        percentage = EXCLUDED.percentage,
        time_spent = reading_progress.time_spent + EXCLUDED.time_spent,
        words_read = reading_progress.words_read + EXCLUDED.words_read,
        current_page = EXCLUDED.current_page,
        last_read_at = NOW()
    `, [testUser.id, testBook.id]);

    console.log("  ✅ Reading progress created/updated");

    // Retrieve reading progress
    const progressResult = await client.query(`
      SELECT rp.*, b.title as book_title
      FROM reading_progress rp
      JOIN books b ON rp.book_id = b.id
      WHERE rp.user_id = $1 AND rp.book_id = $2
    `, [testUser.id, testBook.id]);

    if (progressResult.rows.length > 0) {
      const progress = progressResult.rows[0];
      console.log("  ✅ Reading progress retrieved:");
      console.log(`    - Book: ${progress.book_title}`);
      console.log(`    - Progress: ${progress.percentage}%`);
      console.log(`    - Current page: ${progress.current_page}/${progress.total_pages}`);
      console.log(`    - Time spent: ${Math.round(progress.time_spent / 60)} minutes`);
      console.log(`    - Words read: ${progress.words_read}`);
    }

    return true;
  } catch (error) {
    console.error("  ❌ Reading progress test failed:", error.message);
    return false;
  } finally {
    client.release();
  }
}

async function testHighlights() {
  console.log("\n✨ Testing Highlights...");
  const client = await pool.connect();

  try {
    const testUser = await getTestUser();
    const testBook = await getTestBook();

    // Create a highlight
    const highlightResult = await client.query(`
      INSERT INTO highlights (user_id, book_id, text, start_offset, end_offset, color, note, position, page_number)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [
      testUser.id,
      testBook.id,
      "This is a very important passage that demonstrates the main theme of the story.",
      1200,
      1275,
      'yellow',
      'Key thematic moment - character development',
      1500,
      10
    ]);

    const highlightId = highlightResult.rows[0].id;
    console.log(`  ✅ Highlight created with ID: ${highlightId}`);

    // Retrieve highlights
    const highlightsResult = await client.query(`
      SELECT h.*, b.title as book_title
      FROM highlights h
      JOIN books b ON h.book_id = b.id
      WHERE h.user_id = $1 AND h.book_id = $2
      ORDER BY h.created_at DESC
    `, [testUser.id, testBook.id]);

    console.log(`  ✅ Found ${highlightsResult.rows.length} highlight(s):`);
    highlightsResult.rows.forEach((highlight, index) => {
      console.log(`    ${index + 1}. "${highlight.text.substring(0, 50)}..."`);
      console.log(`       Color: ${highlight.color}, Page: ${highlight.page_number}`);
      if (highlight.note) {
        console.log(`       Note: ${highlight.note}`);
      }
    });

    return true;
  } catch (error) {
    console.error("  ❌ Highlights test failed:", error.message);
    return false;
  } finally {
    client.release();
  }
}

async function testNotes() {
  console.log("\n📝 Testing Notes...");
  const client = await pool.connect();

  try {
    const testUser = await getTestUser();
    const testBook = await getTestBook();

    // Create a note
    const noteResult = await client.query(`
      INSERT INTO notes (user_id, book_id, title, content, category, tags, position, page_number, chapter_title)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [
      testUser.id,
      testBook.id,
      'Character Analysis - Protagonist Growth',
      'The main character shows significant development in this chapter. Their initial hesitation transforms into confident decision-making, which represents a crucial turning point in their journey.',
      'analysis',
      JSON.stringify(['character', 'development', 'growth', 'turning-point']),
      1500,
      10,
      'Chapter 3: The Transformation'
    ]);

    const noteId = noteResult.rows[0].id;
    console.log(`  ✅ Note created with ID: ${noteId}`);

    // Create another note
    await client.query(`
      INSERT INTO notes (user_id, book_id, title, content, category, tags, position, page_number)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      testUser.id,
      testBook.id,
      'Interesting Quote',
      'This quote perfectly captures the essence of the theme: "Sometimes the greatest journey is the one within ourselves."',
      'quote',
      JSON.stringify(['quote', 'theme', 'journey']),
      2100,
      15
    ]);

    console.log("  ✅ Second note created");

    // Retrieve notes
    const notesResult = await client.query(`
      SELECT n.*, b.title as book_title
      FROM notes n
      JOIN books b ON n.book_id = b.id
      WHERE n.user_id = $1 AND n.book_id = $2
      ORDER BY n.created_at DESC
    `, [testUser.id, testBook.id]);

    console.log(`  ✅ Found ${notesResult.rows.length} note(s):`);
    notesResult.rows.forEach((note, index) => {
      console.log(`    ${index + 1}. ${note.title || 'Untitled Note'}`);
      console.log(`       Category: ${note.category}, Page: ${note.page_number}`);
      console.log(`       Content: ${note.content.substring(0, 100)}...`);
      if (note.tags && note.tags.length > 0) {
        console.log(`       Tags: ${note.tags.join(', ')}`);
      }
    });

    return true;
  } catch (error) {
    console.error("  ❌ Notes test failed:", error.message);
    return false;
  } finally {
    client.release();
  }
}

async function testReadingSessions() {
  console.log("\n🎯 Testing Reading Sessions...");
  const client = await pool.connect();

  try {
    const testUser = await getTestUser();
    const testBook = await getTestBook();

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create a reading session
    await client.query(`
      INSERT INTO reading_sessions (
        user_id, book_id, session_id, start_time, end_time, duration,
        words_read, progress_start, progress_end, device_type, user_agent
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      testUser.id,
      testBook.id,
      sessionId,
      new Date(Date.now() - 1800000), // 30 minutes ago
      new Date(),
      1800, // 30 minutes in seconds
      350,
      20.5,
      25.5,
      'desktop',
      'Mozilla/5.0 (Test Browser) AppleWebKit/537.36'
    ]);

    console.log(`  ✅ Reading session created: ${sessionId}`);

    // Retrieve reading sessions
    const sessionsResult = await client.query(`
      SELECT rs.*, b.title as book_title
      FROM reading_sessions rs
      JOIN books b ON rs.book_id = b.id
      WHERE rs.user_id = $1 AND rs.book_id = $2
      ORDER BY rs.start_time DESC
      LIMIT 5
    `, [testUser.id, testBook.id]);

    console.log(`  ✅ Found ${sessionsResult.rows.length} reading session(s):`);
    sessionsResult.rows.forEach((session, index) => {
      const minutes = Math.round(session.duration / 60);
      console.log(`    ${index + 1}. Session ${session.session_id.substring(0, 15)}...`);
      console.log(`       Duration: ${minutes} minutes, Words: ${session.words_read}`);
      console.log(`       Progress: ${session.progress_start}% → ${session.progress_end}%`);
      console.log(`       Device: ${session.device_type}`);
    });

    return true;
  } catch (error) {
    console.error("  ❌ Reading sessions test failed:", error.message);
    return false;
  } finally {
    client.release();
  }
}

async function testAnalyticsViews() {
  console.log("\n📊 Testing Analytics Views...");
  const client = await pool.connect();

  try {
    // Test enhanced reading stats view
    const statsResult = await client.query(`
      SELECT * FROM enhanced_reading_stats
      WHERE books_started > 0 OR total_highlights > 0 OR total_notes > 0
      LIMIT 5
    `);

    console.log(`  ✅ Enhanced Reading Stats View: ${statsResult.rows.length} users with activity`);
    if (statsResult.rows.length > 0) {
      statsResult.rows.forEach((stat, index) => {
        console.log(`    ${index + 1}. ${stat.user_name}: ${stat.books_started} books, ${stat.total_highlights} highlights, ${stat.total_notes} notes`);
      });
    }

    // Test book engagement stats view
    const engagementResult = await client.query(`
      SELECT * FROM book_engagement_stats
      WHERE total_readers > 0
      LIMIT 5
    `);

    console.log(`  ✅ Book Engagement Stats View: ${engagementResult.rows.length} books with engagement`);
    if (engagementResult.rows.length > 0) {
      engagementResult.rows.forEach((book, index) => {
        console.log(`    ${index + 1}. ${book.title}: ${book.total_readers} readers, ${book.total_highlights} highlights`);
      });
    }

    // Test user reading summary view
    const summaryResult = await client.query(`
      SELECT * FROM user_reading_summary
      WHERE books_started > 0 OR total_highlights > 0 OR total_notes > 0
      LIMIT 5
    `);

    console.log(`  ✅ User Reading Summary View: ${summaryResult.rows.length} users with reading activity`);

    return true;
  } catch (error) {
    console.error("  ❌ Analytics views test failed:", error.message);
    return false;
  } finally {
    client.release();
  }
}

async function testBookAccess() {
  console.log("\n🔐 Testing Book Access Logging...");
  const client = await pool.connect();

  try {
    const testUser = await getTestUser();
    const testBook = await getTestBook();

    // Log book access
    await client.query(`
      INSERT INTO book_access_logs (user_id, book_id, access_type, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      testUser.id,
      testBook.id,
      'read',
      '192.168.1.100',
      'Mozilla/5.0 (Test Browser) AppleWebKit/537.36'
    ]);

    console.log("  ✅ Book access logged");

    // Retrieve access logs
    const logsResult = await client.query(`
      SELECT bal.*, b.title as book_title, u.username
      FROM book_access_logs bal
      JOIN books b ON bal.book_id = b.id
      JOIN users u ON bal.user_id = u.id
      WHERE bal.user_id = $1 AND bal.book_id = $2
      ORDER BY bal.accessed_at DESC
      LIMIT 5
    `, [testUser.id, testBook.id]);

    console.log(`  ✅ Found ${logsResult.rows.length} access log(s):`);
    logsResult.rows.forEach((log, index) => {
      console.log(`    ${index + 1}. ${log.username} accessed "${log.book_title}"`);
      console.log(`       Type: ${log.access_type}, IP: ${log.ip_address}`);
      console.log(`       Time: ${log.accessed_at}`);
    });

    return true;
  } catch (error) {
    console.error("  ❌ Book access logging test failed:", error.message);
    return false;
  } finally {
    client.release();
  }
}

async function runAllTests() {
  console.log("🧪 Starting E-Reader Functionality Tests");
  console.log("=========================================");

  try {
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error("Database connection failed");
    }

    const tests = [
      { name: "Reader Settings", fn: testReaderSettings },
      { name: "Reading Progress", fn: testReadingProgress },
      { name: "Highlights", fn: testHighlights },
      { name: "Notes", fn: testNotes },
      { name: "Reading Sessions", fn: testReadingSessions },
      { name: "Analytics Views", fn: testAnalyticsViews },
      { name: "Book Access Logging", fn: testBookAccess }
    ];

    const results = [];

    for (const test of tests) {
      try {
        const success = await test.fn();
        results.push({ name: test.name, success });
      } catch (error) {
        console.error(`❌ Test "${test.name}" failed:`, error.message);
        results.push({ name: test.name, success: false, error: error.message });
      }
    }

    // Summary
    console.log("\n📋 Test Results Summary:");
    console.log("=========================");

    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    results.forEach(result => {
      const status = result.success ? "✅ PASS" : "❌ FAIL";
      console.log(`${status} ${result.name}`);
      if (!result.success && result.error) {
        console.log(`     Error: ${result.error}`);
      }
    });

    console.log(`\n🎯 Results: ${passed} passed, ${failed} failed`);

    if (failed === 0) {
      console.log("\n🎉 All E-Reader functionality tests passed!");
      console.log("Your e-reader system is working correctly.");
    } else {
      console.log("\n⚠️  Some tests failed. Please check the errors above.");
    }

  } catch (error) {
    console.error("💥 Test suite failed:", error.message);
  } finally {
    await pool.end();
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests()
    .then(() => {
      console.log("\n✨ E-Reader functionality testing completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Testing failed:", error.message);
      process.exit(1);
    });
}

module.exports = { runAllTests, testConnection };
