const { query } = require('../utils/database');

async function debugEmailIssue() {
  try {
    console.log('🔍 Debugging Email Issue for New User Registration...\n');

    // 1. Check email gateway configuration
    console.log('1. Checking Email Gateway Configuration...');
    const gatewayConfig = await query(`
      SELECT setting_key, setting_value 
      FROM system_settings 
      WHERE setting_key LIKE 'email_gateway_%'
      ORDER BY setting_key
    `);

    console.log(`Found ${gatewayConfig.rows.length} email gateway settings:`);
    gatewayConfig.rows.forEach(row => {
      console.log(`  - ${row.setting_key}: ${row.setting_value}`);
    });

    // 2. Check if welcome email template exists
    console.log('\n2. Checking Welcome Email Template...');
    const welcomeTemplate = await query(`
      SELECT id, name, slug, is_active, subject 
      FROM email_templates 
      WHERE slug = 'welcome'
    `);

    if (welcomeTemplate.rows.length > 0) {
      const template = welcomeTemplate.rows[0];
      console.log(`✅ Welcome template found: ${template.name} (ID: ${template.id})`);
      console.log(`   Active: ${template.is_active}`);
      console.log(`   Subject: ${template.subject}`);
    } else {
      console.log('❌ Welcome email template not found!');
    }

    // 3. Check if welcome email function exists
    console.log('\n3. Checking Welcome Email Function...');
    const welcomeFunction = await query(`
      SELECT id, name, slug, is_active 
      FROM email_functions 
      WHERE slug = 'welcome'
    `);

    if (welcomeFunction.rows.length > 0) {
      const func = welcomeFunction.rows[0];
      console.log(`✅ Welcome function found: ${func.name} (ID: ${func.id})`);
      console.log(`   Active: ${func.is_active}`);
    } else {
      console.log('❌ Welcome email function not found!');
    }

    // 4. Check function assignment
    console.log('\n4. Checking Function Assignment...');
    const assignment = await query(`
      SELECT efa.*, ef.name as function_name, et.name as template_name
      FROM email_function_assignments efa
      JOIN email_functions ef ON efa.function_id = ef.id
      JOIN email_templates et ON efa.template_id = et.id
      WHERE ef.slug = 'welcome'
    `);

    if (assignment.rows.length > 0) {
      const assign = assignment.rows[0];
      console.log(`✅ Function assignment found:`);
      console.log(`   Function: ${assign.function_name} (ID: ${assign.function_id})`);
      console.log(`   Template: ${assign.template_name} (ID: ${assign.template_id})`);
      console.log(`   Active: ${assign.is_active}`);
      console.log(`   Priority: ${assign.priority}`);
    } else {
      console.log('❌ No function assignment found for welcome email!');
    }

    // 5. Check recent user registrations
    console.log('\n5. Checking Recent User Registrations...');
    const recentUsers = await query(`
      SELECT id, email, first_name, last_name, created_at, welcome_email_sent
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    console.log(`Found ${recentUsers.rows.length} recent users:`);
    recentUsers.rows.forEach(user => {
      console.log(`  - ${user.first_name} ${user.last_name} (${user.email})`);
      console.log(`    Created: ${user.created_at}`);
      console.log(`    Welcome email sent: ${user.welcome_email_sent}`);
    });

    // 6. Check double opt-in setting
    console.log('\n6. Checking Double Opt-in Setting...');
    const doubleOptIn = await query(`
      SELECT setting_value 
      FROM system_settings 
      WHERE setting_key = 'registration_double_opt_in'
    `);

    if (doubleOptIn.rows.length > 0) {
      console.log(`Double opt-in enabled: ${doubleOptIn.rows[0].setting_value}`);
    } else {
      console.log('❌ Double opt-in setting not found!');
    }

    // 7. Test email sending capability
    console.log('\n7. Testing Email Sending Capability...');
    
    // Check if Resend API key is configured
    const resendApiKey = await query(`
      SELECT setting_value 
      FROM system_settings 
      WHERE setting_key = 'email_gateway_resend_api_key'
    `);

    if (resendApiKey.rows.length > 0 && resendApiKey.rows[0].setting_value) {
      console.log('✅ Resend API key is configured');
    } else {
      console.log('❌ Resend API key is not configured');
    }

    // Check if SMTP is configured
    const smtpActive = await query(`
      SELECT setting_value 
      FROM system_settings 
      WHERE setting_key = 'email_gateway_smtp_is_active'
    `);

    if (smtpActive.rows.length > 0 && smtpActive.rows[0].setting_value === 'true') {
      console.log('✅ SMTP is active');
      
      const smtpConfig = await query(`
        SELECT setting_key, setting_value 
        FROM system_settings 
        WHERE setting_key LIKE 'email_gateway_smtp_%'
        AND setting_key != 'email_gateway_smtp_is_active'
      `);
      
      console.log('SMTP Configuration:');
      smtpConfig.rows.forEach(row => {
        console.log(`  - ${row.setting_key}: ${row.setting_value}`);
      });
    } else {
      console.log('❌ SMTP is not active');
    }

    console.log('\n🔍 Email Issue Diagnosis Complete!');
    console.log('\nPossible Issues:');
    console.log('1. Email gateway not properly configured');
    console.log('2. Welcome email template not assigned to function');
    console.log('3. Double opt-in enabled but verification email not sent');
    console.log('4. Email service (Resend/SMTP) not working');
    console.log('5. Environment variables not set correctly');

  } catch (error) {
    console.error('❌ Error during email debugging:', error);
  } finally {
    await query('SELECT 1'); // Keep connection alive
    process.exit(0);
  }
}

debugEmailIssue(); 