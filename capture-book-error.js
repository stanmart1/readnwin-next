const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function captureBookError() {
  console.log('🔍 Capturing actual book upload error...\n');
  
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: false
  });

  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // First, let's check what's actually in the books table
    console.log('\n📋 Checking books table structure...');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'books' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Books table columns:');
    columnsResult.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'} ${col.column_default ? `DEFAULT: ${col.column_default}` : ''}`);
    });
    
    // Check if we have authors and categories
    console.log('\n📋 Checking authors and categories...');
    const authorsResult = await client.query('SELECT COUNT(*) as count FROM authors');
    const categoriesResult = await client.query('SELECT COUNT(*) as count FROM categories');
    
    console.log(`📋 Authors count: ${authorsResult.rows[0].count}`);
    console.log(`📋 Categories count: ${categoriesResult.rows[0].count}`);
    
    if (authorsResult.rows[0].count === 0 || categoriesResult.rows[0].count === 0) {
      console.log('❌ No authors or categories found - this could be the issue!');
      console.log('📋 Creating sample data...');
      
      // Create sample author if none exists
      if (authorsResult.rows[0].count === 0) {
        await client.query(`
          INSERT INTO authors (name, bio, email, website, created_at, updated_at)
          VALUES ('Sample Author', 'A sample author for testing', 'author@example.com', 'https://example.com', NOW(), NOW())
        `);
        console.log('✅ Created sample author');
      }
      
      // Create sample category if none exists
      if (categoriesResult.rows[0].count === 0) {
        await client.query(`
          INSERT INTO categories (name, description, slug, parent_id, created_at, updated_at)
          VALUES ('Sample Category', 'A sample category for testing', 'sample-category', NULL, NOW(), NOW())
        `);
        console.log('✅ Created sample category');
      }
    }
    
    // Now let's try the exact insertion that the API would do
    console.log('\n🔍 Testing exact API insertion...');
    
    const authorId = await client.query('SELECT id FROM authors LIMIT 1');
    const categoryId = await client.query('SELECT id FROM categories LIMIT 1');
    
    if (authorId.rows.length === 0 || categoryId.rows.length === 0) {
      console.log('❌ Still no authors or categories available');
      client.release();
      return;
    }
    
    const testData = {
      title: 'Test Book ' + Date.now(),
      author_id: authorId.rows[0].id,
      category_id: categoryId.rows[0].id,
      price: 9.99,
      format: 'ebook',
      language: 'English',
      stock_quantity: 0,
      low_stock_threshold: 0,
      inventory_enabled: false,
      cover_image_url: '/media_root/covers/test_cover.jpg',
      ebook_file_url: '/media_root/ebooks/test_ebook.pdf',
      status: 'published'
    };
    
    console.log('📋 Test data:', testData);
    
    try {
      // Try the exact query from the enhanced book service
      console.log('\n🔍 Attempting book insertion...');
      
      const bookResult = await client.query(`
        INSERT INTO books (
          title, subtitle, author_id, category_id, isbn, description, short_description,
          language, pages, publication_date, publisher, price, original_price, cost_price,
          weight_grams, dimensions, shipping_class, stock_quantity, low_stock_threshold,
          inventory_enabled, cover_image_url, sample_pdf_url, ebook_file_url, audiobook_file_url,
          status, is_featured, is_bestseller, is_new_release, seo_title, seo_description,
          seo_keywords, created_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32
        ) RETURNING id, title, status
      `, [
        testData.title,           // $1
        null,                     // $2 subtitle
        testData.author_id,       // $3
        testData.category_id,     // $4
        null,                     // $5 isbn
        null,                     // $6 description
        null,                     // $7 short_description
        testData.language,        // $8
        null,                     // $9 pages
        null,                     // $10 publication_date
        null,                     // $11 publisher
        testData.price,           // $12
        null,                     // $13 original_price
        null,                     // $14 cost_price
        null,                     // $15 weight_grams
        null,                     // $16 dimensions
        null,                     // $17 shipping_class
        testData.stock_quantity,  // $18
        testData.low_stock_threshold, // $19
        testData.inventory_enabled,   // $20
        testData.cover_image_url,     // $21
        null,                     // $22 sample_pdf_url
        testData.ebook_file_url,      // $23
        null,                     // $24 audiobook_file_url
        testData.status,          // $25
        false,                    // $26 is_featured
        false,                    // $27 is_bestseller
        false,                    // $28 is_new_release
        null,                     // $29 seo_title
        null,                     // $30 seo_description
        null,                     // $31 seo_keywords
        null                      // $32 created_by
      ]);
      
      console.log('✅ Book inserted successfully!');
      console.log('📋 Inserted book:', bookResult.rows[0]);
      
      // Clean up
      await client.query('DELETE FROM books WHERE id = $1', [bookResult.rows[0].id]);
      console.log('✅ Test book cleaned up');
      
      console.log('\n🎉 Database insertion works fine!');
      console.log('📋 The issue might be in the API route itself or authentication.');
      
    } catch (insertError) {
      console.error('❌ BOOK INSERTION FAILED!');
      console.error('❌ This is the actual error:');
      console.error('❌ Error message:', insertError.message);
      console.error('❌ Error code:', insertError.code);
      console.error('❌ Error detail:', insertError.detail);
      console.error('❌ Error hint:', insertError.hint);
      console.error('❌ Error where:', insertError.where);
      console.error('❌ Error schema:', insertError.schema);
      console.error('❌ Error table:', insertError.table);
      console.error('❌ Error column:', insertError.column);
      console.error('❌ Error dataType:', insertError.dataType);
      console.error('❌ Error constraint:', insertError.constraint);
      
      // Check for specific error types
      if (insertError.code === '23502') {
        console.log('\n🔍 This is a NOT NULL constraint violation!');
        console.log('📋 A required column is missing a value.');
      } else if (insertError.code === '23503') {
        console.log('\n🔍 This is a foreign key constraint violation!');
        console.log('📋 The author_id or category_id does not exist in the referenced table.');
      } else if (insertError.code === '42703') {
        console.log('\n🔍 This is an undefined column error!');
        console.log('📋 A column in the INSERT statement does not exist in the table.');
      } else if (insertError.code === '42P01') {
        console.log('\n🔍 This is an undefined table error!');
        console.log('📋 The books table does not exist.');
      }
    }
    
    client.release();
    
  } catch (dbError) {
    console.error('❌ Database connection failed:', dbError.message);
    console.error('❌ This could be the root cause of the 500 error!');
  } finally {
    await pool.end();
  }
  
  console.log('\n📋 Next steps:');
  console.log('   1. Check the server logs for the actual error');
  console.log('   2. Verify the API route is working');
  console.log('   3. Check authentication and permissions');
  console.log('   4. Test the API endpoint directly');
}

captureBookError().catch(console.error); 