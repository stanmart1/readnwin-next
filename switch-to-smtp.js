const { query } = require('./utils/database');

async function switchToSMTP() {
  try {
    console.log('🔄 Switching email gateway to SMTP...\n');

    // Update active gateway to smtp
    await query(`
      UPDATE system_settings 
      SET setting_value = 'smtp', updated_at = NOW()
      WHERE setting_key = 'email_gateway_active'
    `);

    // Set SMTP as active
    await query(`
      UPDATE system_settings 
      SET setting_value = 'true', updated_at = NOW()
      WHERE setting_key = 'email_gateway_smtp_is_active'
    `);

    // Set Resend as inactive
    await query(`
      UPDATE system_settings 
      SET setting_value = 'false', updated_at = NOW()
      WHERE setting_key = 'email_gateway_resend_is_active'
    `);

    console.log('✅ Email gateway switched to SMTP successfully!');

    // Verify the change
    const activeGatewayResult = await query(`
      SELECT setting_value FROM system_settings 
      WHERE setting_key = 'email_gateway_active'
    `);
    
    const smtpActiveResult = await query(`
      SELECT setting_value FROM system_settings 
      WHERE setting_key = 'email_gateway_smtp_is_active'
    `);

    console.log(`🎯 Active Gateway: ${activeGatewayResult.rows[0]?.setting_value}`);
    console.log(`📧 SMTP Active: ${smtpActiveResult.rows[0]?.setting_value === 'true' ? 'Yes' : 'No'}`);

  } catch (error) {
    console.error('Error switching to SMTP:', error);
  } finally {
    process.exit(0);
  }
}

switchToSMTP(); 