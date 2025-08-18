const { query } = require('./utils/database');

async function updateResendKey() {
  try {
    console.log('🔄 Updating Resend API key...\n');

    const correctApiKey = 're_iZPZgHqW_6Xk7zMMqUGMY7hWFcj8DVge6'; // From .env files
    
    console.log('Current API key:', correctApiKey.substring(0, 10) + '...');

    // Update Resend API key
    await query(`
      UPDATE system_settings 
      SET setting_value = $1, updated_at = NOW()
      WHERE setting_key = 'email_gateway_resend_api_key'
    `, [correctApiKey]);

    console.log('✅ Resend API key updated successfully!');

    // Verify the change
    const result = await query(`
      SELECT setting_value FROM system_settings 
      WHERE setting_key = 'email_gateway_resend_api_key'
    `);
    
    console.log('Updated API key in database:', result.rows[0]?.setting_value.substring(0, 10) + '...');

  } catch (error) {
    console.error('Error updating Resend API key:', error);
  } finally {
    process.exit(0);
  }
}

updateResendKey(); 