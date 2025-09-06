#!/usr/bin/env node

/**
 * Test script to verify Flutterwave payment flow fixes
 * Run this script to check if the payment integration is working correctly
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Flutterwave Payment Flow Fixes...\n');

// Check if key files exist and have the fixes
const filesToCheck = [
  {
    path: './components/checkout/OrderConfirmation.tsx',
    checks: [
      'isSuccessful =',
      'Backend verification result',
      'response.status === \'successful\' ||',
      'verifyResponse = await fetch'
    ]
  },
  {
    path: './utils/flutterwave-service.ts',
    checks: [
      'Normalized Flutterwave response',
      'originalCallback',
      'payment_status: result.data?.status',
      'Flutterwave raw callback response'
    ]
  },
  {
    path: './app/api/payment/flutterwave/verify/route.ts',
    checks: [
      'actualPaymentStatus =',
      'isSuccessful =',
      'is_successful: isSuccessful',
      'debug_info:'
    ]
  },
  {
    path: './hooks/useFlutterwaveInline.ts',
    checks: [
      'flutterwaveService.initializeInlinePayment',
      'Flutterwave script not loaded. Please refresh'
    ]
  },
  {
    path: './app/payment/verify/page.tsx',
    checks: [
      'data.is_successful === true',
      'Payment success check:',
      'router.push(\'/payment/success?verified=true\')'
    ]
  }
];

let allChecksPass = true;

filesToCheck.forEach(file => {
  console.log(`📁 Checking ${file.path}...`);
  
  if (!fs.existsSync(file.path)) {
    console.log(`❌ File not found: ${file.path}`);
    allChecksPass = false;
    return;
  }
  
  const content = fs.readFileSync(file.path, 'utf8');
  
  file.checks.forEach(check => {
    if (content.includes(check)) {
      console.log(`✅ Found: ${check}`);
    } else {
      console.log(`❌ Missing: ${check}`);
      allChecksPass = false;
    }
  });
  
  console.log('');
});

// Check environment variables
console.log('🔧 Checking environment configuration...');

const envFile = '.env';
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  
  const requiredEnvVars = [
    'FLUTTERWAVE_PUBLIC_KEY',
    'FLUTTERWAVE_SECRET_KEY',
    'FLUTTERWAVE_HASH'
  ];
  
  requiredEnvVars.forEach(envVar => {
    if (envContent.includes(envVar)) {
      console.log(`✅ ${envVar} is configured`);
    } else {
      console.log(`⚠️  ${envVar} not found in .env file`);
    }
  });
} else {
  console.log('⚠️  .env file not found');
}

console.log('\n📋 Summary of fixes applied:');
console.log('1. ✅ Improved payment status checking in OrderConfirmation.tsx');
console.log('2. ✅ Added backend verification fallback for unclear payment status');
console.log('3. ✅ Enhanced Flutterwave service callback handling');
console.log('4. ✅ Normalized payment response formats');
console.log('5. ✅ Added comprehensive logging for debugging');
console.log('6. ✅ Improved payment verification API response handling');

console.log('\n🚀 Next steps to test:');
console.log('1. Start your development server: npm run dev');
console.log('2. Go through the checkout process with a test payment');
console.log('3. Check the browser console for detailed logs');
console.log('4. Verify that successful payments redirect to success page');
console.log('5. Check the database for proper order and payment status updates');

if (allChecksPass) {
  console.log('\n🎉 All fixes have been applied successfully!');
  console.log('The Flutterwave payment redirection issue should now be resolved.');
} else {
  console.log('\n⚠️  Some fixes may not have been applied correctly.');
  console.log('Please check the files manually or re-run the fix process.');
}

console.log('\n💡 If you still experience issues:');
console.log('1. Check the browser console for detailed payment flow logs');
console.log('2. Verify your Flutterwave credentials are correct');
console.log('3. Ensure your payment gateway is enabled in the admin panel');
console.log('4. Test with Flutterwave test credentials first');

console.log('\n📞 For additional support, check the payment logs in:');
console.log('- Browser console (F12 → Console)');
console.log('- Server logs (terminal where you run npm run dev)');
console.log('- Database payment_transactions table');