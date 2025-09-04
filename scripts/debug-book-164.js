const { query } = require('./utils/database');

async function debugBook164() {
  try {
    console.log('🔍 Debugging Book ID 164...\n');
    
    // Check book record
    const bookResult = await query('SELECT * FROM books WHERE id = $1', [164]);
    console.log('📚 Book Record:');
    console.log(bookResult.rows[0] || 'No book found');
    console.log('\n');
    
    // Check user library access
    const libraryResult = await query('SELECT * FROM user_library WHERE book_id = $1', [164]);
    console.log('📖 Library Access:');
    console.log(libraryResult.rows || 'No library access found');
    console.log('\n');
    
    // Check file system
    const fs = require('fs');
    const path = require('path');
    
    console.log('💾 File System Check:');
    const storageDir = path.join(process.cwd(), 'storage');
    
    // Check ebooks directory
    const ebooksDir = path.join(storageDir, 'ebooks');
    if (fs.existsSync(ebooksDir)) {
      const ebookFiles = fs.readdirSync(ebooksDir).filter(f => f.includes('164'));
      console.log('Ebooks directory files for 164:', ebookFiles);
    }
    
    // Check books directory
    const booksDir = path.join(storageDir, 'books', '164');
    if (fs.existsSync(booksDir)) {
      const bookFiles = fs.readdirSync(booksDir);
      console.log('Books/164 directory files:', bookFiles);
    } else {
      console.log('Books/164 directory does not exist');
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

debugBook164();