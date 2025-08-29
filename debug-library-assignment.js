const { query } = require('./utils/database');

async function debugLibraryAssignment() {
  try {
    console.log('🔍 Debugging Library Assignment Issue\n');
    
    // Check if user_library table exists and has data
    console.log('1. Checking user_library table...');
    try {
      const tableCheck = await query(`
        SELECT COUNT(*) as count FROM user_library
      `);
      console.log(`✅ user_library table exists with ${tableCheck.rows[0].count} records`);
      
      if (parseInt(tableCheck.rows[0].count) > 0) {
        const sampleRecords = await query(`
          SELECT ul.*, u.email, b.title 
          FROM user_library ul
          LEFT JOIN users u ON ul.user_id = u.id
          LEFT JOIN books b ON ul.book_id = b.id
          ORDER BY ul.added_at DESC
          LIMIT 5
        `);
        
        console.log('📋 Recent assignments:');
        sampleRecords.rows.forEach((record, index) => {
          console.log(`   ${index + 1}. User: ${record.email || 'Unknown'} | Book: ${record.title || 'Unknown'} | Status: ${record.status}`);
        });
      }
    } catch (error) {
      console.log('❌ user_library table issue:', error.message);
    }
    
    // Check books table
    console.log('\n2. Checking books table...');
    try {
      const booksCheck = await query(`
        SELECT id, title, book_type, format FROM books ORDER BY created_at DESC LIMIT 5
      `);
      console.log(`✅ Found ${booksCheck.rows.length} books:`);
      booksCheck.rows.forEach((book, index) => {
        console.log(`   ${index + 1}. ID: ${book.id} | Title: ${book.title} | Type: ${book.book_type || book.format}`);
      });
    } catch (error) {
      console.log('❌ books table issue:', error.message);
    }
    
    // Check users table
    console.log('\n3. Checking users table...');
    try {
      const usersCheck = await query(`
        SELECT id, email, status FROM users WHERE status = 'active' ORDER BY created_at DESC LIMIT 5
      `);
      console.log(`✅ Found ${usersCheck.rows.length} active users:`);
      usersCheck.rows.forEach((user, index) => {
        console.log(`   ${index + 1}. ID: ${user.id} | Email: ${user.email}`);
      });
    } catch (error) {
      console.log('❌ users table issue:', error.message);
    }
    
    // Check for field mismatches
    console.log('\n4. Checking field compatibility...');
    try {
      const libraryQuery = `
        SELECT 
          b.id,
          b.title,
          COALESCE(a.name, 'Unknown Author') as author_name,
          b.cover_image_url,
          COALESCE(b.book_type, b.format, 'ebook') as book_type,
          ul.added_at,
          ul.access_type,
          ul.status
        FROM user_library ul
        JOIN books b ON ul.book_id = b.id
        LEFT JOIN authors a ON b.author_id = a.id
        WHERE ul.status = 'active'
        LIMIT 3
      `;
      
      const testResult = await query(libraryQuery);
      console.log(`✅ Library query works, returned ${testResult.rows.length} records`);
      
      if (testResult.rows.length > 0) {
        console.log('📋 Sample library data:');
        testResult.rows.forEach((record, index) => {
          console.log(`   ${index + 1}. ${record.title} | Type: ${record.book_type} | Status: ${record.status}`);
        });
      }
    } catch (error) {
      console.log('❌ Library query issue:', error.message);
    }
    
    // Check for specific user library
    console.log('\n5. Testing specific user library...');
    try {
      const userLibraryTest = await query(`
        SELECT u.email, COUNT(ul.id) as book_count
        FROM users u
        LEFT JOIN user_library ul ON u.id = ul.user_id AND ul.status = 'active'
        WHERE u.status = 'active'
        GROUP BY u.id, u.email
        ORDER BY book_count DESC
        LIMIT 5
      `);
      
      console.log('📊 User library counts:');
      userLibraryTest.rows.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email}: ${user.book_count} books`);
      });
    } catch (error) {
      console.log('❌ User library count issue:', error.message);
    }
    
    // Check the exact query used by dashboard API
    console.log('\n6. Testing dashboard API query...');
    try {
      // Simulate the exact query from dashboard/library API
      const dashboardQuery = `
        SELECT 
          b.id,
          b.title,
          COALESCE(a.name, 'Unknown Author') as author_name,
          b.cover_image_url,
          COALESCE(b.format, 'ebook') as book_type,
          COALESCE(b.format, 'ebook') as primary_format,
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
      
      const dashboardResult = await query(dashboardQuery);
      console.log(`✅ Dashboard query works, returned ${dashboardResult.rows.length} records`);
      
      if (dashboardResult.rows.length > 0) {
        console.log('📋 Dashboard query results:');
        dashboardResult.rows.forEach((record, index) => {
          console.log(`   ${index + 1}. ${record.title} | Type: ${record.book_type} | Added: ${record.added_at}`);
        });
      } else {
        console.log('⚠️ Dashboard query returned no results - this explains empty library');
      }
    } catch (error) {
      console.log('❌ Dashboard query issue:', error.message);
    }
    
    console.log('\n🎯 DIAGNOSIS:');
    console.log('If user_library has records but dashboard query returns empty,');
    console.log('the issue is likely in the JOIN conditions or field references.');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugLibraryAssignment();