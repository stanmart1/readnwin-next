// Simple test to check what cover URLs are being returned
async function testCoverUrls() {
  try {
    console.log('Testing cover URLs from API...\n');
    
    const response = await fetch('http://localhost:3000/api/books?limit=5');
    const data = await response.json();
    
    if (data.success && data.books) {
      console.log(`Found ${data.books.length} books:\n`);
      
      data.books.forEach((book, index) => {
        console.log(`Book ${index + 1}:`);
        console.log(`  ID: ${book.id}`);
        console.log(`  Title: ${book.title}`);
        console.log(`  Cover URL: ${book.cover_image_url || 'NULL'}`);
        console.log(`  Cover Path: ${book.cover_image_path || 'NULL'}`);
        console.log('---');
      });
    } else {
      console.log('No books found or API error:', data);
    }
  } catch (error) {
    console.error('Error testing cover URLs:', error.message);
  }
}

testCoverUrls();