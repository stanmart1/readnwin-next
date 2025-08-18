#!/usr/bin/env node

/**
 * Test Payment API Errors
 * This script tests both payment APIs to identify the exact cause of 500 errors
 */

require('dotenv').config({ path: '.env.local' });

async function testPaymentErrors() {
  try {
    console.log('🧪 Testing Payment API Errors...\n');

    // Test 1: Payment Create Intent API
    console.log('1. Testing /api/payment/create-intent:');
    try {
      const response = await fetch('http://localhost:3000/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 999.99,
          currency: 'ngn',
          paymentMethod: 'flutterwave',
          metadata: {
            order_id: '12345',
            phone_number: '+2348012345678'
          }
        })
      });

      console.log(`  Status: ${response.status}`);
      console.log(`  OK: ${response.ok}`);

      if (response.ok) {
        const data = await response.json();
        console.log('  ✅ Success:', JSON.stringify(data, null, 2));
      } else {
        const errorData = await response.json();
        console.log('  ❌ Error:', JSON.stringify(errorData, null, 2));
      }
    } catch (error) {
      console.log('  ❌ API Call Failed:', error.message);
    }

    // Test 2: Bank Transfer Initiate API
    console.log('\n2. Testing /api/payment/bank-transfer/initiate:');
    try {
      const response = await fetch('http://localhost:3000/api/payment/bank-transfer/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: 12345,
          amount: 999.99,
          currency: 'NGN'
        })
      });

      console.log(`  Status: ${response.status}`);
      console.log(`  OK: ${response.ok}`);

      if (response.ok) {
        const data = await response.json();
        console.log('  ✅ Success:', JSON.stringify(data, null, 2));
      } else {
        const errorData = await response.json();
        console.log('  ❌ Error:', JSON.stringify(errorData, null, 2));
      }
    } catch (error) {
      console.log('  ❌ API Call Failed:', error.message);
    }

    // Test 3: Database Connection Test
    console.log('\n3. Testing Database Connection:');
    try {
      const { query } = require('./utils/database');
      
      // Test basic query
      const result = await query('SELECT NOW() as current_time');
      console.log('  ✅ Database connection working');
      console.log('  Current time:', result.rows[0].current_time);
      
      // Test orders table
      const ordersResult = await query('SELECT COUNT(*) as count FROM orders');
      console.log('  Orders count:', ordersResult.rows[0].count);
      
      // Test bank_transfers table
      const transfersResult = await query('SELECT COUNT(*) as count FROM bank_transfers');
      console.log('  Bank transfers count:', transfersResult.rows[0].count);
      
      // Test bank_accounts table
      const accountsResult = await query('SELECT COUNT(*) as count FROM bank_accounts WHERE is_active = true');
      console.log('  Active bank accounts count:', accountsResult.rows[0].count);
      
    } catch (error) {
      console.log('  ❌ Database Error:', error.message);
    }

    // Test 4: Bank Transfer Service Test
    console.log('\n4. Testing Bank Transfer Service:');
    try {
      const { bankTransferService } = require('./utils/bank-transfer-service');
      
      // Test getDefaultBankAccount
      const defaultAccount = await bankTransferService.getDefaultBankAccount();
      console.log('  Default bank account:', defaultAccount ? 'Found' : 'Not found');
      
      if (defaultAccount) {
        console.log('    Bank:', defaultAccount.bank_name);
        console.log('    Account:', defaultAccount.account_number);
        console.log('    Name:', defaultAccount.account_name);
      }
      
      // Test getBankAccounts
      const allAccounts = await bankTransferService.getBankAccounts();
      console.log('  All bank accounts:', allAccounts.length);
      
    } catch (error) {
      console.log('  ❌ Bank Transfer Service Error:', error.message);
      console.log('  Error stack:', error.stack);
    }

    // Test 5: Flutterwave Service Test
    console.log('\n5. Testing Flutterwave Service:');
    try {
      const { FlutterwaveService } = require('./utils/flutterwave-service');
      
      // Test service instantiation
      const flutterwaveService = new FlutterwaveService(
        'test_secret_key',
        'test_public_key',
        '',
        true
      );
      console.log('  ✅ Flutterwave service instantiated');
      
      // Test generateTransactionReference
      const txRef = flutterwaveService.generateTransactionReference();
      console.log('  Transaction reference generated:', txRef);
      
    } catch (error) {
      console.log('  ❌ Flutterwave Service Error:', error.message);
      console.log('  Error stack:', error.stack);
    }

    console.log('\n✅ Payment Error Testing Completed!');

  } catch (error) {
    console.error('❌ Error testing payment APIs:', error);
  } finally {
    process.exit(0);
  }
}

testPaymentErrors(); 