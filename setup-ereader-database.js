const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Database configuration - using provided credentials with fallbacks
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "149.102.159.118",
  database: process.env.DB_NAME || "postgres",
  password:
    process.env.DB_PASSWORD ||
    "6c8u2MsYqlbQxL5IxftjrV7QQnlLymdsmzMtTeIe4Ur1od7RR9CdODh3VfQ4ka2f",
  port: parseInt(process.env.DB_PORT || "5432"),
  // SSL is disabled for the new database since it doesn't support it
  ssl: false,
});

async function setupEReaderDatabase() {
  const client = await pool.connect();

  try {
    console.log("🚀 Setting up E-Reader database tables...");

    // Read the SQL file
    const sqlPath = path.join(__dirname, "create-ereader-tables.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Execute the full SQL script
    console.log("Executing e-reader database setup script...");
    await client.query(sql);

    console.log("✅ E-Reader database tables created successfully!");

    // Verify tables were created
    const tables = [
      "reading_progress",
      "highlights",
      "notes",
      "reading_sessions",
      "reading_analytics",
      "reader_settings",
      "book_access_logs",
    ];

    console.log("\n📊 Verifying table creation...");

    for (const table of tables) {
      try {
        const result = await client.query(
          `
          SELECT COUNT(*) as count
          FROM information_schema.tables
          WHERE table_name = $1
        `,
          [table],
        );

        if (result.rows[0].count > 0) {
          console.log(`✅ Table '${table}' created successfully`);
        } else {
          console.log(`❌ Table '${table}' was not created`);
        }
      } catch (error) {
        console.log(`❌ Error checking table '${table}':`, error.message);
      }
    }

    // Check if we have any existing users to create default settings for
    const usersResult = await client.query(
      "SELECT COUNT(*) as count FROM users",
    );
    const userCount = parseInt(usersResult.rows[0].count);

    if (userCount > 0) {
      console.log(
        `\n👥 Found ${userCount} existing users. Creating default reader settings...`,
      );

      await client.query(`
        INSERT INTO reader_settings (user_id)
        SELECT id FROM users
        WHERE NOT EXISTS (
          SELECT 1 FROM reader_settings
          WHERE reader_settings.user_id = users.id
        )
      `);

      const settingsResult = await client.query(
        "SELECT COUNT(*) as count FROM reader_settings",
      );
      console.log(
        `✅ Reader settings created for ${settingsResult.rows[0].count} users`,
      );
    }

    console.log("\n🎉 E-Reader database setup completed successfully!");
    console.log("\nAvailable tables:");
    console.log("- reading_progress: Track user reading progress");
    console.log("- highlights: Store user text highlights");
    console.log("- notes: Store user notes and annotations");
    console.log("- reading_sessions: Track reading sessions for analytics");
    console.log("- reading_analytics: Daily/weekly/monthly reading statistics");
    console.log("- reader_settings: User preferences and settings");
    console.log("- book_access_logs: Security and access logging");

    console.log("\nViews created:");
    console.log("- reading_stats_view: User reading statistics summary");
    console.log(
      "- book_popularity_view: Book popularity and engagement metrics",
    );
  } catch (error) {
    console.error("❌ Error setting up E-Reader database:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupEReaderDatabase()
    .then(() => {
      console.log("\n✨ Database setup completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Database setup failed:", error);
      process.exit(1);
    });
}

module.exports = { setupEReaderDatabase };
