const { query } = require('../utils/database');
const path = require('path');

async function fixBookFormats() {
  try {
    console.log('🔧 Starting book format fix...');
    
    // Get all books with unknown or missing file_format
    const result = await query(`
      SELECT id, title, ebook_file_url, file_format
      FROM books 
      WHERE ebook_file_url IS NOT NULL 
      AND (file_format IS NULL OR file_format = 'unknown')
      ORDER BY id
    `);
    
    console.log(`📚 Found ${result.rows.length} books with unknown format`);
    
    let updatedCount = 0;
    
    for (const book of result.rows) {
      try {
        const fileUrl = book.ebook_file_url;
        if (!fileUrl) continue;
        
        // Extract file extension from URL
        const extension = path.extname(fileUrl).toLowerCase();
        let detectedFormat = 'unknown';
        
        // Detect format based on extension
        if (extension === '.epub') {
          detectedFormat = 'epub';
        } else if (extension === '.html' || extension === '.htm') {
          detectedFormat = 'html';
        } else if (extension === '.pdf') {
          detectedFormat = 'pdf';
        }
        
        if (detectedFormat !== 'unknown') {
          // Update the book format
          await query(`
            UPDATE books 
            SET file_format = $2 
            WHERE id = $1
          `, [book.id, detectedFormat]);
          
          console.log(`✅ Updated book ${book.id} (${book.title}): ${book.file_format} → ${detectedFormat}`);
          updatedCount++;
        } else {
          console.log(`⚠️ Could not detect format for book ${book.id} (${book.title}): ${fileUrl}`);
        }
      } catch (error) {
        console.error(`❌ Error updating book ${book.id}:`, error.message);
      }
    }
    
    console.log(`🎉 Format fix completed. Updated ${updatedCount} books.`);
    
  } catch (error) {
    console.error('❌ Error in format fix:', error);
  } finally {
    process.exit(0);
  }
}

fixBookFormats();
