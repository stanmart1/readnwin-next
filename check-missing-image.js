require('dotenv').config();
const { query } = require('./utils/database');

async function checkMissingImage() {
  try {
    console.log('🔍 Checking for missing image: 155_cover_1756843217457.jpg\n');

    // Check if image exists in database
    const result = await query(`
      SELECT id, filename, category, is_active, created_at 
      FROM images 
      WHERE filename = $1
    `, ['155_cover_1756843217457.jpg']);

    if (result.rows.length === 0) {
      console.log('❌ Image not found in database');
      
      // Check if any books reference this image
      const bookResult = await query(`
        SELECT id, title, cover_image_url 
        FROM books 
        WHERE cover_image_url LIKE $1
      `, ['%155_cover_1756843217457.jpg%']);
      
      if (bookResult.rows.length > 0) {
        console.log('\n📚 Books referencing this missing image:');
        bookResult.rows.forEach(book => {
          console.log(`  - ID: ${book.id}, Title: ${book.title}`);
          console.log(`    Cover URL: ${book.cover_image_url}`);
        });
        
        // Update books to use null cover_image_url
        console.log('\n🔧 Updating books to remove broken image reference...');
        await query(`
          UPDATE books 
          SET cover_image_url = NULL 
          WHERE cover_image_url LIKE $1
        `, ['%155_cover_1756843217457.jpg%']);
        
        console.log('✅ Updated books to remove broken image reference');
      } else {
        console.log('\n✅ No books reference this image');
      }
    } else {
      console.log('✅ Image found in database:');
      result.rows.forEach(img => {
        console.log(`  - ID: ${img.id}`);
        console.log(`  - Filename: ${img.filename}`);
        console.log(`  - Category: ${img.category}`);
        console.log(`  - Active: ${img.is_active}`);
        console.log(`  - Created: ${img.created_at}`);
      });
    }

  } catch (error) {
    console.error('Error checking missing image:', error);
  } finally {
    process.exit(0);
  }
}

checkMissingImage();