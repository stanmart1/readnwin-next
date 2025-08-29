require('dotenv').config();

async function testBookAPI() {
  console.log('🧪 Testing Book API...\n');
  
  try {
    // Test the debug endpoint first
    console.log('1. Testing debug endpoint...');
    const debugResponse = await fetch('http://localhost:3000/api/debug/books');
    
    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      console.log('✅ Debug endpoint working');
      console.log('Debug data:', JSON.stringify(debugData, null, 2));
    } else {
      console.log('❌ Debug endpoint failed:', debugResponse.status, debugResponse.statusText);
    }
    
    console.log('\n2. Testing main books API...');
    const booksResponse = await fetch('http://localhost:3000/api/admin/books');
    
    if (booksResponse.ok) {
      const booksData = await booksResponse.json();
      console.log('✅ Books API working');
      console.log('Books count:', booksData.books?.length || 0);
      console.log('Pagination:', booksData.pagination);
    } else {
      const errorData = await booksResponse.json().catch(() => ({}));
      console.log('❌ Books API failed:', booksResponse.status, booksResponse.statusText);
      console.log('Error details:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure your Next.js server is running on http://localhost:3000');
  }
}

testBookAPI();