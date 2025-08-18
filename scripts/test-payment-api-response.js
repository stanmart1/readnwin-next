#!/usr/bin/env node

/**
 * Test Payment API Response Format
 * This script tests the payment settings API to debug the response format
 */

require('dotenv').config({ path: '.env.local' });
const { query } = require('../utils/database');

async function testPaymentApiResponse() {
  try {
    console.log('🧪 Testing Payment API Response Format...\n');

    // 1. Simulate the API logic directly
    console.log('1. Simulating API Logic:');
    
    // Get payment gateways from database
    const gatewaysResult = await query('SELECT * FROM payment_gateways ORDER BY gateway_id');
    console.log(`Found ${gatewaysResult.rows.length} gateways in database`);

    // Transform gateways to expected format
    const gateways = gatewaysResult.rows.map(dbGateway => ({
      id: dbGateway.gateway_id,
      name: dbGateway.name,
      description: dbGateway.description || '',
      icon: dbGateway.gateway_id === 'flutterwave' ? 'ri-global-line' : 'ri-bank-line',
      enabled: dbGateway.enabled,
      testMode: dbGateway.test_mode,
      apiKeys: {
        publicKey: dbGateway.public_key || '',
        secretKey: dbGateway.secret_key || '',
        webhookSecret: dbGateway.webhook_secret || '',
        hash: dbGateway.hash || '',
      },
      supportedCurrencies: ['NGN'],
      features: dbGateway.gateway_id === 'flutterwave' 
        ? ['Mobile Money', 'Bank Transfers', 'Credit Cards', 'USSD', 'QR Payments']
        : ['Bank Transfers', 'Proof of Payment', 'Manual Verification'],
      status: dbGateway.status || 'inactive',
    }));

    console.log('\nTransformed Gateways:');
    gateways.forEach(gateway => {
      console.log(`  - ${gateway.name} (${gateway.id})`);
      console.log(`    Enabled: ${gateway.enabled}`);
      console.log(`    Test Mode: ${gateway.testMode}`);
      console.log(`    Status: ${gateway.status}`);
      console.log(`    Public Key: ${gateway.apiKeys.publicKey ? 'Set' : 'Not set'}`);
      console.log(`    Secret Key: ${gateway.apiKeys.secretKey ? 'Set' : 'Not set'}`);
      console.log('');
    });

    // Get payment settings from database
    const settingsResult = await query('SELECT setting_key, setting_value FROM payment_settings');
    console.log(`Found ${settingsResult.rows.length} payment settings`);

    // Transform settings to expected format
    const settingsMap = {};
    settingsResult.rows.forEach(row => {
      try {
        settingsMap[row.setting_key] = JSON.parse(row.setting_value);
      } catch {
        settingsMap[row.setting_key] = row.setting_value;
      }
    });

    const settings = {
      defaultGateway: settingsMap.defaultGateway || settingsMap.default_gateway || 'flutterwave',
      supportedGateways: settingsMap.supportedGateways || ['flutterwave', 'bank_transfer'],
      currency: settingsMap.currency || settingsMap.default_currency || 'NGN',
      taxRate: parseFloat(settingsMap.taxRate) || 7.5,
      shippingCost: parseFloat(settingsMap.shippingCost) || 500,
      freeShippingThreshold: parseFloat(settingsMap.freeShippingThreshold) || 5000,
      webhookUrl: settingsMap.webhookUrl || '',
      testMode: settingsMap.testMode === 'true' || settingsMap.testMode === true,
    };

    console.log('\nTransformed Settings:');
    console.log(`  Default Gateway: ${settings.defaultGateway}`);
    console.log(`  Supported Gateways: ${settings.supportedGateways.join(', ')}`);
    console.log(`  Currency: ${settings.currency}`);
    console.log(`  Tax Rate: ${settings.taxRate}%`);
    console.log(`  Shipping Cost: ₦${settings.shippingCost}`);
    console.log(`  Free Shipping Threshold: ₦${settings.freeShippingThreshold}`);
    console.log(`  Test Mode: ${settings.testMode}`);

    // 2. Create the expected API response
    const apiResponse = {
      success: true,
      settings,
      gateways,
    };

    console.log('\n2. Expected API Response Structure:');
    console.log(JSON.stringify(apiResponse, null, 2));

    // 3. Test if the frontend component can handle this data
    console.log('\n3. Frontend Component Compatibility:');
    
    // Check if gateways have required fields
    const requiredGatewayFields = ['id', 'name', 'enabled', 'testMode', 'apiKeys', 'status'];
    gateways.forEach(gateway => {
      const missingFields = requiredGatewayFields.filter(field => !(field in gateway));
      if (missingFields.length > 0) {
        console.log(`  ❌ Gateway ${gateway.name} missing fields: ${missingFields.join(', ')}`);
      } else {
        console.log(`  ✅ Gateway ${gateway.name} has all required fields`);
      }
    });

    // Check if settings have required fields
    const requiredSettingsFields = ['defaultGateway', 'supportedGateways', 'currency', 'taxRate', 'shippingCost', 'freeShippingThreshold', 'testMode'];
    const missingSettingsFields = requiredSettingsFields.filter(field => !(field in settings));
    if (missingSettingsFields.length > 0) {
      console.log(`  ❌ Settings missing fields: ${missingSettingsFields.join(', ')}`);
    } else {
      console.log(`  ✅ Settings has all required fields`);
    }

    // 4. Test API endpoint (if server is running)
    console.log('\n4. Testing Actual API Endpoint:');
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

    console.log('\n✅ Payment API Response Testing Completed!');

  } catch (error) {
    console.error('❌ Error testing payment API response:', error);
  } finally {
    await query('SELECT 1'); // Keep connection alive
    process.exit(0);
  }
}

testPaymentApiResponse(); 