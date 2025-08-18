#!/usr/bin/env node

/**
 * Test Payment Settings API
 * This script tests the payment settings API to verify it's working correctly
 */

require('dotenv').config({ path: '.env.local' });
const { query } = require('../utils/database');

async function testPaymentSettings() {
  try {
    console.log('🧪 Testing Payment Settings API...\n');

    // 1. Check database directly
    console.log('1. Checking Payment Gateways in Database:');
    const gatewaysResult = await query('SELECT * FROM payment_gateways ORDER BY gateway_id');
    console.log(`Found ${gatewaysResult.rows.length} gateways:`);
    
    gatewaysResult.rows.forEach(gateway => {
      console.log(`  - ${gateway.name} (${gateway.gateway_id})`);
      console.log(`    Enabled: ${gateway.enabled}`);
      console.log(`    Test Mode: ${gateway.test_mode}`);
      console.log(`    Status: ${gateway.status}`);
      console.log(`    Public Key: ${gateway.public_key ? 'Set' : 'Not set'}`);
      console.log(`    Secret Key: ${gateway.secret_key ? 'Set' : 'Not set'}`);
      console.log('');
    });

    // 2. Check payment settings
    console.log('2. Checking Payment Settings:');
    const settingsResult = await query('SELECT setting_key, setting_value FROM payment_settings');
    if (settingsResult.rows.length > 0) {
      console.log('Payment Settings:');
      const settingsMap = {};
      settingsResult.rows.forEach(row => {
        try {
          settingsMap[row.setting_key] = JSON.parse(row.setting_value);
        } catch {
          settingsMap[row.setting_key] = row.setting_value;
        }
      });
      
      console.log(`  Default Gateway: ${settingsMap.defaultGateway || settingsMap.default_gateway || 'Not set'}`);
      console.log(`  Supported Gateways: ${settingsMap.supportedGateways || 'Not set'}`);
      console.log(`  Currency: ${settingsMap.currency || settingsMap.default_currency || 'Not set'}`);
      console.log(`  Tax Rate: ${settingsMap.taxRate || 'Not set'}%`);
      console.log(`  Shipping Cost: ₦${settingsMap.shippingCost || 'Not set'}`);
      console.log(`  Free Shipping Threshold: ₦${settingsMap.freeShippingThreshold || 'Not set'}`);
      console.log(`  Test Mode: ${settingsMap.testMode || 'Not set'}`);
    } else {
      console.log('  No payment settings found');
    }

    // 3. Test API endpoint (if server is running)
    console.log('\n3. Testing Payment Settings API:');
    try {
      const response = await fetch('http://localhost:3000/api/admin/payment-settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response:');
        console.log(`  Success: ${data.success}`);
        console.log(`  Gateways: ${data.gateways?.length || 0} gateways`);
        console.log(`  Settings: ${data.settings ? 'Present' : 'Missing'}`);
        
        if (data.gateways) {
          console.log('\n  Gateways from API:');
          data.gateways.forEach(gateway => {
            console.log(`    - ${gateway.name} (${gateway.id})`);
            console.log(`      Enabled: ${gateway.enabled}`);
            console.log(`      Test Mode: ${gateway.testMode}`);
            console.log(`      Status: ${gateway.status}`);
          });
        }
      } else {
        const error = await response.json();
        console.log('❌ API Error:', error);
      }
    } catch (apiError) {
      console.log('⚠️  API test skipped (server may not be running):', apiError.message);
    }

    // 4. Test updating a gateway
    console.log('\n4. Testing Gateway Update:');
    const testUpdate = await query(`
      UPDATE payment_gateways 
      SET enabled = true, test_mode = true, status = 'testing'
      WHERE gateway_id = 'flutterwave'
      RETURNING *
    `);
    
    if (testUpdate.rows.length > 0) {
      console.log('✅ Successfully updated Flutterwave gateway');
      console.log(`  Enabled: ${testUpdate.rows[0].enabled}`);
      console.log(`  Test Mode: ${testUpdate.rows[0].test_mode}`);
      console.log(`  Status: ${testUpdate.rows[0].status}`);
    } else {
      console.log('❌ Failed to update gateway');
    }

    // 5. Test API with updated data
    console.log('\n5. Testing API with Updated Data:');
    try {
      const response2 = await fetch('http://localhost:3000/api/admin/payment-settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response2.ok) {
        const data2 = await response2.json();
        const flutterwave = data2.gateways?.find(g => g.id === 'flutterwave');
        if (flutterwave) {
          console.log('✅ Flutterwave gateway from API:');
          console.log(`  Enabled: ${flutterwave.enabled}`);
          console.log(`  Test Mode: ${flutterwave.testMode}`);
          console.log(`  Status: ${flutterwave.status}`);
        }
      }
    } catch (apiError2) {
      console.log('⚠️  API test skipped (server may not be running)');
    }

    console.log('\n✅ Payment Settings Testing Completed!');
    console.log('\n📋 Summary:');
    console.log(`  - Database gateways: ${gatewaysResult.rows.length}`);
    console.log(`  - Payment settings: ${settingsResult.rows.length > 0 ? 'Present' : 'Missing'}`);
    console.log('  - API endpoint: Available (if server running)');

  } catch (error) {
    console.error('❌ Error testing payment settings:', error);
  } finally {
    await query('SELECT 1'); // Keep connection alive
    process.exit(0);
  }
}

testPaymentSettings(); 