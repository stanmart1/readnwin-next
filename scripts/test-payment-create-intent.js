#!/usr/bin/env node

/**
 * Test Payment Create Intent API
 * This script tests the payment create-intent API to identify the exact error
 */

require('dotenv').config({ path: '.env.local' });

async function testPaymentCreateIntent() {
  try {
    console.log('🧪 Testing Payment Create Intent API...\n');

    // Test data similar to what the frontend sends
    const testData = {
      amount: 999.99,
      currency: 'ngn',
      paymentMethod: 'flutterwave',
      metadata: {
        order_id: '12345',
        phone_number: '+2348012345678'
      },
      description: 'Test payment for order'
    };

    console.log('1. Test Data:');
    console.log(JSON.stringify(testData, null, 2));

    // Test the API endpoint
    console.log('\n2. Testing API Endpoint:');
    try {
      const response = await fetch('http://localhost:3000/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      console.log(`Response Status: ${response.status}`);
      console.log(`Response OK: ${response.ok}`);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Success Response:');
        console.log(JSON.stringify(data, null, 2));
      } else {
        const errorData = await response.json();
        console.log('❌ Error Response:');
        console.log(JSON.stringify(errorData, null, 2));
      }
    } catch (apiError) {
      console.log('❌ API Call Failed:', apiError.message);
    }

    // Test Flutterwave initialization directly
    console.log('\n3. Testing Flutterwave Initialization Directly:');
    try {
      const flutterwaveResponse = await fetch('http://localhost:3000/api/payment/flutterwave/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 999.99,
          currency: 'NGN',
          email: 'test@example.com',
          phone_number: '+2348012345678',
          tx_ref: `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          redirect_url: 'http://localhost:3000/payment/verify',
          metadata: {
            order_id: '12345',
            user_id: '1'
          }
        })
      });

      console.log(`Flutterwave Response Status: ${flutterwaveResponse.status}`);
      console.log(`Flutterwave Response OK: ${flutterwaveResponse.ok}`);

      if (flutterwaveResponse.ok) {
        const data = await flutterwaveResponse.json();
        console.log('✅ Flutterwave Success Response:');
        console.log(JSON.stringify(data, null, 2));
      } else {
        const errorData = await flutterwaveResponse.json();
        console.log('❌ Flutterwave Error Response:');
        console.log(JSON.stringify(errorData, null, 2));
      }
    } catch (flutterwaveError) {
      console.log('❌ Flutterwave API Call Failed:', flutterwaveError.message);
    }

    // Test database connection
    console.log('\n4. Testing Database Connection:');
    try {
      const { query } = require('./utils/database');
      
      // Test payment gateways table
      const gatewaysResult = await query('SELECT * FROM payment_gateways WHERE gateway_id = \'flutterwave\'');
      console.log(`Flutterwave gateway found: ${gatewaysResult.rows.length > 0}`);
      
      if (gatewaysResult.rows.length > 0) {
        const gateway = gatewaysResult.rows[0];
        console.log('Gateway details:');
        console.log(`  Enabled: ${gateway.enabled}`);
        console.log(`  Test Mode: ${gateway.test_mode}`);
        console.log(`  Public Key: ${gateway.public_key ? 'Set' : 'Not set'}`);
        console.log(`  Secret Key: ${gateway.secret_key ? 'Set' : 'Not set'}`);
        console.log(`  Hash: ${gateway.hash ? 'Set' : 'Not set'}`);
      }

      // Test payment_transactions table
      const transactionsResult = await query('SELECT COUNT(*) as count FROM payment_transactions');
      console.log(`Payment transactions count: ${transactionsResult.rows[0].count}`);

    } catch (dbError) {
      console.log('❌ Database Error:', dbError.message);
    }

    console.log('\n✅ Payment Create Intent Testing Completed!');

  } catch (error) {
    console.error('❌ Error testing payment create intent:', error);
  } finally {
    process.exit(0);
  }
}

testPaymentCreateIntent(); 