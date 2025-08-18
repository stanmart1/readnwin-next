const { query } = require('./utils/database');

async function checkBookDetails() {
  try {
    console.log('🔍 Checking detailed book information...\n');
    
    const result = await query(`
      SELECT id, title, format, ebook_file_url, content, 
             LENGTH(content) as content_length,
             content_metadata,
             word_count,
             estimated_reading_time
      FROM books 
      WHERE format = 'ebook' 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No ebooks found in database');
      return;
    }
    
    const book = result.rows[0];
    console.log('📚 Book details:');
    console.table([{
      id: book.id,
      title: book.title,
      format: book.format,
      ebook_file_url: book.ebook_file_url,
      content_length: book.content_length,
      word_count: book.word_count,
      estimated_reading_time: book.estimated_reading_time,
      has_metadata: book.content_metadata ? 'YES' : 'NO'
    }]);
    
    if (book.content_metadata) {
      console.log('\n📋 Content metadata:');
      const metadata = JSON.parse(book.content_metadata);
      console.log(JSON.stringify(metadata, null, 2));
    }
    
    if (book.content) {
      console.log('\n📖 Content preview (first 500 characters):');
      console.log(book.content.substring(0, 500) + '...');
    }
    
  } catch (error) {
    console.error('❌ Error checking book details:', error);
  }
}

checkBookDetails(); 