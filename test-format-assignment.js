require('dotenv').config();
const { query } = require('./utils/database');

async function testFormatAssignment() {
  try {
    console.log('🔍 Testing Format Assignment System...\n');
    console.log(`📡 Database: ${process.env.DATABASE_URL ? 'Connected via DATABASE_URL' : 'Local PostgreSQL'}\n`);

    // Test database connection first
    await query('SELECT 1 as test');
    console.log('✅ Database connection successful\n');

    // Check user_library table structure
    console.log('📋 Checking user_library table structure:');
    const tableInfo = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'user_library'
      ORDER BY ordinal_position
    `);
    
    tableInfo.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Check constraints
    console.log('\n🔒 Checking constraints:');
    const constraints = await query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints 
      WHERE table_name = 'user_library'
    `);
    
    constraints.rows.forEach(constraint => {
      console.log(`  - ${constraint.constraint_name}: ${constraint.constraint_type}`);
    });

    // Check sample data
    console.log('\n📚 Sample user_library entries:');
    const sampleData = await query(`
      SELECT ul.id, ul.user_id, ul.book_id, 
             COALESCE(ul.format, 'no_format') as format, 
             b.title, b.format as book_format
      FROM user_library ul
      JOIN books b ON ul.book_id = b.id
      ORDER BY ul.id DESC
      LIMIT 5
    `);
    
    if (sampleData.rows.length > 0) {
      sampleData.rows.forEach(row => {
        console.log(`  - User ${row.user_id}: "${row.title}" (Library: ${row.format}, Book: ${row.book_format})`);
      });
    } else {
      console.log('  - No entries found');
    }

    // Check books with different formats
    console.log('\n📖 Books by format:');
    const bookFormats = await query(`
      SELECT COALESCE(format, 'no_format') as format, COUNT(*) as count
      FROM books
      GROUP BY format
      ORDER BY count DESC
    `);
    
    bookFormats.rows.forEach(row => {
      console.log(`  - ${row.format}: ${row.count} books`);
    });

    // Check for format assignment issues
    console.log('\n🔍 Checking for potential issues:');
    const issueCheck = await query(`
      SELECT 
        COUNT(CASE WHEN ul.format IS NULL THEN 1 END) as null_formats,
        COUNT(CASE WHEN ul.format != b.format AND b.format != 'both' THEN 1 END) as mismatched_formats
      FROM user_library ul
      JOIN books b ON ul.book_id = b.id
    `);
    
    const issues = issueCheck.rows[0];
    console.log(`  - NULL formats: ${issues.null_formats}`);
    console.log(`  - Mismatched formats: ${issues.mismatched_formats}`);
    
    console.log('\n✅ Format assignment system check complete!');

  } catch (error) {
    console.error('❌ Error testing format assignment:', error.message || error);
    console.error('💡 Make sure your database is running and .env file is configured correctly');
  } finally {
    if (require.main === module) {
      process.exit(0);
    }
  }
}

// Run the test
if (require.main === module) {
  testFormatAssignment();
}

module.exports = { testFormatAssignment };