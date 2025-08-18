// Debug script to test email gateway save functionality
const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || '149.102.159.118',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'S48lyoqo1mX7ytoiBvDZfCBB4TiCcGIU1rEdpu0NfBFP3V9q426PKDkGmV8aMD8b',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false, // SSL is disabled for the new database
});

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

async function debugEmailSave() {
  try {
    console.log('🔍 Debugging email gateway save functionality...\n');

    // 1. Check current settings
    console.log('1. Current email gateway settings:');
    const currentSettings = await query(`
      SELECT setting_key, setting_value 
      FROM system_settings 
      WHERE setting_key LIKE 'email_gateway_%'
      ORDER BY setting_key
    `);
    
    console.log('Current settings:', currentSettings.rows);
    console.log('');

    // 2. Test updating fromEmail for Resend
    console.log('2. Testing update of fromEmail for Resend:');
    const testFromEmail = 'test@example.com';
    
    await query(`
      INSERT INTO system_settings (setting_key, setting_value, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (setting_key) 
      DO UPDATE SET setting_value = $2, updated_at = NOW()
    `, ['email_gateway_resend_from_email', testFromEmail]);

    console.log(`Updated fromEmail to: ${testFromEmail}`);
    console.log('');

    // 3. Verify the update
    console.log('3. Verifying the update:');
    const updatedSettings = await query(`
      SELECT setting_key, setting_value 
      FROM system_settings 
      WHERE setting_key = 'email_gateway_resend_from_email'
    `);
    
    console.log('Updated setting:', updatedSettings.rows[0]);
    console.log('');

    // 4. Test the full gateway update process
    console.log('4. Testing full gateway update process:');
    const testGateways = [
      {
        id: 'resend',
        name: 'Resend',
        type: 'resend',
        isActive: true,
        fromEmail: 'newtest@example.com',
        fromName: 'ReadnWin Test',
        resendApiKey: 'test_key_123',
        resendDomain: 'test.com'
      },
      {
        id: 'smtp',
        name: 'SMTP Server',
        type: 'smtp',
        isActive: false,
        fromEmail: 'smtp@example.com',
        fromName: 'ReadnWin SMTP',
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUsername: 'test@gmail.com',
        smtpPassword: 'test_password',
        smtpSecure: false
      }
    ];

    const activeGateway = 'resend';

    // Update active gateway
    await query(`
      INSERT INTO system_settings (setting_key, setting_value, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (setting_key) 
      DO UPDATE SET setting_value = $2, updated_at = NOW()
    `, ['email_gateway_active', activeGateway]);

    // Update gateway configurations
    for (const gateway of testGateways) {
      if (gateway.type === 'resend') {
        const resendSettings = [
          ['email_gateway_resend_is_active', gateway.isActive.toString()],
          ['email_gateway_resend_from_email', gateway.fromEmail || ''],
          ['email_gateway_resend_from_name', gateway.fromName || ''],
          ['email_gateway_resend_domain', gateway.resendDomain || ''],
          ['email_gateway_resend_api_key', gateway.resendApiKey || '']
        ];

        for (const [key, value] of resendSettings) {
          await query(`
            INSERT INTO system_settings (setting_key, setting_value, updated_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (setting_key) 
            DO UPDATE SET setting_value = $2, updated_at = NOW()
          `, [key, value]);
        }
      }
    }

    console.log('Full gateway update completed');
    console.log('');

    // 5. Final verification
    console.log('5. Final verification of all settings:');
    const finalSettings = await query(`
      SELECT setting_key, setting_value 
      FROM system_settings 
      WHERE setting_key LIKE 'email_gateway_%'
      ORDER BY setting_key
    `);
    
    console.log('Final settings:', finalSettings.rows);

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await pool.end();
  }
}

// Run the debug
debugEmailSave(); 