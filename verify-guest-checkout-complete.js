#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Complete Guest Checkout & Cart Transfer Verification\n');

const checks = [
  {
    name: 'Guest Cart Context',
    file: 'contexts/GuestCartContext.tsx',
    tests: [
      { check: 'addToCart method', pattern: /addToCart.*async/ },
      { check: 'transferCartToUser method', pattern: /transferCartToUser.*async/ },
      { check: 'localStorage integration', pattern: /localStorage\.setItem/ },
      { check: 'API call format', pattern: /guest_cart_items/ }
    ]
  },
  {
    name: 'Cart Transfer API',
    file: 'app/api/cart/transfer-guest/route.ts',
    tests: [
      { check: 'POST method export', pattern: /export async function POST/ },
      { check: 'Authentication check', pattern: /getServerSession/ },
      { check: 'Input validation', pattern: /Array\.isArray.*guest_cart_items/ },
      { check: 'CartService integration', pattern: /cartService\.addToCart/ },
      { check: 'Error handling', pattern: /catch.*error/ }
    ]
  },
  {
    name: 'Guest Checkout Page',
    file: 'app/checkout-guest/GuestCheckoutEnhanced.tsx',
    tests: [
      { check: 'Cart transfer on auth', pattern: /transferCartToUser/ },
      { check: 'Shipping address form', pattern: /shippingAddress/ },
      { check: 'Digital vs Physical flow', pattern: /isEbookOnly/ },
      { check: 'Session storage', pattern: /sessionStorage\.setItem/ },
      { check: 'Redirect to auth', pattern: /router\.push.*login/ }
    ]
  },
  {
    name: 'BookCard Integration',
    file: 'components/BookCard.tsx',
    tests: [
      { check: 'Guest cart import', pattern: /useGuestCart/ },
      { check: 'Session check', pattern: /useSession/ },
      { check: 'Guest cart addition', pattern: /addToGuestCart/ },
      { check: 'Book data structure', pattern: /bookData.*Book/ }
    ]
  },
  {
    name: 'Provider Configuration',
    file: 'app/providers.tsx',
    tests: [
      { check: 'GuestCartProvider', pattern: /GuestCartProvider/ },
      { check: 'UnifiedCartProvider', pattern: /UnifiedCartProvider/ },
      { check: 'SessionProvider', pattern: /SessionProvider/ }
    ]
  }
];

let totalTests = 0;
let passedTests = 0;

checks.forEach(({ name, file, tests }) => {
  console.log(`📁 ${name}`);
  
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`  ❌ File not found: ${file}`);
    totalTests += tests.length;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  tests.forEach(({ check, pattern }) => {
    totalTests++;
    if (pattern.test(content)) {
      console.log(`  ✅ ${check}`);
      passedTests++;
    } else {
      console.log(`  ❌ ${check}`);
    }
  });
  
  console.log('');
});

console.log(`📊 Test Results: ${passedTests}/${totalTests} passed (${Math.round(passedTests/totalTests*100)}%)\n`);

// Flow verification
console.log('🔄 Guest Checkout Flow Verification:');

const flowSteps = [
  '1. User visits site without authentication',
  '2. User adds books to cart (stored in localStorage)',
  '3. User navigates to /checkout-guest',
  '4. User fills shipping details (for physical books)',
  '5. User clicks "Sign Up" or "Sign In"',
  '6. User completes authentication',
  '7. Cart items transferred via /api/cart/transfer-guest',
  '8. User redirected to /checkout-new',
  '9. User completes purchase with transferred cart'
];

flowSteps.forEach(step => console.log(`  ${step}`));

console.log('\n🧪 Manual Testing Checklist:');
console.log('□ Open incognito browser window');
console.log('□ Navigate to homepage');
console.log('□ Add books to cart without logging in');
console.log('□ Verify cart icon shows item count');
console.log('□ Navigate to /checkout-guest');
console.log('□ Fill shipping form (if physical books)');
console.log('□ Click authentication buttons');
console.log('□ Complete login/registration');
console.log('□ Verify cart transferred successfully');
console.log('□ Complete checkout process');

console.log('\n🔧 API Testing:');
console.log('Test cart transfer API with:');
console.log('POST /api/cart/transfer-guest');
console.log(JSON.stringify({
  guest_cart_items: [
    { book_id: 1, quantity: 2 },
    { book_id: 3, quantity: 1 }
  ]
}, null, 2));

console.log('\n✨ Verification completed!');