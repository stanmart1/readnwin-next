require('dotenv').config();
const { query } = require('../utils/database');
const path = require('path');

async function fixBookFilePaths() {
  try {
    console.log('🔧 Starting book file path fix...');
    
    // Get all books with file paths
    const result = await query(`
      SELECT id, title, ebook_file_url, cover_image_url 
      FROM books 
      WHERE ebook_file_url IS NOT NULL OR cover_image_url IS NOT NULL
      ORDER BY id
    `);
    
    console.log(`📚 Found ${result.rows.length} books with file paths to fix`);
    
    let updatedCount = 0;
    
    for (const book of result.rows) {
      try {
        let needsUpdate = false;
        let updates = [];
        
        // Fix ebook file path
        if (book.ebook_file_url) {
          const currentPath = book.ebook_file_url;
          let newPath = currentPath;
          
          // Convert from /book-files/epub/filename.epub to /book-files/filename.epub
          if (currentPath.startsWith('/book-files/epub/')) {
            const filename = path.basename(currentPath);
            newPath = `/book-files/${filename}`;
          } else if (currentPath.startsWith('/book-files/html/')) {
            const filename = path.basename(currentPath);
            newPath = `/book-files/${filename}`;
          }
          
          if (newPath !== currentPath) {
            updates.push(`ebook_file_url = '${newPath}'`);
            console.log(`📝 Book ${book.id} (${book.title}):`);
            console.log(`   Ebook: ${currentPath} → ${newPath}`);
            needsUpdate = true;
          }
        }
        
        // Fix cover image path
        if (book.cover_image_url) {
          const currentPath = book.cover_image_url;
          let newPath = currentPath;
          
          // Convert from /media_root/covers/ to /api/media-root/public/uploads/covers/
          if (currentPath.startsWith('/media_root/covers/')) {
            const filename = path.basename(currentPath);
            newPath = `/api/media-root/public/uploads/covers/${filename}`;
          }
          
          if (newPath !== currentPath) {
            updates.push(`cover_image_url = '${newPath}'`);
            console.log(`   Cover: ${currentPath} → ${newPath}`);
            needsUpdate = true;
          }
        }
        
        // Update the database if changes are needed
        if (needsUpdate) {
          const updateQuery = `
            UPDATE books 
            SET ${updates.join(', ')}, updated_at = NOW()
            WHERE id = $1
          `;
          
          await query(updateQuery, [book.id]);
          updatedCount++;
          console.log(`✅ Updated book ${book.id}`);
        }
        
      } catch (error) {
        console.error(`❌ Error updating book ${book.id}:`, error.message);
      }
    }
    
    console.log(`🎉 File path fix completed. Updated ${updatedCount} books.`);
    
    // Verify the fixes
    console.log('\n🔍 Verifying fixes...');
    const verifyResult = await query(`
      SELECT id, title, ebook_file_url, cover_image_url 
      FROM books 
      WHERE ebook_file_url IS NOT NULL OR cover_image_url IS NOT NULL
      ORDER BY id
    `);
    
    console.log('\n📋 Final file paths in database:');
    verifyResult.rows.forEach(book => {
      console.log(`ID: ${book.id}, Title: ${book.title}`);
      if (book.ebook_file_url) {
        console.log(`  Ebook: ${book.ebook_file_url}`);
      }
      if (book.cover_image_url) {
        console.log(`  Cover: ${book.cover_image_url}`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error in file path fix:', error);
  } finally {
    process.exit(0);
  }
}

fixBookFilePaths();
