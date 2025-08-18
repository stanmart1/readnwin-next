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

async function initEmailSettings() {
  try {
    console.log('Initializing email gateway settings...');

    // Insert default email gateway settings
    const defaultSettings = [
      ['email_gateway_active', 'resend', 'Active email gateway (resend or smtp)'],
      ['email_gateway_resend_is_active', 'true', 'Whether Resend gateway is active'],
      ['email_gateway_resend_from_email', 'noreply@readnwin.com', 'Default from email for Resend'],
      ['email_gateway_resend_from_name', 'ReadnWin', 'Default from name for Resend'],
      ['email_gateway_resend_domain', 'readnwin.com', 'Domain for Resend'],
      ['email_gateway_resend_api_key', '', 'Resend API key'],
      ['email_gateway_smtp_is_active', 'false', 'Whether SMTP gateway is active'],
      ['email_gateway_smtp_from_email', 'noreply@readnwin.com', 'Default from email for SMTP'],
      ['email_gateway_smtp_from_name', 'ReadnWin', 'Default from name for SMTP'],
      ['email_gateway_smtp_host', 'smtp.gmail.com', 'SMTP host'],
      ['email_gateway_smtp_port', '587', 'SMTP port'],
      ['email_gateway_smtp_username', '', 'SMTP username'],
      ['email_gateway_smtp_password', '', 'SMTP password'],
      ['email_gateway_smtp_secure', 'false', 'Whether to use SSL/TLS for SMTP'],
      ['registration_double_opt_in', 'true', 'Require email verification for new user registrations']
    ];

    for (const [key, value, description] of defaultSettings) {
      await query(`
        INSERT INTO system_settings (setting_key, setting_value, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (setting_key) 
        DO UPDATE SET setting_value = $2, description = $3, updated_at = NOW()
      `, [key, value, description]);
    }

    console.log('Email gateway settings initialized successfully!');
  } catch (error) {
    console.error('Error initializing email settings:', error);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  initEmailSettings().then(() => {
    console.log('Initialization complete');
    process.exit(0);
  }).catch((error) => {
    console.error('Initialization failed:', error);
    process.exit(1);
  });
}

module.exports = { initEmailSettings }; 