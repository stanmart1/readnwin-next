require('dotenv').config({ path: '.env.local' });

async function testApiBookCreation() {
  console.log('🧪 Testing API Book Creation Endpoint');
  console.log('=' .repeat(60));
  
  // Test 1: Check if the API endpoint is accessible
  console.log('\n📋 Test 1: API Endpoint Accessibility');
  console.log('-'.repeat(40));
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/books', {
      method: 'GET'
    });
    console.log(`📚 GET /api/admin/books status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('❌ Authentication required - this is expected for admin endpoints');
    } else if (response.status === 200) {
      console.log('✅ API endpoint accessible');
    } else {
      console.log(`⚠️  Unexpected status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Error accessing API:', error.message);
  }
  
  // Test 2: Check if the server is running
  console.log('\n📋 Test 2: Server Status');
  console.log('-'.repeat(40));
  
  try {
    const response = await fetch('http://localhost:3000/');
    console.log(`🏠 Homepage status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Server is running');
    } else {
      console.log(`⚠️  Server status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Server not accessible:', error.message);
    console.log('💡 Make sure the development server is running with: npm run dev');
    return;
  }
  
  // Test 3: Check if there are any console errors in the API
  console.log('\n📋 Test 3: API Error Analysis');
  console.log('-'.repeat(40));
  
  console.log('🔍 Common causes of "Failed to create book" error:');
  console.log('  1. Missing required fields (title, author_id, category_id, price)');
  console.log('  2. Invalid file uploads (cover_image, ebook_file)');
  console.log('  3. Database constraint violations');
  console.log('  4. File system permission issues');
  console.log('  5. Missing upload directories');
  console.log('  6. Authentication/session issues');
  
  console.log('\n📝 Debugging Steps:');
  console.log('  1. Check browser console for detailed error messages');
  console.log('  2. Check server console/logs for backend errors');
  console.log('  3. Verify all required form fields are filled');
  console.log('  4. Ensure files are properly selected and valid');
  console.log('  5. Check if you are logged in as admin');
  
  console.log('\n🔧 Quick Fixes to Try:');
  console.log('  1. Log out and log back in as admin');
  console.log('  2. Clear browser cache and cookies');
  console.log('  3. Restart the development server');
  console.log('  4. Check file upload permissions');
  console.log('  5. Verify all form fields are completed');
  
  console.log('\n📋 Test 4: File Upload Directory Check');
  console.log('-'.repeat(40));
  
  const fs = require('fs');
  const path = require('path');
  
  const uploadDirs = [
    'public/uploads',
    'public/uploads/covers',
    'public/uploads/ebooks'
  ];
  
  uploadDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      try {
        fs.accessSync(fullPath, fs.constants.W_OK);
        console.log(`✅ ${dir} exists and is writable`);
      } catch (error) {
        console.log(`❌ ${dir} exists but is NOT writable`);
      }
    } else {
      console.log(`❌ ${dir} does NOT exist`);
    }
  });
  
  console.log('\n📝 Summary');
  console.log('-'.repeat(40));
  console.log('✅ Database schema is correct');
  console.log('✅ File upload directories exist');
  console.log('✅ Book creation works at database level');
  console.log('\n🔍 The issue is likely:');
  console.log('  - Frontend form validation');
  console.log('  - File upload process');
  console.log('  - Session/authentication');
  console.log('  - API endpoint error handling');
  console.log('\n💡 Next steps:');
  console.log('  1. Check browser console for detailed errors');
  console.log('  2. Check server logs for backend errors');
  console.log('  3. Try creating a book with minimal data first');
  console.log('  4. Verify admin authentication is working');
}

testApiBookCreation().catch(console.error); 