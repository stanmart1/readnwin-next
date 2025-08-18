const { query } = require('./database');
require('dotenv').config({ path: '.env.local' });

async function setupEmailGateway() {
  try {
    console.log('🔄 Setting up Email Gateway Configuration...\n');

    // Get RESEND_API_KEY from environment
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY not found in .env.local file');
      process.exit(1);
    }

    console.log('✅ Found RESEND_API_KEY in .env.local');

    // Check if system_settings table exists
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'system_settings'
      )
    `);

    if (!tableExists.rows[0].exists) {
      console.log('1. Creating system_settings table...');
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
      console.log('   ✅ system_settings table created');
    } else {
      console.log('1. system_settings table already exists');
    }

    // Insert or update email gateway settings
    console.log('2. Configuring email gateway settings...');
    
    const emailSettings = [
      ['email_gateway_active', 'resend', 'Active email gateway (resend or smtp)'],
      ['email_gateway_resend_is_active', 'true', 'Whether Resend gateway is active'],
      ['email_gateway_resend_api_key', resendApiKey, 'Resend API key'],
      ['email_gateway_resend_from_email', 'noreply@readnwin.com', 'Default from email for Resend'],
      ['email_gateway_resend_from_name', 'ReadnWin', 'Default from name for Resend'],
      ['email_gateway_resend_domain', 'readnwin.com', 'Domain for Resend'],
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

    for (const [key, value, description] of emailSettings) {
      await query(`
        INSERT INTO system_settings (setting_key, setting_value, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (setting_key) 
        DO UPDATE SET setting_value = $2, description = $3, updated_at = NOW()
      `, [key, value, description]);
    }

    console.log('   ✅ Email gateway settings configured');

    // Verify configuration
    console.log('3. Verifying configuration...');
    const configResult = await query(`
      SELECT setting_key, setting_value 
      FROM system_settings 
      WHERE setting_key LIKE 'email_gateway_%'
      ORDER BY setting_key
    `);

    console.log('   📋 Current email gateway configuration:');
    configResult.rows.forEach(row => {
      if (row.setting_key.includes('api_key')) {
        console.log(`   ${row.setting_key}: ${row.setting_value.substring(0, 10)}...`);
      } else {
        console.log(`   ${row.setting_key}: ${row.setting_value}`);
      }
    });

    console.log('\n✅ Email Gateway Configuration Complete!');
    console.log('📧 Resend is now configured as the active email gateway');
    console.log('🔑 API Key has been securely stored in the database');

  } catch (error) {
    console.error('❌ Error setting up email gateway:', error);
    process.exit(1);
  }
}

// Run the setup
setupEmailGateway(); 