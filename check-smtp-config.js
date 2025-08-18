const { query } = require('./utils/database');

async function checkSMTPConfig() {
  try {
    console.log('🔍 Checking SMTP Configuration...\n');

    // Get all email gateway settings
    const result = await query(`
      SELECT 
        setting_key,
        setting_value
      FROM system_settings 
      WHERE setting_key LIKE 'email_gateway_%'
      ORDER BY setting_key
    `);

    console.log('📧 Email Gateway Settings:');
    result.rows.forEach(row => {
      console.log(`  - ${row.setting_key}: ${row.setting_value}`);
    });

    // Get active gateway
    const activeGatewayResult = await query(`
      SELECT setting_value FROM system_settings 
      WHERE setting_key = 'email_gateway_active'
    `);
    
    const activeGateway = activeGatewayResult.rows[0]?.setting_value || 'resend';
    console.log(`\n🎯 Active Gateway: ${activeGateway}`);

    // Check SMTP specific settings
    const smtpSettings = result.rows.filter(row => row.setting_key.startsWith('email_gateway_smtp_'));
    
    if (smtpSettings.length > 0) {
      console.log('\n📮 SMTP Configuration:');
      smtpSettings.forEach(row => {
        const field = row.setting_key.replace('email_gateway_smtp_', '');
        console.log(`  - ${field}: ${row.setting_value}`);
      });
    }

    // Check if SMTP is active
    const smtpActive = result.rows.find(row => row.setting_key === 'email_gateway_smtp_is_active');
    console.log(`\n✅ SMTP Active: ${smtpActive?.setting_value === 'true' ? 'Yes' : 'No'}`);

    // Test SMTP connection if configured
    if (smtpActive?.setting_value === 'true') {
      console.log('\n🧪 Testing SMTP Connection...');
      
      const smtpConfig = {
        host: result.rows.find(row => row.setting_key === 'email_gateway_smtp_host')?.setting_value,
        port: parseInt(result.rows.find(row => row.setting_key === 'email_gateway_smtp_port')?.setting_value) || 587,
        secure: result.rows.find(row => row.setting_key === 'email_gateway_smtp_secure')?.setting_value === 'true',
        username: result.rows.find(row => row.setting_key === 'email_gateway_smtp_username')?.setting_value,
        password: result.rows.find(row => row.setting_key === 'email_gateway_smtp_password')?.setting_value,
      };

      console.log('SMTP Config:', {
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        username: smtpConfig.username,
        password: smtpConfig.password ? '***' : 'Not set'
      });

      // Test SMTP connection
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
          user: smtpConfig.username,
          pass: smtpConfig.password,
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
      });

      try {
        console.log('Testing SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection successful!');
        
        // Test sending email
        console.log('Testing SMTP email sending...');
        const info = await transporter.sendMail({
          from: 'noreply@readnwin.com',
          to: 'test@example.com',
          subject: 'SMTP Test Email',
          text: 'This is a test email sent via SMTP',
          html: '<h1>SMTP Test Email</h1><p>This is a test email sent via SMTP</p>'
        });
        
        console.log('✅ SMTP email sent successfully!');
        console.log('Message ID:', info.messageId);
        
      } catch (error) {
        console.log('❌ SMTP test failed:', error.message);
      }
    } else {
      console.log('\n⚠️ SMTP is not active. To test SMTP, set email_gateway_smtp_is_active to true');
    }

  } catch (error) {
    console.error('Error checking SMTP config:', error);
  } finally {
    process.exit(0);
  }
}

checkSMTPConfig(); 