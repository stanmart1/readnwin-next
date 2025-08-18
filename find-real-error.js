const { Pool } = require('pg');

async function findRealError() {
  console.log('🔍 Finding the real database error...\n');
  
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
    
    // Check the exact books table structure
    console.log('\n📋 Current books table structure:');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'books' 
      ORDER BY ordinal_position
    `);
    
    const existingColumns = columnsResult.rows.map(col => col.column_name);
    console.log('📋 Existing columns:', existingColumns);
    
    // Check what columns the API is trying to insert
    const apiColumns = [
      'title', 'subtitle', 'author_id', 'category_id', 'isbn', 'description', 
      'short_description', 'language', 'pages', 'publication_date', 'publisher', 
      'price', 'original_price', 'cost_price', 'weight_grams', 'dimensions', 
      'shipping_class', 'stock_quantity', 'low_stock_threshold', 'inventory_enabled', 
      'cover_image_url', 'sample_pdf_url', 'ebook_file_url', 'audiobook_file_url', 
      'status', 'is_featured', 'is_bestseller', 'is_new_release', 'seo_title', 
      'seo_description', 'seo_keywords', 'created_by'
    ];
    
    console.log('\n📋 Columns API is trying to insert:', apiColumns);
    
    // Find missing columns
    const missingColumns = apiColumns.filter(col => !existingColumns.includes(col));
    if (missingColumns.length > 0) {
      console.log('❌ MISSING COLUMNS:', missingColumns);
    } else {
      console.log('✅ All required columns exist');
    }
    
    // Check foreign key constraints
    console.log('\n📋 Checking foreign key constraints...');
    const foreignKeys = await client.query(`
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = 'books'
    `);
    
    console.log('📋 Foreign key constraints:');
    foreignKeys.rows.forEach(fk => {
      console.log(`   ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
    });
    
    // Test with real data from your upload
    console.log('\n🔍 Testing with real upload data...');
    
    // Get valid author and category
    const authorResult = await client.query('SELECT id, name FROM authors LIMIT 1');
    const categoryResult = await client.query('SELECT id, name FROM categories LIMIT 1');
    
    if (authorResult.rows.length === 0 || categoryResult.rows.length === 0) {
      console.log('❌ No authors or categories found - this is the problem!');
      console.log('📋 Creating sample data...');
      
      if (authorResult.rows.length === 0) {
        await client.query(`
          INSERT INTO authors (name, bio, email, website, created_at, updated_at)
          VALUES ('Test Author', 'Test author bio', 'test@example.com', 'https://example.com', NOW(), NOW())
        `);
        console.log('✅ Created test author');
      }
      
      if (categoryResult.rows.length === 0) {
        await client.query(`
          INSERT INTO categories (name, description, slug, parent_id, created_at, updated_at)
          VALUES ('Test Category', 'Test category description', 'test-category', NULL, NOW(), NOW())
        `);
        console.log('✅ Created test category');
      }
      
      // Get the newly created data
      const newAuthorResult = await client.query('SELECT id, name FROM authors LIMIT 1');
      const newCategoryResult = await client.query('SELECT id, name FROM categories LIMIT 1');
      
      console.log(`📋 Using author: ${newAuthorResult.rows[0].name} (ID: ${newAuthorResult.rows[0].id})`);
      console.log(`📋 Using category: ${newCategoryResult.rows[0].name} (ID: ${newCategoryResult.rows[0].id})`);
    } else {
      console.log(`📋 Using author: ${authorResult.rows[0].name} (ID: ${authorResult.rows[0].id})`);
      console.log(`📋 Using category: ${categoryResult.rows[0].name} (ID: ${categoryResult.rows[0].id})`);
    }
    
    // Now test the exact insertion with the data that would come from your upload
    const testData = {
      title: 'Test Book Upload',
      author_id: authorResult.rows[0]?.id || (await client.query('SELECT id FROM authors LIMIT 1')).rows[0].id,
      category_id: categoryResult.rows[0]?.id || (await client.query('SELECT id FROM categories LIMIT 1')).rows[0].id,
      price: 19.99,
      format: 'ebook',
      language: 'English',
      stock_quantity: 0,
      low_stock_threshold: 0,
      inventory_enabled: false,
      cover_image_url: '/media_root/covers/test_cover.jpg',
      ebook_file_url: '/media_root/ebooks/test_ebook.pdf',
      status: 'published'
    };
    
    console.log('\n📋 Test data:', testData);
    
    try {
      // Try the exact query that's failing
      console.log('\n🔍 Attempting exact API insertion...');
      
      const result = await client.query(`
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
        ) RETURNING id, title
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
      
      console.log('✅ INSERTION SUCCESSFUL!');
      console.log('📋 Inserted book:', result.rows[0]);
      
      // Clean up
      await client.query('DELETE FROM books WHERE id = $1', [result.rows[0].id]);
      console.log('✅ Test book cleaned up');
      
      console.log('\n🎉 Database insertion works! The issue must be elsewhere.');
      
    } catch (error) {
      console.error('\n❌ THIS IS THE REAL ERROR:');
      console.error('❌ Error message:', error.message);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error detail:', error.detail);
      console.error('❌ Error hint:', error.hint);
      console.error('❌ Error where:', error.where);
      
      // Provide specific fix based on error type
      if (error.code === '42703') {
        console.log('\n🔧 FIX: Missing column detected');
        console.log('📋 Run: ALTER TABLE books ADD COLUMN [column_name] [data_type];');
      } else if (error.code === '23502') {
        console.log('\n🔧 FIX: NOT NULL constraint violation');
        console.log('📋 Check that all required fields are provided');
      } else if (error.code === '23503') {
        console.log('\n🔧 FIX: Foreign key constraint violation');
        console.log('📋 Check that author_id and category_id exist in their respective tables');
      } else if (error.code === '42P01') {
        console.log('\n🔧 FIX: Table does not exist');
        console.log('📋 Run the table creation script');
      }
    }
    
    client.release();
    
  } catch (dbError) {
    console.error('❌ Database connection failed:', dbError.message);
    console.error('❌ This is likely the root cause of the 500 error!');
  } finally {
    await pool.end();
  }
}

findRealError().catch(console.error); 