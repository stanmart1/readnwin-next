require('dotenv').config();
const { query } = require('./utils/database');

async function checkMissingImage157() {
  try {
    console.log('🔍 Checking for missing image: 157_cover_1756856156340.jpeg\n');

    // Check if image exists in images table
    const imageResult = await query(`
      SELECT id, filename, category, is_active, created_at 
      FROM images 
      WHERE filename = $1
    `, ['157_cover_1756856156340.jpeg']);

    if (imageResult.rows.length === 0) {
      console.log('❌ Image not found in database');
      
      // Find books referencing this missing image
      const bookResult = await query(`
        SELECT id, title, cover_image_url 
        FROM books 
        WHERE cover_image_url LIKE $1
      `, ['%157_cover_1756856156340.jpeg%']);

      if (bookResult.rows.length > 0) {
        console.log('\n📚 Books referencing this missing image:');
        bookResult.rows.forEach(book => {
          console.log(`  - ID: ${book.id}, Title: ${book.title}`);
          console.log(`    Cover URL: ${book.cover_image_url}`);
        });

        console.log('\n🔧 Updating books to remove broken image reference...');
        
        // Update books to remove the broken image reference
        await query(`
          UPDATE books 
          SET cover_image_url = NULL 
          WHERE cover_image_url LIKE $1
        `, ['%157_cover_1756856156340.jpeg%']);

        console.log('✅ Updated books to remove broken image reference');
      } else {
        console.log('\n✅ No books found referencing this image');
      }
    } else {
      console.log('✅ Image found in database:', imageResult.rows[0]);
    }

  } catch (error) {
    console.error('Error checking missing image:', error);
  } finally {
    process.exit(0);
  }
}

checkMissingImage157();