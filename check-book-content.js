const { query } = require('./utils/database');

async function checkBookContent() {
  try {
    console.log('🔍 Checking book content status...\n');
    
    const result = await query(`
      SELECT id, title, format, 
             CASE 
               WHEN content IS NULL OR content = '' THEN 'NO_CONTENT'
               ELSE 'HAS_CONTENT'
             END as content_status,
             LENGTH(content) as content_length,
             ebook_file_url
      FROM books 
      WHERE format = 'ebook' 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    console.log('📚 Recent ebooks content status:');
    console.table(result.rows);
    
    // Check total books with content
    const contentStats = await query(`
      SELECT 
        COUNT(*) as total_ebooks,
        COUNT(CASE WHEN content IS NOT NULL AND content != '' THEN 1 END) as books_with_content,
        COUNT(CASE WHEN content IS NULL OR content = '' THEN 1 END) as books_without_content
      FROM books 
      WHERE format = 'ebook'
    `);
    
    console.log('\n📊 Content statistics:');
    console.table(contentStats.rows);
    
    // Check if any books have been processed
    const processedBooks = await query(`
      SELECT id, title, content_metadata
      FROM books 
      WHERE format = 'ebook' 
        AND content_metadata IS NOT NULL
      LIMIT 5
    `);
    
    console.log('\n🔧 Books with processing metadata:');
    console.table(processedBooks.rows);
    
  } catch (error) {
    console.error('❌ Error checking book content:', error);
  }
}

checkBookContent(); 