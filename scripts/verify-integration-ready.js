#!/usr/bin/env node

/**
 * Minimal verification that the integration will work
 */

async function verifyIntegration() {
  console.log('🔍 Verifying Integration Setup...\n');

  try {
    // Test 1: Database connection
    const { query } = require('../utils/database');
    await query('SELECT 1');
    console.log('✅ Database connection works');

    // Test 2: Check required tables
    const tables = ['books', 'users', 'user_library'];
    for (const table of tables) {
      const result = await query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`✅ ${table} table: ${result.rows[0].count} records`);
    }

    // Test 3: Check if book_assignments exists (will be created by setup)
    try {
      await query('SELECT COUNT(*) FROM book_assignments');
      console.log('✅ book_assignments table exists');
    } catch {
      console.log('⚠️ book_assignments table missing (will be created by setup)');
    }

    // Test 4: Check API imports
    try {
      const { ecommerceService } = require('../utils/ecommerce-service-new');
      console.log('✅ ecommerceService imports correctly');
    } catch (error) {
      console.log('❌ ecommerceService import failed:', error.message);
      return false;
    }

    // Test 5: Check if we have sample data
    const bookResult = await query("SELECT id, title, format FROM books WHERE format IN ('ebook', 'hybrid') LIMIT 1");
    const userResult = await query("SELECT id, email FROM users WHERE role != 'super_admin' LIMIT 1");
    
    if (bookResult.rows.length === 0) {
      console.log('⚠️ No ebooks found - create some ebooks for testing');
    } else {
      console.log(`✅ Sample ebook: ${bookResult.rows[0].title} (${bookResult.rows[0].format})`);
    }
    
    if (userResult.rows.length === 0) {
      console.log('⚠️ No users found - create some users for testing');
    } else {
      console.log(`✅ Sample user: ${userResult.rows[0].email}`);
    }

    console.log('\n🎯 Integration Status: READY');
    console.log('\n📋 Next Steps:');
    console.log('1. Run: node scripts/setup-book-assignments.js');
    console.log('2. Test assignment via admin panel');
    console.log('3. Check user library at /dashboard?tab=library');
    
    return true;

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

if (require.main === module) {
  verifyIntegration().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { verifyIntegration };