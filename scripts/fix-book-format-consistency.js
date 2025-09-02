// Load environment variables
require('dotenv').config({ path: '.env' });
const { query } = require('../utils/database');

async function fixBookFormatConsistency() {
  try {
    console.log('🔧 Starting book format consistency fix...');
    
    // Check current format distribution
    const formatDistribution = await query(`
      SELECT 
        format,
        COUNT(*) as count
      FROM books 
      GROUP BY format
      ORDER BY count DESC
    `);
    
    console.log('📊 Current format distribution:');
    formatDistribution.rows.forEach(row => {
      console.log(`  ${row.format || 'NULL'}: ${row.count} books`);
    });
    
    // Fix any NULL or invalid format values
    const result = await query(`
      UPDATE books 
      SET format = CASE 
        WHEN format IS NULL OR format = '' THEN 'physical'
        WHEN format NOT IN ('ebook', 'physical', 'hybrid') THEN 'physical'
        ELSE format
      END
      WHERE format IS NULL 
         OR format = '' 
         OR format NOT IN ('ebook', 'physical', 'hybrid')
      RETURNING id, title, format
    `);
    
    console.log(`✅ Updated ${result.rows.length} books with invalid formats`);
    
    if (result.rows.length > 0) {
      result.rows.forEach(book => {
        console.log(`  - Book ${book.id} (${book.title}): format set to '${book.format}'`);
      });
    }
    
    // Final distribution check
    const finalDistribution = await query(`
      SELECT 
        format,
        COUNT(*) as count
      FROM books 
      GROUP BY format
      ORDER BY count DESC
    `);
    
    console.log('📊 Final format distribution:');
    finalDistribution.rows.forEach(row => {
      console.log(`  ${row.format}: ${row.count} books`);
    });
    
    console.log('🎉 Book format consistency fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing book format consistency:', error);
  } finally {
    process.exit(0);
  }
}

fixBookFormatConsistency();