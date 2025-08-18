const { query } = require('./utils/database.js');

async function updateBook105Info() {
  console.log('🔍 Updating Book 105 Information\n');

  try {
    // Load environment variables
    require('dotenv').config({ path: '.env.local' });
    
    // Update the book record to reflect the actual content
    const result = await query(`
      UPDATE books 
      SET 
        title = 'The War of the Worlds',
        description = 'The War of the Worlds is a science fiction novel by English author H. G. Wells, first serialized in 1897 by Pearson''s Magazine in the UK and by Cosmopolitan magazine in the US. The novel''s first appearance in hardcover was in 1898 from publisher William Heinemann of London.',
        publication_date = '1898-01-01',
        word_count = 63000,
        pages = 288,
        format = 'ebook'
      WHERE id = 105
      RETURNING id, title, author_id, format, ebook_file_url
    `);

    if (result.rows.length > 0) {
      const book = result.rows[0];
      console.log('✅ Book 105 updated successfully:');
      console.log(`   ID: ${book.id}`);
      console.log(`   Title: ${book.title}`);
      console.log(`   Author ID: ${book.author_id}`);
      console.log(`   Format: ${book.format}`);
      console.log(`   File URL: ${book.ebook_file_url}`);
    } else {
      console.log('❌ Book 105 not found in database');
      return;
    }

    // Also update the author if needed (H. G. Wells)
    const authorResult = await query(`
      SELECT id, name FROM authors WHERE name ILIKE '%wells%' OR name ILIKE '%H. G.%'
    `);

    if (authorResult.rows.length > 0) {
      const wellsAuthor = authorResult.rows[0];
      console.log(`\n✅ Found author: ${wellsAuthor.name} (ID: ${wellsAuthor.id})`);
      
      // Update the book's author
      await query(`
        UPDATE books 
        SET author_id = $1 
        WHERE id = 105
      `, [wellsAuthor.id]);
      
      console.log(`✅ Updated book 105 author to: ${wellsAuthor.name}`);
    } else {
      console.log('\n⚠️ H. G. Wells not found in authors table');
      console.log('💡 You may need to add H. G. Wells as an author through the admin panel');
    }

    // Verify the update
    const verifyResult = await query(`
      SELECT b.id, b.title, b.format, b.ebook_file_url, a.name as author_name
      FROM books b
      LEFT JOIN authors a ON b.author_id = a.id
      WHERE b.id = 105
    `);

    if (verifyResult.rows.length > 0) {
      const book = verifyResult.rows[0];
      console.log('\n✅ Verification - Book 105 current info:');
      console.log(`   ID: ${book.id}`);
      console.log(`   Title: ${book.title}`);
      console.log(`   Author: ${book.author_name || 'Unknown'}`);
      console.log(`   Format: ${book.format}`);
      console.log(`   File URL: ${book.ebook_file_url}`);
    }

  } catch (error) {
    console.error('❌ Error updating book 105 info:', error);
  }
}

// Run the update
updateBook105Info()
  .then(() => {
    console.log('\n✅ Book 105 update completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Book 105 update failed:', error);
    process.exit(1);
  }); 