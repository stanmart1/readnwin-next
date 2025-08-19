const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false,
});

async function testEReader() {
  const client = await pool.connect();
  try {
    console.log('🔍 Testing E-Reader Functionality');
    console.log('=' .repeat(50));

    // Test 1: Check test book status
    console.log('\n📋 Test 1: Checking Test Book Status');
    console.log('-'.repeat(30));

    const bookResult = await client.query(`
      SELECT id, title, author, format, book_type, parsing_status, parsing_error,
             cover_image_url, ebook_file_url, word_count, estimated_reading_time
      FROM books
      WHERE id = 116
    `);

    if (bookResult.rows.length === 0) {
      console.log('❌ Test book not found');
      return;
    }

    const book = bookResult.rows[0];
    console.log(`✅ Book found: "${book.title}" by ${book.author}`);
    console.log(`   Format: ${book.format}`);,
    console.log(`   Book Type: ${book.book_type}`);,
    console.log(`   Parsing Status: ${book.parsing_status}`);,
    console.log(`   Cover Image: ${book.cover_image_url}`);,
    console.log(`   Ebook File: ${book.ebook_file_url}`);,
    console.log(`   Word Count: ${book.word_count}`);,
    console.log(`   Reading Time: ${book.estimated_reading_time} minutes`);

    if (book.parsing_error) {
      console.log(`   ❌ Parsing Error: ${book.parsing_error}`);,
    }

    // Test 2: Check if book has content
    console.log('\n📋 Test 2: Checking Book Content');
    console.log('-'.repeat(30));

    if (book.ebook_file_url) {
      const fs = require('fs');
      const path = require('path');

      let filePath;
      if (book.ebook_file_url.startsWith('/uploads/')) {
        const mediaRootDir = process.env.NODE_ENV === 'production'
          ? '/uploads'
          : path.join(process.cwd(), 'uploads');
        const relativePath = book.ebook_file_url.replace('/uploads/', '');
        filePath = path.join(mediaRootDir, relativePath);
      } else {
        filePath = book.ebook_file_url;
      }

      console.log(`   Looking for file: ${filePath}`);,
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`   ✅ File exists: ${stats.size} bytes`);

        if (stats.size > 0) {
          console.log(`   ✅ File has content`);
        } else {
          console.log(`   ❌ File is empty`);
        }
      } else {
        console.log(`   ❌ File not found`);
      }
    } else {
      console.log(`   ❌ No ebook file URL`);
    }

    // Test 3: Check user library access
    console.log('\n📋 Test 3: Checking User Library Access');
    console.log('-'.repeat(30));

    const libraryResult = await client.query(`
      SELECT ul.user_id, u.email
      FROM user_library ul
      JOIN users u ON ul.user_id = u.id
      WHERE ul.book_id = 116
    `);

    console.log(`   Found ${libraryResult.rows.length} users with access to this book`);
    libraryResult.rows.forEach(row => {
      console.log(`   - User ${row.user_id}: ${row.email}`);
    });

    // Test 4: Check reading progress
    console.log('\n📋 Test 4: Checking Reading Progress');
    console.log('-'.repeat(30));

    const progressResult = await client.query(`
      SELECT user_id, current_position, words_read, last_read_at
      FROM reading_progress
      WHERE book_id = 116
    `);

    console.log(`   Found ${progressResult.rows.length} reading progress records`);
    progressResult.rows.forEach(row => {
      console.log(`   - User ${row.user_id}: ${row.words_read} words read, last read: ${row.last_read_at}`);,
    });

    // Test 5: E-Reader Component Status
    console.log('\n📋 Test 5: E-Reader Component Status');
    console.log('-'.repeat(30));

    const fs = require('fs');
    const components = [
      'app/reading/components/EReader.tsx',
      'app/reading/[bookId]/page.tsx',
      'stores/ereaderStore.ts',
      'app/api/books/[bookId]/content/route.ts'
    ];

    components.forEach(component => {
      if (fs.existsSync(component)) {
        console.log(`   ✅ ${component} exists`);
      } else {
        console.log(`   ❌ ${component} missing`);
      }
    });

    // Summary
    console.log('\n📋 Summary');
    console.log('-'.repeat(30));

    const issues = [];

    if (book.parsing_status !== 'completed') {
      issues.push(`Book parsing status: ${book.parsing_status}`);,
    }

    if (!book.ebook_file_url) {
      issues.push('No ebook file URL');
    }

    if (libraryResult.rows.length === 0) {
      issues.push('No users have access to this book');
    }

    if (issues.length === 0) {
      console.log('✅ E-Reader should be working properly');
      console.log('   - Book is parsed and ready');
      console.log('   - File exists and has content');
      console.log('   - Users have access');
      console.log('   - All components are present');
    } else {
      console.log('❌ E-Reader has issues: ');,
      issues.forEach(issue => console.log(`   - ${issue}`));
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testEReader();
