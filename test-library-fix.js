const { query } = require('./utils/database');

async function testLibraryFix() {
  try {
    console.log('🔍 Testing Library Assignment Fix\n');
    
    // Test the fixed query
    console.log('1. Testing fixed dashboard library query...');
    
    const fixedQuery = `
      SELECT 
        b.id,
        b.title,
        COALESCE(a.name, 'Unknown Author') as author_name,
        b.cover_image_url,
        COALESCE(b.book_type, 'ebook') as book_type,
        COALESCE(b.book_type, 'ebook') as primary_format,
        COALESCE(rp.progress_percentage, 0) as progress_percentage,
        rp.last_read_at,
        rp.completed_at,
        COALESCE(rp.total_reading_time_seconds, 0) as total_reading_time_seconds,
        ul.added_at,
        ul.access_type
      FROM user_library ul
      JOIN books b ON ul.book_id = b.id
      LEFT JOIN authors a ON b.author_id = a.id
      LEFT JOIN reading_progress rp ON ul.book_id = rp.book_id AND ul.user_id = rp.user_id
      WHERE ul.status = 'active'
      ORDER BY ul.added_at DESC
      LIMIT 5
    `;
    
    try {
      const result = await query(fixedQuery);
      console.log(`✅ Fixed query returned ${result.rows.length} books`);
      
      if (result.rows.length > 0) {
        console.log('📚 Books found in libraries:');
        result.rows.forEach((book, index) => {
          console.log(`   ${index + 1}. "${book.title}" | Type: ${book.book_type} | Added: ${book.added_at}`);
        });
      } else {
        console.log('⚠️ No books found - check if assignments exist');
      }
    } catch (error) {
      console.log('❌ Fixed query failed:', error.message);
    }
    
    // Check what was the issue
    console.log('\n2. Comparing old vs new field usage...');
    
    try {
      const fieldCheck = await query(`
        SELECT 
          id, 
          title,
          book_type,
          CASE 
            WHEN book_type IS NOT NULL THEN 'Has book_type'
            ELSE 'Missing book_type'
          END as book_type_status
        FROM books 
        LIMIT 5
      `);
      
      console.log('📋 Book field analysis:');
      fieldCheck.rows.forEach((book, index) => {
        console.log(`   ${index + 1}. "${book.title}" | book_type: ${book.book_type || 'NULL'} | Status: ${book.book_type_status}`);
      });
    } catch (error) {
      console.log('❌ Field check failed:', error.message);
    }
    
    // Test assignment flow
    console.log('\n3. Checking assignment records...');
    
    try {
      const assignmentCheck = await query(`
        SELECT 
          ul.id,
          ul.user_id,
          ul.book_id,
          ul.status,
          ul.added_at,
          u.email,
          b.title
        FROM user_library ul
        LEFT JOIN users u ON ul.user_id = u.id
        LEFT JOIN books b ON ul.book_id = b.id
        ORDER BY ul.added_at DESC
        LIMIT 5
      `);
      
      console.log(`📊 Assignment records: ${assignmentCheck.rows.length}`);
      assignmentCheck.rows.forEach((record, index) => {
        console.log(`   ${index + 1}. User: ${record.email} | Book: ${record.title} | Status: ${record.status}`);
      });
    } catch (error) {
      console.log('❌ Assignment check failed:', error.message);
    }
    
    console.log('\n🎯 SUMMARY:');
    console.log('✅ Fixed dashboard library API to use book_type instead of format');
    console.log('✅ This should resolve empty library issue');
    console.log('✅ Users should now see assigned books in their library');
    
    console.log('\n🔧 WHAT WAS FIXED:');
    console.log('- Changed COALESCE(b.format, \'ebook\') to COALESCE(b.book_type, \'ebook\')');
    console.log('- This matches the field structure used in books API');
    console.log('- Ensures consistent field references across all APIs');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testLibraryFix();