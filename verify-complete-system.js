require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function verifyCompleteSystem() {
  try {
    console.log('🔍 Verifying Complete System Integration\n');

    const results = {
      bookManagement: false,
      bookCards: false,
      cart: false,
      checkout: false,
      bookDetails: false,
      imageAPIs: false
    };

    // 1. Check Book Management System
    console.log('1️⃣ Checking Book Management System...');
    const bookManagementPath = path.join(process.cwd(), 'app/api/admin/books/route.ts');
    if (fs.existsSync(bookManagementPath)) {
      const content = fs.readFileSync(bookManagementPath, 'utf8');
      const usesOldSystem = content.includes('writeFileSync') || content.includes('/uploads/covers/');
      const usesNewSystem = content.includes('imageStorageService') || content.includes('/api/images/');
      
      console.log(`  - Uses old file system: ${usesOldSystem ? '❌' : '✅'}`);
      console.log(`  - Uses new database system: ${usesNewSystem ? '✅' : '❌'}`);
      results.bookManagement = !usesOldSystem;
    }

    // 2. Check Book Cards
    console.log('\n2️⃣ Checking Book Cards...');
    const bookCardPath = path.join(process.cwd(), 'components/BookCard.tsx');
    if (fs.existsSync(bookCardPath)) {
      const content = fs.readFileSync(bookCardPath, 'utf8');
      const usesApiPath = content.includes('/api/images/covers/');
      console.log(`  - Uses API image paths: ${usesApiPath ? '✅' : '❌'}`);
      results.bookCards = usesApiPath;
    }

    // 3. Check Cart Components
    console.log('\n3️⃣ Checking Cart Components...');
    const cartComponents = [
      'components/cart/MiniCart.tsx',
      'components/cart/SecureCartPage.tsx'
    ];
    
    let cartUpdated = true;
    for (const component of cartComponents) {
      const componentPath = path.join(process.cwd(), component);
      if (fs.existsSync(componentPath)) {
        const content = fs.readFileSync(componentPath, 'utf8');
        const usesApiPath = content.includes('/api/images/covers/') || content.includes('SafeImage');
        console.log(`  - ${component}: ${usesApiPath ? '✅' : '❌'}`);
        if (!usesApiPath) cartUpdated = false;
      }
    }
    results.cart = cartUpdated;

    // 4. Check Checkout Components
    console.log('\n4️⃣ Checking Checkout Components...');
    const checkoutComponents = [
      'components/checkout/OrderSummary.tsx',
      'components/checkout/CheckoutFlow.tsx'
    ];
    
    let checkoutUpdated = true;
    for (const component of checkoutComponents) {
      const componentPath = path.join(process.cwd(), component);
      if (fs.existsSync(componentPath)) {
        const content = fs.readFileSync(componentPath, 'utf8');
        const usesApiPath = content.includes('/api/images/covers/') || content.includes('SafeImage');
        console.log(`  - ${component}: ${usesApiPath ? '✅' : '❌'}`);
        if (!usesApiPath) checkoutUpdated = false;
      }
    }
    results.checkout = checkoutUpdated;

    // 5. Check Book Details Page
    console.log('\n5️⃣ Checking Book Details Page...');
    const bookDetailsPath = path.join(process.cwd(), 'app/book/[id]/page.tsx');
    if (fs.existsSync(bookDetailsPath)) {
      const content = fs.readFileSync(bookDetailsPath, 'utf8');
      const usesApiPath = content.includes('/api/images/covers/') || content.includes('SafeImage');
      console.log(`  - Book details page: ${usesApiPath ? '✅' : '❌'}`);
      results.bookDetails = usesApiPath;
    }

    // 6. Check Image APIs
    console.log('\n6️⃣ Checking Image APIs...');
    const imageAPIs = [
      'app/api/images/covers/[filename]/route.ts',
      'app/api/images/upload/route.ts',
      'app/api/images/secure/[id]/route.ts'
    ];
    
    let allAPIsExist = true;
    for (const api of imageAPIs) {
      const apiPath = path.join(process.cwd(), api);
      const exists = fs.existsSync(apiPath);
      console.log(`  - ${api}: ${exists ? '✅' : '❌'}`);
      if (!exists) allAPIsExist = false;
      
      if (exists) {
        const content = fs.readFileSync(apiPath, 'utf8');
        const usesDatabase = content.includes('query') || content.includes('imageStorageService');
        console.log(`    Uses database: ${usesDatabase ? '✅' : '❌'}`);
      }
    }
    results.imageAPIs = allAPIsExist;

    // 7. Check SafeImage Component
    console.log('\n7️⃣ Checking SafeImage Component...');
    const safeImagePath = path.join(process.cwd(), 'components/ui/SafeImage.tsx');
    if (fs.existsSync(safeImagePath)) {
      const content = fs.readFileSync(safeImagePath, 'utf8');
      const usesApiPath = content.includes('/api/images/covers/');
      const hasErrorHandling = content.includes('onError') || content.includes('handleError');
      console.log(`  - Uses API paths: ${usesApiPath ? '✅' : '❌'}`);
      console.log(`  - Has error handling: ${hasErrorHandling ? '✅' : '❌'}`);
    }

    // 8. Check Featured Books Component
    console.log('\n8️⃣ Checking Featured Books Component...');
    const featuredBooksPath = path.join(process.cwd(), 'components/FeaturedBooks.tsx');
    if (fs.existsSync(featuredBooksPath)) {
      const content = fs.readFileSync(featuredBooksPath, 'utf8');
      const usesBookCard = content.includes('BookCard');
      console.log(`  - Uses BookCard component: ${usesBookCard ? '✅' : '❌'}`);
    }

    // Summary
    console.log('\n📊 SYSTEM VERIFICATION SUMMARY:');
    console.log(`  Book Management: ${results.bookManagement ? '✅ UPDATED' : '❌ NEEDS UPDATE'}`);
    console.log(`  Book Cards: ${results.bookCards ? '✅ UPDATED' : '❌ NEEDS UPDATE'}`);
    console.log(`  Cart System: ${results.cart ? '✅ UPDATED' : '❌ NEEDS UPDATE'}`);
    console.log(`  Checkout System: ${results.checkout ? '✅ UPDATED' : '❌ NEEDS UPDATE'}`);
    console.log(`  Book Details: ${results.bookDetails ? '✅ UPDATED' : '❌ NEEDS UPDATE'}`);
    console.log(`  Image APIs: ${results.imageAPIs ? '✅ UPDATED' : '❌ NEEDS UPDATE'}`);

    const allUpdated = Object.values(results).every(result => result);
    console.log(`\n🎯 OVERALL STATUS: ${allUpdated ? '✅ FULLY INTEGRATED' : '⚠️ PARTIAL INTEGRATION'}`);

    if (!allUpdated) {
      console.log('\n🔧 REQUIRED UPDATES:');
      if (!results.bookManagement) console.log('  - Update book management to use imageStorageService');
      if (!results.bookCards) console.log('  - Update BookCard to use API image paths');
      if (!results.cart) console.log('  - Update cart components to use SafeImage');
      if (!results.checkout) console.log('  - Update checkout components to use SafeImage');
      if (!results.bookDetails) console.log('  - Update book details page to use SafeImage');
      if (!results.imageAPIs) console.log('  - Ensure all image APIs use database storage');
    }

  } catch (error) {
    console.error('❌ Error verifying system:', error);
  } finally {
    process.exit(0);
  }
}

verifyCompleteSystem();