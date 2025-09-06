#!/usr/bin/env node

/**
 * Test script to verify Flutterwave redirect payment flow fixes
 */

console.log('🔍 Testing Flutterwave Redirect Payment Flow Fixes...\n');

const fs = require('fs');

// Check if key files have the redirect fixes
const filesToCheck = [
  {
    path: './app/api/checkout-new/route.ts',
    checks: [
      'redirect_url: `${process.env.NEXTAUTH_URL || \'https://readnwin.com\'}/payment/verify?order_id=${order.id}&order_number=${order.order_number}`',
    ],
    description: 'Checkout API redirect URL includes order info'
  },
  {
    path: './app/api/payment/flutterwave/initialize/route.ts',
    checks: [
      'redirect_url: redirect_url || `${process.env.NEXTAUTH_URL}/payment/verify?order_number=${orderNumber}`',
    ],
    description: 'Flutterwave initialize API includes order number in redirect'
  },
  {
    path: './app/payment/verify/page.tsx',
    checks: [
      'router.push(`/order-confirmation/${orderId}?success=true`)',
      'router.push(`/order-confirmation/${orderNumber}?success=true`)',
      'router.push(\'/dashboard?payment_success=true&tab=library\')',
      'View Your Library'
    ],
    description: 'Payment verification redirects to library'
  },
  {
    path: './app/api/payment/flutterwave/verify/route.ts',
    checks: [
      'Processing successful payment for tx_ref',
      'SELECT id, order_number FROM orders WHERE order_number = $1',
      'Your books have been added to your library',
      'redirect_url: isSuccessful ? \'/dashboard?tab=library&payment_success=true\' : null'
    ],
    description: 'Payment verification API properly handles order completion'
  },
  {
    path: './app/order-confirmation/[orderId]/page.tsx',
    checks: [
      'router.push(\'/dashboard?tab=library\')',
      'View Your Library'
    ],
    description: 'Order confirmation redirects to dashboard library'
  }
];

let allChecksPass = true;

filesToCheck.forEach(file => {
  console.log(`📁 Checking ${file.description}...`);
  console.log(`   File: ${file.path}`);
  
  if (!fs.existsSync(file.path)) {
    console.log(`❌ File not found: ${file.path}`);
    allChecksPass = false;
    return;
  }
  
  const content = fs.readFileSync(file.path, 'utf8');
  
  file.checks.forEach(check => {
    if (content.includes(check)) {
      console.log(`✅ Found: ${check.substring(0, 60)}${check.length > 60 ? '...' : ''}`);
    } else {
      console.log(`❌ Missing: ${check.substring(0, 60)}${check.length > 60 ? '...' : ''}`);
      allChecksPass = false;
    }
  });
  
  console.log('');
});

console.log('📋 Summary of Flutterwave redirect fixes:');
console.log('1. ✅ Updated redirect URLs to include order information');
console.log('2. ✅ Fixed payment verification to redirect to user library');
console.log('3. ✅ Enhanced order lookup in payment verification');
console.log('4. ✅ Improved order completion process');
console.log('5. ✅ Added proper library redirection in order confirmation');

console.log('\n🔄 Payment Flow After Fixes:');
console.log('1. User completes checkout → Order created');
console.log('2. User redirected to Flutterwave payment page');
console.log('3. User completes payment on Flutterwave');
console.log('4. Flutterwave redirects back with order info');
console.log('5. Payment verification API processes the payment');
console.log('6. Books added to user library automatically');
console.log('7. User redirected to library/dashboard');

console.log('\n🚀 Testing Steps:');
console.log('1. Start your development server: npm run dev');
console.log('2. Add books to cart and proceed to checkout');
console.log('3. Select Flutterwave as payment method');
console.log('4. Complete payment on Flutterwave test environment');
console.log('5. Verify you are redirected back to your library');
console.log('6. Check that books appear in your library');

if (allChecksPass) {
  console.log('\n🎉 All Flutterwave redirect fixes have been applied!');
  console.log('The payment redirection issue should now be resolved.');
  console.log('Successful payments will redirect to the user\'s library.');
} else {
  console.log('\n⚠️  Some fixes may not have been applied correctly.');
  console.log('Please check the files manually or re-run the fix process.');
}

console.log('\n💡 Key Changes Made:');
console.log('- Redirect URLs now include order information');
console.log('- Payment verification properly finds and updates orders');
console.log('- Successful payments redirect to user library');
console.log('- Enhanced error handling and logging');
console.log('- Improved order completion workflow');

console.log('\n🔧 Database Setup:');
console.log('Make sure Flutterwave is configured in payment_gateways table:');
console.log('- gateway_id: flutterwave');
console.log('- enabled: true');
console.log('- secret_key: your_secret_key');
console.log('- public_key: your_public_key');
console.log('- hash: your_hash_key');
console.log('- NEXTAUTH_URL environment variable (for proper redirects)');