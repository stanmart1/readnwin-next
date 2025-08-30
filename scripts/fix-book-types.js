const { query } = require('../utils/database');

async function fixBookTypes() {
  try {
    console.log('🔧 Starting book type standardization...');
    
    // First, check current book_type distribution
    const typeDistribution = await query(`
      SELECT 
        book_type,
        COUNT(*) as count
      FROM books 
      GROUP BY book_type
      ORDER BY count DESC
    `);
    
    console.log('📊 Current book_type distribution:');
    typeDistribution.rows.forEach(row => {
      console.log(`  ${row.book_type || 'NULL'}: ${row.count} books`);
    });
    
    // Get books that need book_type standardization
    const booksToFix = await query(`
      SELECT 
        id, 
        title, 
        book_type,
        ebook_file_url,
        file_format
      FROM books 
      WHERE book_type IS NULL 
         OR book_type NOT IN ('ebook', 'physical', 'hybrid')
      ORDER BY id
    `);
    
    console.log(`📚 Found ${booksToFix.rows.length} books needing book_type standardization`);
    
    let updatedCount = 0;
    
    for (const book of booksToFix.rows) {
      try {
        let newBookType = 'physical'; // Default to physical
        
        // Determine book type based on available data
        if (book.ebook_file_url) {
          // Has digital file = ebook
          newBookType = 'ebook';
        } else if (book.file_format && ['epub', 'html', 'pdf'].includes(book.file_format.toLowerCase())) {
          // Has digital format but no file = ebook (might be uploaded later)
          newBookType = 'ebook';
        }
        // Otherwise remains 'physical'
        
        // Update the book
        await query(`
          UPDATE books 
          SET book_type = $2 
          WHERE id = $1
        `, [book.id, newBookType]);
        
        console.log(`✅ Updated book ${book.id} (${book.title}): ${book.book_type || 'NULL'} → ${newBookType}`);
        updatedCount++;
        
      } catch (error) {
        console.error(`❌ Error updating book ${book.id}:`, error.message);
      }
    }
    
    // Now ensure all books have proper book_type
    const nullTypeBooks = await query(`
      SELECT COUNT(*) as count 
      FROM books 
      WHERE book_type IS NULL
    `);
    
    if (nullTypeBooks.rows[0].count > 0) {
      console.log(`⚠️ Setting remaining ${nullTypeBooks.rows[0].count} books with NULL book_type to 'physical'`);
      await query(`
        UPDATE books 
        SET book_type = 'physical' 
        WHERE book_type IS NULL
      `);
    }
    
    // Final distribution check
    const finalDistribution = await query(`
      SELECT 
        book_type,
        COUNT(*) as count
      FROM books 
      GROUP BY book_type
      ORDER BY count DESC
    `);
    
    console.log('📊 Final book_type distribution:');
    finalDistribution.rows.forEach(row => {
      console.log(`  ${row.book_type}: ${row.count} books`);
    });
    
    console.log(`🎉 Book type standardization completed. Updated ${updatedCount} books.`);
    
  } catch (error) {
    console.error('❌ Error in book type standardization:', error);
  } finally {
    process.exit(0);
  }
}

fixBookTypes();