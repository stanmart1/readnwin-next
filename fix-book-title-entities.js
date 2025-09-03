require('dotenv').config();
const { query } = require('./utils/database');

async function fixBookTitleEntities() {
  try {
    console.log('🔧 Fixing HTML entities in book titles...\n');

    // Find books with HTML entities in titles
    const result = await query(`
      SELECT id, title 
      FROM books 
      WHERE title LIKE '%&#%' OR title LIKE '%&amp;%' OR title LIKE '%&quot;%'
    `);

    if (result.rows.length === 0) {
      console.log('✅ No books with HTML entities found');
      return;
    }

    console.log(`📚 Found ${result.rows.length} books with HTML entities:`);
    
    for (const book of result.rows) {
      const originalTitle = book.title;
      const decodedTitle = originalTitle
        .replace(/&#x27;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ');

      if (originalTitle !== decodedTitle) {
        console.log(`  - ID ${book.id}: "${originalTitle}" → "${decodedTitle}"`);
        
        await query(`
          UPDATE books 
          SET title = $1 
          WHERE id = $2
        `, [decodedTitle, book.id]);
      }
    }

    console.log('\n✅ Successfully updated book titles');

  } catch (error) {
    console.error('Error fixing book title entities:', error);
  } finally {
    process.exit(0);
  }
}

fixBookTitleEntities();