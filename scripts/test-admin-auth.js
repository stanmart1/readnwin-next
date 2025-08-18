require('dotenv').config({ path: '.env.local' });

async function testAdminAuth() {
  console.log('🧪 Testing Admin Authentication');
  console.log('=' .repeat(60));
  
  // Test 1: Check if admin API endpoints are accessible
  console.log('\n📋 Test 1: Admin API Endpoints');
  console.log('-'.repeat(40));
  
  try {
    // Test admin books endpoint
    const booksResponse = await fetch('http://localhost:3000/api/admin/books?limit=1');
    console.log(`📚 Admin books API status: ${booksResponse.status}`);
    
    if (booksResponse.status === 401) {
      console.log('❌ Authentication required - need to be logged in');
    } else if (booksResponse.status === 403) {
      console.log('❌ Insufficient permissions');
    } else if (booksResponse.status === 200) {
      console.log('✅ Admin books API accessible');
    } else {
      console.log(`⚠️  Unexpected status: ${booksResponse.status}`);
    }
  } catch (error) {
    console.log('❌ Error accessing admin books API:', error.message);
  }
  
  // Test 2: Check if we can access the admin dashboard page
  console.log('\n📋 Test 2: Admin Dashboard Page');
  console.log('-'.repeat(40));
  
  try {
    const dashboardResponse = await fetch('http://localhost:3000/admin');
    console.log(`🏠 Admin dashboard page status: ${dashboardResponse.status}`);
    
    if (dashboardResponse.status === 200) {
      console.log('✅ Admin dashboard page accessible');
    } else {
      console.log(`⚠️  Admin dashboard page status: ${dashboardResponse.status}`);
    }
  } catch (error) {
    console.log('❌ Error accessing admin dashboard:', error.message);
  }
  
  // Test 3: Check if we can access the books management page
  console.log('\n📋 Test 3: Books Management Page');
  console.log('-'.repeat(40));
  
  try {
    const booksPageResponse = await fetch('http://localhost:3000/admin?tab=books');
    console.log(`📖 Books management page status: ${booksPageResponse.status}`);
    
    if (booksPageResponse.status === 200) {
      console.log('✅ Books management page accessible');
    } else {
      console.log(`⚠️  Books management page status: ${booksPageResponse.status}`);
    }
  } catch (error) {
    console.log('❌ Error accessing books management page:', error.message);
  }
  
  console.log('\n📝 Summary');
  console.log('-'.repeat(40));
  console.log('🔍 To fix the book deletion issue:');
  console.log('  1. Make sure you are logged in as admin');
  console.log('  2. Check if your session is valid');
  console.log('  3. Try refreshing the page');
  console.log('  4. Check browser console for errors');
  console.log('  5. Verify that you have admin permissions');
  console.log('\n💡 Common solutions:');
  console.log('  - Log out and log back in');
  console.log('  - Clear browser cookies and cache');
  console.log('  - Check if the session has expired');
  console.log('  - Verify admin role is properly assigned');
}

testAdminAuth().catch(console.error); 