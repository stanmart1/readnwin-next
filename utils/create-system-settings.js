const { Pool } = require('pg');

// Database configuration for Aiven Cloud PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'avnadmin',
  host: process.env.DB_HOST || 'readnwin-nextjs-book-nextjs.b.aivencloud.com',
  database: process.env.DB_NAME || 'defaultdb',
  password: process.env.DB_PASSWORD || 'AVNS_Xv38UAMF77xN--vUfeX',
  port: parseInt(process.env.DB_PORT || '28428'),
  ssl: {
    rejectUnauthorized: false,
    ca: process.env.DB_CA_CERT, // Add CA certificate if provided
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Increased timeout for cloud connections
  statement_timeout: 30000, // 30 second statement timeout
});

// Helper function to execute a query
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('✅ Executed query', { text: text.substring(0, 50) + '...', duration, rows: res.rowCount });
    return res;
  } catch (error) {
    const duration = Date.now() - start;
    console.error('❌ Query failed', { text: text.substring(0, 50) + '...', duration, error: error.message });
    throw error;
  }
}

async function createSystemSettingsTable() {
  try {
    console.log('Creating system_settings table...');

    // Create the system_settings table
    await query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(255) UNIQUE NOT NULL,
        setting_value TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index
    await query(`
      CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key)
    `);

    console.log('System settings table created successfully!');
  } catch (error) {
    console.error('Error creating system settings table:', error);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  createSystemSettingsTable().then(() => {
    console.log('Table creation complete');
    process.exit(0);
  }).catch((error) => {
    console.error('Table creation failed:', error);
    process.exit(1);
  });
}

module.exports = { createSystemSettingsTable }; 