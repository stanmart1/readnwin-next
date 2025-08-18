const { query } = require('./utils/database');

async function switchToResend() {
  try {
    console.log('🔄 Switching email gateway to Resend...\n');

    // Update active gateway to resend
    await query(`
      UPDATE system_settings 
      SET setting_value = 'resend', updated_at = NOW()
      WHERE setting_key = 'email_gateway_active'
    `);

    // Set Resend as active
    await query(`
      UPDATE system_settings 
      SET setting_value = 'true', updated_at = NOW()
      WHERE setting_key = 'email_gateway_resend_is_active'
    `);

    // Set SMTP as inactive
    await query(`
      UPDATE system_settings 
      SET setting_value = 'false', updated_at = NOW()
      WHERE setting_key = 'email_gateway_smtp_is_active'
    `);

    console.log('✅ Email gateway switched to Resend successfully!');

    // Verify the change
    const activeGatewayResult = await query(`
      SELECT setting_value FROM system_settings 
      WHERE setting_key = 'email_gateway_active'
    `);
    
    const resendActiveResult = await query(`
      SELECT setting_value FROM system_settings 
      WHERE setting_key = 'email_gateway_resend_is_active'
    `);

    console.log(`🎯 Active Gateway: ${activeGatewayResult.rows[0]?.setting_value}`);
    console.log(`📧 Resend Active: ${resendActiveResult.rows[0]?.setting_value === 'true' ? 'Yes' : 'No'}`);

  } catch (error) {
    console.error('Error switching to Resend:', error);
  } finally {
    process.exit(0);
  }
}

switchToResend(); 