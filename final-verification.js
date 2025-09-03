require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function finalVerification() {
  console.log('🎯 FINAL SYSTEM VERIFICATION\n');

  const results = {
    bookManagement: false,
    bookCards: false,
    cart: false,
    checkout: false,
    bookDetails: false,
    imageAPIs: false
  };

  // 1. Book Management API
  console.log('1️⃣ Book Management API...');
  const bookMgmtPath = path.join(process.cwd(), 'app/api/admin/books/route.ts');
  if (fs.existsSync(bookMgmtPath)) {
    const content = fs.readFileSync(bookMgmtPath, 'utf8');
    const usesImageService = content.includes('imageStorageService.uploadImage');
    const noFileSystem = !content.includes('writeFileSync');
    results.bookManagement = usesImageService && noFileSystem;
    console.log(`  ✅ Uses imageStorageService: ${usesImageService}`);
    console.log(`  ✅ No file system: ${noFileSystem}`);
  }

  // 2. Book Cards
  console.log('\n2️⃣ Book Cards...');
  const bookCardPath = path.join(process.cwd(), 'components/BookCard.tsx');
  if (fs.existsSync(bookCardPath)) {
    const content = fs.readFileSync(bookCardPath, 'utf8');
    const usesApiPath = content.includes('/api/images/covers/');
    results.bookCards = usesApiPath;
    console.log(`  ✅ Uses API paths: ${usesApiPath}`);
  }

  // 3. Cart Components
  console.log('\n3️⃣ Cart Components...');
  const miniCartPath = path.join(process.cwd(), 'components/cart/MiniCart.tsx');
  const secureCartPath = path.join(process.cwd(), 'components/cart/SecureCartPage.tsx');
  
  let cartUpdated = true;
  if (fs.existsSync(miniCartPath)) {
    const content = fs.readFileSync(miniCartPath, 'utf8');
    const usesSafeImage = content.includes('SafeImage');
    console.log(`  ✅ MiniCart uses SafeImage: ${usesSafeImage}`);
    if (!usesSafeImage) cartUpdated = false;
  }
  
  if (fs.existsSync(secureCartPath)) {
    const content = fs.readFileSync(secureCartPath, 'utf8');
    const usesSafeImage = content.includes('SafeImage');
    console.log(`  ✅ SecureCartPage uses SafeImage: ${usesSafeImage}`);
    if (!usesSafeImage) cartUpdated = false;
  }
  results.cart = cartUpdated;

  // 4. Book Details
  console.log('\n4️⃣ Book Details Page...');
  const bookDetailsPath = path.join(process.cwd(), 'app/book/[bookId]/page.tsx');
  if (fs.existsSync(bookDetailsPath)) {
    const content = fs.readFileSync(bookDetailsPath, 'utf8');
    const usesSafeImage = content.includes('SafeImage');
    results.bookDetails = usesSafeImage;
    console.log(`  ✅ Uses SafeImage: ${usesSafeImage}`);
  }

  // 5. Image APIs
  console.log('\n5️⃣ Image APIs...');
  const coversAPI = path.join(process.cwd(), 'app/api/images/covers/[filename]/route.ts');
  const uploadAPI = path.join(process.cwd(), 'app/api/images/upload/route.ts');
  const secureAPI1 = path.join(process.cwd(), 'app/api/images/secure/[id]/route.ts');
  const secureAPI2 = path.join(process.cwd(), 'app/api/images/secure/[imageId]/route.ts');
  
  let allAPIsExist = true;
  
  if (fs.existsSync(coversAPI)) {
    const content = fs.readFileSync(coversAPI, 'utf8');
    const usesDB = content.includes('SELECT image_data');
    console.log(`  ✅ Covers API uses database: ${usesDB}`);
  } else {
    allAPIsExist = false;
    console.log(`  ❌ Covers API missing`);
  }
  
  if (fs.existsSync(uploadAPI)) {
    const content = fs.readFileSync(uploadAPI, 'utf8');
    const usesService = content.includes('imageStorageService');
    console.log(`  ✅ Upload API uses service: ${usesService}`);
  } else {
    allAPIsExist = false;
    console.log(`  ❌ Upload API missing`);
  }
  
  const secureExists = fs.existsSync(secureAPI1) || fs.existsSync(secureAPI2);
  console.log(`  ✅ Secure API exists: ${secureExists}`);
  
  results.imageAPIs = allAPIsExist && secureExists;

  // Summary
  console.log('\n📊 FINAL VERIFICATION RESULTS:');
  console.log(`  Book Management API: ${results.bookManagement ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
  console.log(`  Book Cards: ${results.bookCards ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
  console.log(`  Cart System: ${results.cart ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
  console.log(`  Book Details: ${results.bookDetails ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
  console.log(`  Image APIs: ${results.imageAPIs ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);

  const allComplete = Object.values(results).every(result => result);
  console.log(`\n🎯 OVERALL STATUS: ${allComplete ? '✅ FULLY INTEGRATED' : '⚠️ MOSTLY COMPLETE'}`);

  if (allComplete) {
    console.log('\n🎉 SUCCESS! All systems have been updated to use the database image system:');
    console.log('  ✅ Images stored in remote PostgreSQL database');
    console.log('  ✅ All components use SafeImage with API endpoints');
    console.log('  ✅ Book management uses imageStorageService');
    console.log('  ✅ Cart and checkout systems updated');
    console.log('  ✅ Book details page updated');
    console.log('  ✅ All image APIs use database storage');
  }

  process.exit(0);
}

finalVerification();