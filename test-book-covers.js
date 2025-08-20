#!/usr/bin/env node

const { query } = require('./utils/database.js');
const fs = require('fs');
const path = require('path');

async function testBookCovers() {
  console.log('🔍 Testing book cover image functionality...\n');
  
  try {
    // 1. Check database connection
    console.log('1. Testing database connection...');
    const dbTest = await query('SELECT NOW() as current_time');
    console.log('✅ Database connected successfully');
    console.log(`   Current time: ${dbTest.rows[0].current_time}\n`);
    
    // 2. Check recent books and their cover URLs
    console.log('2. Checking recent books and cover URLs...');
    const booksResult = await query(`
      SELECT id, title, cover_image_url, created_at 
      FROM books 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    if (booksResult.rows.length === 0) {
      console.log('⚠️  No books found in database\n');
    } else {
      console.log(`✅ Found ${booksResult.rows.length} recent books:`);
      booksResult.rows.forEach(book => {
        console.log(`   ID: ${book.id}`);
        console.log(`   Title: ${book.title}`);
        console.log(`   Cover URL: ${book.cover_image_url || 'NULL'}`);
        console.log(`   Created: ${book.created_at}`);
        console.log('   ---');
      });
      console.log('');
    }
    
    // 3. Check upload directories
    console.log('3. Checking upload directory structure...');
    const uploadDirs = [
      path.join(process.cwd(), 'public', 'uploads'),
      path.join(process.cwd(), 'public', 'uploads', 'covers'),
      path.join(process.cwd(), 'uploads'),
      path.join(process.cwd(), 'uploads', 'covers'),
      path.join(process.cwd(), 'storage', 'covers')
    ];
    
    uploadDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        console.log(`✅ ${dir} exists (${files.length} files)`);
        if (files.length > 0) {
          console.log(`   Files: ${files.slice(0, 3).join(', ')}${files.length > 3 ? '...' : ''}`);
        }
      } else {
        console.log(`❌ ${dir} does not exist`);
      }
    });
    console.log('');
    
    // 4. Check for placeholder image
    console.log('4. Checking placeholder image...');
    const placeholderPath = path.join(process.cwd(), 'public', 'placeholder-book.jpg');
    if (fs.existsSync(placeholderPath)) {
      console.log('✅ Placeholder image exists');
    } else {
      console.log('❌ Placeholder image missing');
    }
    console.log('');
    
    // 5. Test file serving paths
    console.log('5. Testing file serving configuration...');
    const nextConfig = require('./next.config.js');
    if (nextConfig.async && nextConfig.async.rewrites) {
      console.log('✅ Next.js rewrites configured');
    } else {
      console.log('⚠️  Next.js rewrites may not be configured properly');
    }
    console.log('');
    
    // 6. Check book_files table
    console.log('6. Checking book_files table...');
    try {
      const filesResult = await query(`
        SELECT book_id, file_type, original_filename, file_path, processing_status
        FROM book_files 
        WHERE file_type = 'cover'
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      
      if (filesResult.rows.length === 0) {
        console.log('⚠️  No cover files found in book_files table');
      } else {
        console.log(`✅ Found ${filesResult.rows.length} cover files:`);
        filesResult.rows.forEach(file => {
          console.log(`   Book ID: ${file.book_id}`);
          console.log(`   Original: ${file.original_filename}`);
          console.log(`   Path: ${file.file_path}`);
          console.log(`   Status: ${file.processing_status}`);
          console.log('   ---');
        });
      }
    } catch (error) {
      console.log('⚠️  book_files table may not exist or be accessible');
    }
    console.log('');
    
    console.log('🎉 Book cover test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
  
  process.exit(0);
}

testBookCovers();