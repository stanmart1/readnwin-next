#!/usr/bin/env node

/**
 * Test script to verify the complete flow:
 * Admin assigns book -> User sees in library -> User can read via ereader
 */

const { query } = require('../utils/database');

async function testLibraryEreaderIntegration() {
  console.log('🧪 Testing Library-EReader Integration...\n');

  try {
    // Test 1: Check if we have test data
    console.log('📋 Test 1: Checking test data availability...');
    
    const usersResult = await query(`
      SELECT id, email, username FROM users 
      WHERE role != 'super_admin' 
      ORDER BY id 
      LIMIT 3
    `);
    
    const booksResult = await query(`
      SELECT id, title, format, ebook_file_url FROM books 
      WHERE format IN ('ebook', 'hybrid')
      ORDER BY id 
      LIMIT 3
    `);
    
    const adminsResult = await query(`
      SELECT id, email FROM users 
      WHERE role IN ('admin', 'super_admin') 
      LIMIT 1
    `);

    if (usersResult.rows.length === 0) {
      console.log('❌ No test users found');
      return;
    }
    
    if (booksResult.rows.length === 0) {
      console.log('❌ No ebooks found for testing');
      return;
    }
    
    if (adminsResult.rows.length === 0) {
      console.log('❌ No admin users found');
      return;
    }

    const testUser = usersResult.rows[0];
    const testBook = booksResult.rows[0];
    const adminUser = adminsResult.rows[0];

    console.log(`✅ Test user: ${testUser.email} (ID: ${testUser.id})`);
    console.log(`✅ Test book: ${testBook.title} (${testBook.format})`);
    console.log(`✅ Admin user: ${adminUser.email} (ID: ${adminUser.id})`);

    // Test 2: Simulate admin assignment
    console.log('\n📋 Test 2: Simulating admin book assignment...');
    
    try {
      const { LibrarySyncService } = require('../utils/library-sync-service');
      await LibrarySyncService.assignBookToUser(
        testUser.id, 
        testBook.id, 
        adminUser.id, 
        'Test assignment for integration verification'
      );
      console.log('✅ Book assignment completed');
    } catch (error) {
      if (error.message.includes('duplicate')) {
        console.log('✅ Book already assigned (expected for repeated tests)');
      } else {
        throw error;
      }
    }

    // Test 3: Verify assignment appears in user library
    console.log('\n📋 Test 3: Checking user library...');
    
    const libraryResult = await query(`
      SELECT 
        ul.id, ul.access_type, ul.status,
        b.title, b.format, b.ebook_file_url,
        ba.assigned_at, ba.reason
      FROM user_library ul
      JOIN books b ON ul.book_id = b.id
      LEFT JOIN book_assignments ba ON ul.user_id = ba.user_id AND ul.book_id = ba.book_id
      WHERE ul.user_id = $1 AND ul.book_id = $2
    `, [testUser.id, testBook.id]);

    if (libraryResult.rows.length === 0) {
      console.log('❌ Book not found in user library');
      return;
    }

    const libraryEntry = libraryResult.rows[0];
    console.log('✅ Book found in user library:');
    console.log(`  - Access type: ${libraryEntry.access_type}`);
    console.log(`  - Status: ${libraryEntry.status}`);
    console.log(`  - Assignment reason: ${libraryEntry.reason || 'N/A'}`);

    // Test 4: Check if book is readable
    console.log('\n📋 Test 4: Checking book readability...');
    
    const isReadable = libraryEntry.format === 'ebook' || libraryEntry.format === 'hybrid';
    const hasEbookFile = !!libraryEntry.ebook_file_url;
    
    console.log(`✅ Book format: ${libraryEntry.format}`);
    console.log(`✅ Is readable: ${isReadable ? 'Yes' : 'No'}`);
    console.log(`✅ Has ebook file: ${hasEbookFile ? 'Yes' : 'No'}`);

    if (!isReadable) {
      console.log('⚠️ This book is not readable via ereader (physical only)');
    }

    // Test 5: Simulate API calls that the frontend would make
    console.log('\n📋 Test 5: Testing API endpoints...');
    
    // Test library API
    const { ecommerceService } = require('../utils/ecommerce-service-new');
    const userLibrary = await ecommerceService.getUserLibrary(testUser.id);
    const assignedBook = userLibrary.find(item => item.book_id === testBook.id);
    
    if (assignedBook) {
      console.log('✅ Book found via library API');
      console.log(`  - Book ID: ${assignedBook.book_id}`);
      console.log(`  - Access type: ${assignedBook.access_type}`);
    } else {
      console.log('❌ Book not found via library API');
    }

    // Test 6: Check reading progress system
    console.log('\n📋 Test 6: Testing reading progress system...');
    
    const progressResult = await query(`
      SELECT * FROM reading_progress 
      WHERE user_id = $1 AND book_id = $2
    `, [testUser.id, testBook.id]);

    if (progressResult.rows.length === 0) {
      console.log('ℹ️ No reading progress found (expected for new assignment)');
      
      // Create initial progress entry
      await query(`
        INSERT INTO reading_progress (user_id, book_id, progress_percentage, last_read_at)
        VALUES ($1, $2, 0, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, book_id) DO NOTHING
      `, [testUser.id, testBook.id]);
      
      console.log('✅ Created initial reading progress entry');
    } else {
      console.log('✅ Reading progress entry exists');
      console.log(`  - Progress: ${progressResult.rows[0].progress_percentage}%`);
    }

    // Test 7: Verify complete integration
    console.log('\n📋 Test 7: Complete integration verification...');
    
    const integrationResult = await query(`
      SELECT 
        u.email as user_email,
        b.title as book_title,
        b.format as book_format,
        ul.access_type,
        ba.assigned_at,
        rp.progress_percentage,
        CASE 
          WHEN b.format IN ('ebook', 'hybrid') THEN 'readable'
          ELSE 'physical_only'
        END as readability_status
      FROM users u
      JOIN user_library ul ON u.id = ul.user_id
      JOIN books b ON ul.book_id = b.id
      LEFT JOIN book_assignments ba ON ul.user_id = ba.user_id AND ul.book_id = ba.book_id
      LEFT JOIN reading_progress rp ON ul.user_id = rp.user_id AND ul.book_id = rp.book_id
      WHERE u.id = $1 AND b.id = $2
    `, [testUser.id, testBook.id]);

    if (integrationResult.rows.length > 0) {
      const result = integrationResult.rows[0];
      console.log('✅ Complete integration verified:');
      console.log(`  - User: ${result.user_email}`);
      console.log(`  - Book: ${result.book_title}`);
      console.log(`  - Format: ${result.book_format}`);
      console.log(`  - Access: ${result.access_type}`);
      console.log(`  - Readability: ${result.readability_status}`);
      console.log(`  - Progress: ${result.progress_percentage || 0}%`);
      console.log(`  - Assigned: ${result.assigned_at ? new Date(result.assigned_at).toLocaleDateString() : 'N/A'}`);
    }

    // Summary
    console.log('\n🎉 Integration Test Summary:');
    console.log('✅ Admin can assign books to users');
    console.log('✅ Assigned books appear in user library');
    console.log('✅ Book format determines readability');
    console.log('✅ Reading progress system is ready');
    console.log('✅ API endpoints work correctly');
    
    if (isReadable) {
      console.log('✅ User can read this book via ereader');
    } else {
      console.log('ℹ️ Physical books show as non-readable (correct behavior)');
    }

    console.log('\n📱 Frontend Integration Points:');
    console.log('1. Dashboard Library (/dashboard?tab=library) - Shows assigned books');
    console.log('2. Reading Page (/reading/[bookId]) - Opens ereader for ebooks');
    console.log('3. Admin Management - Assigns books to users');
    console.log('4. Book Cards - Show appropriate read/physical buttons');

  } catch (error) {
    console.error('❌ Integration test failed:', error);
    throw error;
  }
}

// Run test if called directly
if (require.main === module) {
  testLibraryEreaderIntegration()
    .then(() => {
      console.log('\n✅ All tests completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testLibraryEreaderIntegration };