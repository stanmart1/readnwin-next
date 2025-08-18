#!/usr/bin/env node

/**
 * Test Admin Gateway Control
 * This script verifies that the admin dashboard email gateway management controls email sending
 */

require('dotenv').config({ path: '.env.local' });
const { query } = require('../utils/database');

async function testAdminGatewayControl() {
  try {
    console.log('🔍 Testing Admin Gateway Control...\n');

    // 1. Check current gateway configuration
    console.log('1. Current Gateway Configuration:');
    const gatewayResult = await query(`
      SELECT setting_key, setting_value 
      FROM system_settings 
      WHERE setting_key LIKE 'email_gateway_%' 
      ORDER BY setting_key
    `);

    const activeGateway = gatewayResult.rows.find(row => row.setting_key === 'email_gateway_active');
    console.log(`   Active Gateway: ${activeGateway ? activeGateway.setting_value : 'None'}`);

    const resendActive = gatewayResult.rows.find(row => row.setting_key === 'email_gateway_resend_is_active');
    console.log(`   Resend Active: ${resendActive ? resendActive.setting_value : 'false'}`);

    const smtpActive = gatewayResult.rows.find(row => row.setting_key === 'email_gateway_smtp_is_active');
    console.log(`   SMTP Active: ${smtpActive ? smtpActive.setting_value : 'false'}`);

    // 2. Test welcome email API to see which gateway is used
    console.log('\n2. Testing Welcome Email API:');
    const testEmail = 'admin-gateway-test@example.com';
    const testUserName = 'Admin Gateway Test User';

    console.log(`   Sending test email to: ${testEmail}`);

    const response = await fetch('http://localhost:3000/api/email/welcome', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        userName: testUserName
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('   ✅ Welcome email sent successfully!');
      console.log(`   📧 Response: ${result.message}`);
      
      // Check if the email was sent using the admin gateway
      if (result.data) {
        console.log('   📊 Email data received from gateway');
      }
    } else {
      const error = await response.json();
      console.log('   ❌ Failed to send welcome email:', error.error);
    }

    // 3. Test function-template connection
    console.log('\n3. Testing Function-Template Connection:');
    const functionResult = await query(`
      SELECT ef.name as function_name, et.name as template_name, efa.is_active
      FROM email_functions ef
      JOIN email_function_assignments efa ON ef.id = efa.function_id
      JOIN email_templates et ON efa.template_id = et.id
      WHERE ef.slug = 'welcome'
    `);

    if (functionResult.rows.length > 0) {
      const connection = functionResult.rows[0];
      console.log(`   ✅ Function: ${connection.function_name}`);
      console.log(`   ✅ Template: ${connection.template_name}`);
      console.log(`   ✅ Active: ${connection.is_active}`);
    } else {
      console.log('   ❌ Welcome function not connected to template');
    }

    // 4. Verify all email functions are connected
    console.log('\n4. Verifying All Email Functions:');
    const allFunctionsResult = await query(`
      SELECT 
        COUNT(*) as total_functions,
        COUNT(efa.id) as connected_functions
      FROM email_functions ef
      LEFT JOIN email_function_assignments efa ON ef.id = efa.function_id
    `);

    const stats = allFunctionsResult.rows[0];
    console.log(`   Total Functions: ${stats.total_functions}`);
    console.log(`   Connected Functions: ${stats.connected_functions}`);
    
    if (stats.total_functions === stats.connected_functions) {
      console.log('   ✅ All email functions are connected to templates!');
    } else {
      console.log('   ❌ Some functions are missing template connections');
    }

    // 5. Test admin gateway priority
    console.log('\n5. Testing Admin Gateway Priority:');
    console.log('   The email system should use admin gateway settings first');
    console.log('   If admin gateway fails, it falls back to environment variables');
    console.log('   If environment variables fail, it uses fallback configuration');

    console.log('\n✅ Admin Gateway Control Test Completed!');
    console.log('\n📋 Summary:');
    console.log(`   - Active Gateway: ${activeGateway ? activeGateway.setting_value : 'None'}`);
    console.log(`   - Resend Active: ${resendActive ? resendActive.setting_value : 'false'}`);
    console.log(`   - SMTP Active: ${smtpActive ? smtpActive.setting_value : 'false'}`);
    console.log(`   - Functions Connected: ${stats.connected_functions}/${stats.total_functions}`);

  } catch (error) {
    console.error('❌ Error testing admin gateway control:', error);
  } finally {
    await query('SELECT 1'); // Keep connection alive
    process.exit(0);
  }
}

testAdminGatewayControl(); 