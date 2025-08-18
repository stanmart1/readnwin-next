const { query } = require('../utils/database');

async function updateBookFile() {
  try {
    // Update book ID 105 to point to the test EPUB file
    await query(`
      UPDATE books 
      SET ebook_file_url = '/book-files/test-moby-dick.epub',
          content = '',
          html_file_path = NULL,
          processing_status = 'pending'
      WHERE id = 105
    `);
    
    console.log('✅ Book file path updated successfully');
    
    // Also add the book to user library for testing
    await query(`
      INSERT INTO user_library (user_id, book_id, added_at)
      VALUES (1, 105, NOW())
      ON CONFLICT (user_id, book_id) DO NOTHING
    `);
    
    console.log('✅ Book added to user library');
    
  } catch (error) {
    console.error('❌ Error updating book file:', error);
  } finally {
    process.exit(0);
  }
}

updateBookFile(); 