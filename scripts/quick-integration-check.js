#!/usr/bin/env node

const { query } = require('../utils/database');

async function quickCheck() {
  console.log('🔍 Quick Integration Check...\n');

  try {
    // Check if book_assignments table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'book_assignments'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ book_assignments table missing - run setup script');
      return false;
    }
    console.log('✅ book_assignments table exists');

    // Check user_library columns
    const columnCheck = await query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'user_library' 
      AND column_name IN ('access_type', 'status', 'added_at');
    `);
    
    const hasColumns = columnCheck.rows.length >= 3;
    if (!hasColumns) {
      console.log('❌ user_library missing columns - run setup script');
      return false;
    }
    console.log('✅ user_library has required columns');

    // Check if we have test data
    const booksCount = await query('SELECT COUNT(*) FROM books');
    const usersCount = await query('SELECT COUNT(*) FROM users');
    
    console.log(`📊 Books: ${booksCount.rows[0].count}, Users: ${usersCount.rows[0].count}`);
    
    if (parseInt(booksCount.rows[0].count) === 0) {
      console.log('⚠️ No books found - add some books first');
    }
    
    if (parseInt(usersCount.rows[0].count) === 0) {
      console.log('⚠️ No users found - create some users first');
    }

    console.log('\n✅ Basic integration requirements met');
    return true;

  } catch (error) {
    console.error('❌ Check failed:', error.message);
    return false;
  }
}

if (require.main === module) {
  quickCheck().then(success => {
    if (success) {
      console.log('\n🎉 Ready for integration! You can now:');
      console.log('1. Assign books via admin panel');
      console.log('2. Check user library at /dashboard?tab=library');
      console.log('3. Read ebooks via /reading/[bookId]');
    } else {
      console.log('\n🔧 Run setup first: node scripts/setup-book-assignments.js');
    }
    process.exit(success ? 0 : 1);
  });
}

module.exports = { quickCheck };