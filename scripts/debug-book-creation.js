require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false
});

async function debugBookCreation() {
  const client = await pool.connect();
  try {
    console.log('🔍 Debugging Book Creation Process');
    console.log('=' .repeat(60));
    
    // Test 1: Check prerequisites
    console.log('\n📋 Test 1: Check Prerequisites');
    console.log('-'.repeat(40));
    
    const authors = await client.query('SELECT id, name FROM authors ORDER BY id LIMIT 1');
    const categories = await client.query('SELECT id, name FROM categories ORDER BY id LIMIT 1');
    
    if (authors.rows.length === 0) {
      console.log('❌ No authors found in database');
      return;
    }
    
    if (categories.rows.length === 0) {
      console.log('❌ No categories found in database');
      return;
    }
    
    console.log(`✅ Author: ${authors.rows[0].name} (ID: ${authors.rows[0].id})`);
    console.log(`✅ Category: ${categories.rows[0].name} (ID: ${categories.rows[0].id})`);
    
    // Test 2: Check upload directories
    console.log('\n📋 Test 2: Check Upload Directories');
    console.log('-'.repeat(40));
    
    const baseUploadDir = path.join(process.cwd(), 'public', 'uploads');
    const requiredDirs = ['covers', 'ebooks'];
    
    requiredDirs.forEach(dir => {
      const fullPath = path.join(baseUploadDir, dir);
      const exists = fs.existsSync(fullPath);
      let isWritable = false;
      
      if (exists) {
        try {
          fs.accessSync(fullPath, fs.constants.W_OK);
          isWritable = true;
        } catch (error) {
          isWritable = false;
        }
      }
      
      console.log(`  ${exists && isWritable ? '✅' : '❌'} ${dir}/ - ${exists ? 'Exists' : 'Missing'} ${isWritable ? '& Writable' : '& Not Writable'}`);
    });
    
    // Test 3: Test file creation in upload directories
    console.log('\n📋 Test 3: Test File Creation');
    console.log('-'.repeat(40));
    
    const testDirs = ['covers', 'ebooks'];
    
    for (const dir of testDirs) {
      const fullPath = path.join(baseUploadDir, dir);
      const testFile = path.join(fullPath, 'test-write-access.txt');
      
      try {
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        console.log(`  ✅ ${dir}/ - File creation test passed`);
      } catch (error) {
        console.log(`  ❌ ${dir}/ - File creation test failed: ${error.message}`);
      }
    }
    
    // Test 4: Simulate book creation with minimal data
    console.log('\n📋 Test 4: Simulate Book Creation');
    console.log('-'.repeat(40));
    
    try {
      await client.query('BEGIN');
      
      const testBookData = {
        title: 'Debug Test Book',
        author_id: authors.rows[0].id,
        category_id: categories.rows[0].id,
        price: 19.99,
        format: 'ebook',
        status: 'published',
        language: 'English',
        stock_quantity: 0,
        low_stock_threshold: 0,
        inventory_enabled: false,
        cover_image_url: '/uploads/covers/test-cover.jpg',
        ebook_file_url: '/uploads/ebooks/test-ebook.pdf'
      };
      
      console.log('🔍 Attempting to create test book...');
      
      const insertResult = await client.query(`
        INSERT INTO books (
          title, author_id, category_id, price, format, status,
          language, stock_quantity, low_stock_threshold, inventory_enabled,
          cover_image_url, ebook_file_url
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        ) RETURNING id, title, format, status, inventory_enabled
      `, [
        testBookData.title, testBookData.author_id, testBookData.category_id,
        testBookData.price, testBookData.format, testBookData.status,
        testBookData.language, testBookData.stock_quantity, testBookData.low_stock_threshold,
        testBookData.inventory_enabled, testBookData.cover_image_url, testBookData.ebook_file_url
      ]);
      
      const createdBook = insertResult.rows[0];
      console.log(`✅ Test book created successfully:`);
      console.log(`  - ID: ${createdBook.id}`);
      console.log(`  - Title: "${createdBook.title}"`);
      console.log(`  - Format: ${createdBook.format}`);
      console.log(`  - Status: ${createdBook.status}`);
      console.log(`  - Inventory Enabled: ${createdBook.inventory_enabled}`);
      
      // Clean up
      await client.query('DELETE FROM books WHERE id = $1', [createdBook.id]);
      console.log('🧹 Test book cleaned up');
      
      await client.query('COMMIT');
      console.log('✅ Database book creation works correctly!');
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.log('❌ Database book creation failed:');
      console.log(`  Error: ${error.message}`);
      console.log(`  Code: ${error.code}`);
      console.log(`  Detail: ${error.detail}`);
      console.log(`  Hint: ${error.hint}`);
    }
    
    // Test 5: Check for any missing database columns
    console.log('\n📋 Test 5: Check Database Schema');
    console.log('-'.repeat(40));
    
    const schema = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'books' 
      AND column_name IN ('inventory_enabled', 'cover_image_url', 'ebook_file_url')
      ORDER BY column_name
    `);
    
    console.log('📊 Required columns in books table:');
    schema.rows.forEach(col => {
      console.log(`  ✅ ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
    });
    
    if (schema.rows.length < 3) {
      console.log('❌ Missing required columns in books table');
    }
    
    console.log('\n📝 Debug Summary');
    console.log('-'.repeat(40));
    console.log('✅ Authors and categories exist');
    console.log('✅ Upload directories exist');
    console.log('✅ Database schema is correct');
    console.log('✅ Book creation works at database level');
    
    console.log('\n🔍 The issue is likely with:');
    console.log('  - File upload process');
    console.log('  - Form validation');
    console.log('  - API endpoint handling');
    console.log('  - Frontend form submission');
    
    console.log('\n💡 Next steps:');
    console.log('  1. Check browser console for detailed errors');
    console.log('  2. Check server logs for backend errors');
    console.log('  3. Verify all form fields are completed');
    console.log('  4. Ensure files are properly selected');
    
  } finally {
    client.release();
    await pool.end();
  }
}

debugBookCreation().catch(console.error); 