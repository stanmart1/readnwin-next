#!/usr/bin/env node

/**
 * Test Welcome Email Function
 * This script tests the welcome email function to ensure it works properly
 */

require('dotenv').config({ path: '.env.local' });
const { sendWelcomeEmail } = require('../utils/email');

async function testWelcomeEmail() {
  try {
    console.log('🧪 Testing Welcome Email Function...\n');

    const testEmail = 'adelodunpeter69@gmail.com';
    const testUserName = 'Adelodun Peter';

    console.log(`📧 Sending welcome email to: ${testEmail}`);
    console.log(`👤 User name: ${testUserName}`);

    const result = await sendWelcomeEmail(testEmail, testUserName);

    console.log('\n📋 Test Results:');
    console.log('Success:', result.success);
    
    if (result.success) {
      console.log('✅ Welcome email sent successfully!');
      console.log('📊 Email data:', JSON.stringify(result.data, null, 2));
    } else {
      console.log('❌ Failed to send welcome email');
      console.log('🔍 Error details:', result.error);
    }

    // Test with a different email to ensure it works
    console.log('\n🧪 Testing with another email...');
    const result2 = await sendWelcomeEmail('test@example.com', 'Test User');
    
    if (result2.success) {
      console.log('✅ Second test email sent successfully!');
    } else {
      console.log('❌ Second test failed:', result2.error);
    }

  } catch (error) {
    console.error('❌ Error testing welcome email:', error);
  } finally {
    process.exit(0);
  }
}

testWelcomeEmail(); 