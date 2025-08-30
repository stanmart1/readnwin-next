const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkCoverImages() {
  try {
    console.log('Checking cover image URLs in database...\n');
    
    const result = await pool.query(`
      SELECT id, title, cover_image_url, cover_image_path 
      FROM books 
      WHERE cover_image_url IS NOT NULL OR cover_image_path IS NOT NULL
      ORDER BY id 
      LIMIT 10
    `);
    
    console.log(`Found ${result.rows.length} books with cover images:\n`);
    
    result.rows.forEach(book => {
      console.log(`Book ID: ${book.id}`);
      console.log(`Title: ${book.title}`);
      console.log(`Cover URL: ${book.cover_image_url || 'NULL'}`);
      console.log(`Cover Path: ${book.cover_image_path || 'NULL'}`);
      console.log('---');
    });
    
    // Check if any books have no cover images
    const noCoverResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM books 
      WHERE cover_image_url IS NULL AND cover_image_path IS NULL
    `);
    
    console.log(`\nBooks without cover images: ${noCoverResult.rows[0].count}`);
    
  } catch (error) {
    console.error('Error checking cover images:', error);
  } finally {
    await pool.end();
  }
}

checkCoverImages();