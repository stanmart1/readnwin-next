const { query } = require('./utils/database');

async function checkBookDatabase() {
  console.log('🔍 Checking Book Database');
  console.log('=========================');
  
  try {
    // Check for books with the Moby Dick filename
    const result = await query(`
      SELECT id, title, author_id, ebook_file_url, format, created_at
      FROM books 
      WHERE ebook_file_url LIKE '%moby-dick%' 
         OR ebook_file_url LIKE '%1755350242624%'
         OR title ILIKE '%moby%'
         OR title ILIKE '%whale%'
      ORDER BY created_at DESC
    `);
    
    console.log('📚 Books found:', result.rows.length);
    
    if (result.rows.length > 0) {
      result.rows.forEach((book, index) => {
        console.log(`\n📖 Book ${index + 1}:`);
        console.log(`   ID: ${book.id}`);
        console.log(`   Title: ${book.title}`);
        console.log(`   Author ID: ${book.author_id}`);
        console.log(`   File URL: ${book.ebook_file_url}`);
        console.log(`   Format: ${book.format}`);
        console.log(`   Created: ${book.created_at}`);
      });
    } else {
      console.log('❌ No books found matching Moby Dick criteria');
      
      // Check all books to see what's available
      const allBooks = await query(`
        SELECT id, title, author_id, ebook_file_url, format, created_at
        FROM books 
        ORDER BY created_at DESC
        LIMIT 10
      `);
      
      console.log('\n📚 Recent books in database:');
      allBooks.rows.forEach((book, index) => {
        console.log(`   ${index + 1}. ID: ${book.id}, Title: ${book.title}, File: ${book.ebook_file_url}`);
      });
    }
    
    // Check if there are any books with the specific filename
    const filenameCheck = await query(`
      SELECT id, title, ebook_file_url
      FROM books 
      WHERE ebook_file_url = '/book-files/1755350242624_tkpbc9el3se_moby-dick.epub'
    `);
    
    if (filenameCheck.rows.length > 0) {
      console.log('\n✅ Found exact file match:');
      filenameCheck.rows.forEach(book => {
        console.log(`   ID: ${book.id}, Title: ${book.title}`);
      });
    } else {
      console.log('\n❌ No exact file match found for: 1755350242624_tkpbc9el3se_moby-dick.epub');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error);
  }
}

checkBookDatabase().catch(console.error); 