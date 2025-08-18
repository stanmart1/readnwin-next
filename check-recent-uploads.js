const { query } = require('./utils/database');

async function checkRecentUploads() {
  console.log('🔍 Checking Database for Recent Book Uploads');
  console.log('============================================');
  
  try {
    // Check for books uploaded in the last 24 hours
    const recentBooks = await query(`
      SELECT 
        id, 
        title, 
        author_id, 
        ebook_file_url, 
        format, 
        created_at,
        updated_at
      FROM books 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
    `);
    
    console.log(`📚 Books uploaded in last 24 hours: ${recentBooks.rows.length}`);
    
    if (recentBooks.rows.length > 0) {
      recentBooks.rows.forEach((book, index) => {
        console.log(`\n📖 Book ${index + 1}:`);
        console.log(`   ID: ${book.id}`);
        console.log(`   Title: ${book.title}`);
        console.log(`   Author ID: ${book.author_id}`);
        console.log(`   File URL: ${book.ebook_file_url}`);
        console.log(`   Format: ${book.format}`);
        console.log(`   Created: ${book.created_at}`);
        console.log(`   Updated: ${book.updated_at}`);
      });
    } else {
      console.log('❌ No books uploaded in the last 24 hours');
    }
    
    // Check for books uploaded in the last week
    const weeklyBooks = await query(`
      SELECT 
        id, 
        title, 
        author_id, 
        ebook_file_url, 
        format, 
        created_at
      FROM books 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      ORDER BY created_at DESC
    `);
    
    console.log(`\n📚 Books uploaded in last 7 days: ${weeklyBooks.rows.length}`);
    
    if (weeklyBooks.rows.length > 0) {
      weeklyBooks.rows.forEach((book, index) => {
        console.log(`   ${index + 1}. ID: ${book.id}, Title: ${book.title}, File: ${book.ebook_file_url}`);
      });
    }
    
    // Check for any books with recent file URLs
    const recentFileBooks = await query(`
      SELECT 
        id, 
        title, 
        ebook_file_url, 
        created_at
      FROM books 
      WHERE ebook_file_url LIKE '%1755%'
         OR ebook_file_url LIKE '%moby%'
         OR ebook_file_url LIKE '%whale%'
         OR ebook_file_url LIKE '%melville%'
      ORDER BY created_at DESC
    `);
    
    console.log(`\n🔍 Books with recent file patterns: ${recentFileBooks.rows.length}`);
    
    if (recentFileBooks.rows.length > 0) {
      recentFileBooks.rows.forEach((book, index) => {
        console.log(`   ${index + 1}. ID: ${book.id}, Title: ${book.title}, File: ${book.ebook_file_url}`);
      });
    }
    
    // Check total books in database
    const totalBooks = await query(`
      SELECT COUNT(*) as total FROM books
    `);
    
    console.log(`\n📊 Total books in database: ${totalBooks.rows[0].total}`);
    
    // Show the 10 most recent books overall
    const latestBooks = await query(`
      SELECT 
        id, 
        title, 
        ebook_file_url, 
        created_at
      FROM books 
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    console.log(`\n📚 10 Most Recent Books:`);
    latestBooks.rows.forEach((book, index) => {
      console.log(`   ${index + 1}. ID: ${book.id}, Title: ${book.title}, File: ${book.ebook_file_url}`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error);
    console.log('\n💡 Database connection issues detected.');
    console.log('   This might be due to:');
    console.log('   1. Database server not running');
    console.log('   2. Incorrect connection settings');
    console.log('   3. Network connectivity issues');
  }
}

checkRecentUploads().catch(console.error); 