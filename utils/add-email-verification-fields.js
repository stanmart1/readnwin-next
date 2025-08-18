const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'avnadmin',
  host: process.env.DB_HOST || 'readnwin-nextjs-book-nextjs.b.aivencloud.com',
  database: process.env.DB_NAME || 'defaultdb',
  password: process.env.DB_PASSWORD || 'AVNS_Xv38UAMF77xN--vUfeX',
  port: parseInt(process.env.DB_PORT || '28428'),
  ssl: {
    rejectUnauthorized: false,
    ca: process.env.DB_CA_CERT,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  statement_timeout: 30000,
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    const start = Date.now();
    const result = await client.query(text, params);
    const duration = Date.now() - start;
    console.log('✅ Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('❌ Query error:', { text, error: error.message });
    throw error;
  } finally {
    client.release();
  }
}

async function addEmailVerificationFields() {
  try {
    console.log('Adding email verification fields to users table...');

    // Add email verification fields if they don't exist
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP,
      ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT FALSE
    `);

    // Add double opt-in setting if it doesn't exist
    await query(`
      INSERT INTO system_settings (setting_key, setting_value, description)
      VALUES ('registration_double_opt_in', 'true', 'Require email verification for new user registrations')
      ON CONFLICT (setting_key) 
      DO UPDATE SET setting_value = 'true', description = 'Require email verification for new user registrations', updated_at = NOW()
    `);

    console.log('✅ Email verification fields added successfully!');
  } catch (error) {
    console.error('❌ Error adding email verification fields:', error);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  addEmailVerificationFields();
}

module.exports = { addEmailVerificationFields }; 