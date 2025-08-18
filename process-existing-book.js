const { BookContentProcessor } = require('./utils/book-content-processor');
const { query } = require('./utils/database');

async function processExistingBook() {
  try {
    console.log('🔍 Processing existing book content...\n');
    
    // Get the existing book
    const bookResult = await query(`
      SELECT id, title, ebook_file_url, format 
      FROM books 
      WHERE format = 'ebook' 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    if (bookResult.rows.length === 0) {
      console.log('❌ No ebooks found in database');
      return;
    }
    
    const book = bookResult.rows[0];
    console.log('📚 Found book:', {
      id: book.id,
      title: book.title,
      ebook_file_url: book.ebook_file_url,
      format: book.format
    });
    
    // Initialize the processor
    const processor = new BookContentProcessor();
    
    // Process the book
    console.log('\n🔄 Starting content processing...');
    await processor.processEbook(book);
    
    console.log('\n✅ Content processing completed!');
    
    // Verify the content was added
    const verifyResult = await query(`
      SELECT id, title, 
             CASE 
               WHEN content IS NULL OR content = '' THEN 'NO_CONTENT'
               ELSE 'HAS_CONTENT'
             END as content_status,
             LENGTH(content) as content_length,
             content_metadata
      FROM books 
      WHERE id = $1
    `, [book.id]);
    
    console.log('\n📊 Processing verification:');
    console.table(verifyResult.rows);
    
  } catch (error) {
    console.error('❌ Error processing book:', error);
  }
}

processExistingBook(); 