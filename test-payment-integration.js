// Test script to verify payment gateway integration
// This script tests if admin-configured Flutterwave parameters are properly loaded

const { Pool } = require('pg');

async function testPaymentGatewayIntegration() {
  console.log('🔍 Testing Payment Gateway Integration...\n');

  // Database configuration
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: false,
  });

  const client = await pool.connect();
  
  try {
    // Test 1: Check if payment_gateways table exists and has data
    console.log('✅ Test 1: Checking payment_gateways table...');
    const gatewayResult = await client.query('SELECT * FROM payment_gateways');
    console.log(`   Found ${gatewayResult.rows.length} payment gateways`);
    
    if (gatewayResult.rows.length > 0) {
      gatewayResult.rows.forEach(gateway => {
        console.log(`   - ${gateway.name} (${gateway.gateway_id}): ${gateway.enabled ? 'Enabled' : 'Disabled'}`);
        console.log(`     Test Mode: ${gateway.test_mode ? 'Yes' : 'No'}`);
        console.log(`     Has Public Key: ${gateway.public_key ? 'Yes' : 'No'}`);
        console.log(`     Has Secret Key: ${gateway.secret_key ? 'Yes' : 'No'}`);
        console.log(`     Has Hash: ${gateway.hash ? 'Yes' : 'No'}`);
        console.log(`     Status: ${gateway.status}`);
        console.log('');
      });
    }

    // Test 2: Check Flutterwave configuration specifically
    console.log('✅ Test 2: Checking Flutterwave configuration...');
    const flutterwaveResult = await client.query(
      'SELECT * FROM payment_gateways WHERE gateway_id = $1',
      ['flutterwave']
    );
    
    if (flutterwaveResult.rows.length > 0) {
      const flutterwave = flutterwaveResult.rows[0];
      console.log('   Flutterwave Configuration:');
      console.log(`   - Enabled: ${flutterwave.enabled}`);
      console.log(`   - Test Mode: ${flutterwave.test_mode}`);
      console.log(`   - Public Key: ${flutterwave.public_key ? 'Configured' : 'Missing'}`);
      console.log(`   - Secret Key: ${flutterwave.secret_key ? 'Configured' : 'Missing'}`);
      console.log(`   - Hash: ${flutterwave.hash ? 'Configured' : 'Missing'}`);
      console.log(`   - Status: ${flutterwave.status}`);
      
      // Test if keys are properly formatted
      if (flutterwave.public_key && flutterwave.public_key.startsWith('FLWPUBK-')) {
        console.log('   ✅ Public key format looks correct');
      } else if (flutterwave.public_key) {
        console.log('   ⚠️  Public key format may be incorrect');
      }
      
      if (flutterwave.secret_key && flutterwave.secret_key.startsWith('FLWSECK-')) {
        console.log('   ✅ Secret key format looks correct');
      } else if (flutterwave.secret_key) {
        console.log('   ⚠️  Secret key format may be incorrect');
      }
    } else {
      console.log('   ❌ Flutterwave configuration not found');
    }

    // Test 3: Check payment_settings table
    console.log('\n✅ Test 3: Checking payment settings...');
    const settingsResult = await client.query('SELECT * FROM payment_settings');
    console.log(`   Found ${settingsResult.rows.length} payment settings`);
    
    if (settingsResult.rows.length > 0) {
      settingsResult.rows.forEach(setting => {
        console.log(`   - ${setting.setting_key}: ${setting.setting_value}`);
      });
    }

    console.log('\n🎉 Payment Gateway Integration Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the test
testPaymentGatewayIntegration().catch(console.error);