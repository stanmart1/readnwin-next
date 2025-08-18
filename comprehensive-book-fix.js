const { Pool } = require('pg');

async function comprehensiveBookFix() {
  console.log('🔧 Comprehensive book upload fix for production...\n');
  
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
    
    // Step 1: Ensure books table has all required columns
    console.log('\n📋 Step 1: Checking books table structure...');
    
    const booksColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'books' 
      ORDER BY ordinal_position
    `);
    
    const existingColumns = booksColumns.rows.map(col => col.column_name);
    console.log('📋 Existing columns:', existingColumns);
    
    // Required columns for the API
    const requiredColumns = [
      { name: 'subtitle', type: 'VARCHAR(255)' },
      { name: 'short_description', type: 'TEXT' },
      { name: 'original_price', type: 'DECIMAL(10,2)' },
      { name: 'cost_price', type: 'DECIMAL(10,2)' },
      { name: 'weight_grams', type: 'INTEGER' },
      { name: 'dimensions', type: 'JSONB' },
      { name: 'shipping_class', type: 'VARCHAR(50)' },
      { name: 'sample_pdf_url', type: 'VARCHAR(500)' },
      { name: 'audiobook_file_url', type: 'VARCHAR(500)' },
      { name: 'is_featured', type: 'BOOLEAN DEFAULT false' },
      { name: 'is_bestseller', type: 'BOOLEAN DEFAULT false' },
      { name: 'is_new_release', type: 'BOOLEAN DEFAULT false' },
      { name: 'seo_title', type: 'VARCHAR(255)' },
      { name: 'seo_description', type: 'TEXT' },
      { name: 'seo_keywords', type: 'TEXT' },
      { name: 'view_count', type: 'INTEGER DEFAULT 0' },
      { name: 'rating', type: 'DECIMAL(3,2)' },
      { name: 'review_count', type: 'INTEGER DEFAULT 0' },
      { name: 'created_by', type: 'INTEGER' },
      { name: 'updated_by', type: 'INTEGER' }
    ];
    
    // Add missing columns
    for (const column of requiredColumns) {
      if (!existingColumns.includes(column.name)) {
        console.log(`🔧 Adding missing column: ${column.name}`);
        try {
          await client.query(`ALTER TABLE books ADD COLUMN ${column.name} ${column.type}`);
          console.log(`✅ Added column: ${column.name}`);
        } catch (error) {
          console.log(`⚠️ Column ${column.name} might already exist or have issues: ${error.message}`);
        }
      }
    }
    
    // Step 2: Ensure book_formats table exists
    console.log('\n📋 Step 2: Checking book_formats table...');
    
    const formatsTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'book_formats'
      );
    `);
    
    if (!formatsTableExists.rows[0].exists) {
      console.log('🔧 Creating book_formats table...');
      await client.query(`
        CREATE TABLE book_formats (
          id SERIAL PRIMARY KEY,
          book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
          format VARCHAR(20) NOT NULL,
          file_url VARCHAR(500),
          file_size INTEGER,
          file_type VARCHAR(100),
          is_available BOOLEAN DEFAULT true,
          price DECIMAL(10,2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Book formats table created');
    } else {
      console.log('✅ Book formats table exists');
    }
    
    // Step 3: Ensure book_uploads table exists
    console.log('\n📋 Step 3: Checking book_uploads table...');
    
    const uploadsTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'book_uploads'
      );
    `);
    
    if (!uploadsTableExists.rows[0].exists) {
      console.log('🔧 Creating book_uploads table...');
      await client.query(`
        CREATE TABLE book_uploads (
          id SERIAL PRIMARY KEY,
          book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
          upload_type VARCHAR(20) NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          file_size INTEGER NOT NULL,
          mime_type VARCHAR(100) NOT NULL,
          upload_status VARCHAR(20) DEFAULT 'pending',
          processing_metadata JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Book uploads table created');
    } else {
      console.log('✅ Book uploads table exists');
    }
    
    // Step 4: Ensure authors and categories exist
    console.log('\n📋 Step 4: Checking authors and categories...');
    
    const authorsCount = await client.query('SELECT COUNT(*) as count FROM authors');
    const categoriesCount = await client.query('SELECT COUNT(*) as count FROM categories');
    
    console.log(`📋 Authors count: ${authorsCount.rows[0].count}`);
    console.log(`📋 Categories count: ${categoriesCount.rows[0].count}`);
    
    if (authorsCount.rows[0].count === 0) {
      console.log('🔧 Creating sample author...');
      await client.query(`
        INSERT INTO authors (name, bio, email, website, created_at, updated_at)
        VALUES ('Default Author', 'Default author for testing', 'author@example.com', 'https://example.com', NOW(), NOW())
      `);
      console.log('✅ Sample author created');
    }
    
    if (categoriesCount.rows[0].count === 0) {
      console.log('🔧 Creating sample category...');
      await client.query(`
        INSERT INTO categories (name, description, slug, parent_id, created_at, updated_at)
        VALUES ('Default Category', 'Default category for testing', 'default-category', NULL, NOW(), NOW())
      `);
      console.log('✅ Sample category created');
    }
    
    // Step 5: Create indexes for performance
    console.log('\n📋 Step 5: Creating indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_books_author ON books(author_id)',
      'CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id)',
      'CREATE INDEX IF NOT EXISTS idx_books_status ON books(status)',
      'CREATE INDEX IF NOT EXISTS idx_books_format ON books(format)',
      'CREATE INDEX IF NOT EXISTS idx_books_price ON books(price)',
      'CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_book_formats_book_id ON book_formats(book_id)',
      'CREATE INDEX IF NOT EXISTS idx_book_uploads_book_id ON book_uploads(book_id)'
    ];
    
    for (const indexQuery of indexes) {
      try {
        await client.query(indexQuery);
      } catch (error) {
        console.log(`⚠️ Index might already exist: ${error.message}`);
      }
    }
    console.log('✅ Indexes created');
    
    // Step 6: Add updated_at triggers
    console.log('\n📋 Step 6: Adding updated_at triggers...');
    
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    
    const triggers = [
      'DROP TRIGGER IF EXISTS update_books_updated_at ON books; CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      'DROP TRIGGER IF EXISTS update_book_formats_updated_at ON book_formats; CREATE TRIGGER update_book_formats_updated_at BEFORE UPDATE ON book_formats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      'DROP TRIGGER IF EXISTS update_book_uploads_updated_at ON book_uploads; CREATE TRIGGER update_book_uploads_updated_at BEFORE UPDATE ON book_uploads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();'
    ];
    
    for (const triggerQuery of triggers) {
      try {
        await client.query(triggerQuery);
      } catch (error) {
        console.log(`⚠️ Trigger might already exist: ${error.message}`);
      }
    }
    console.log('✅ Updated_at triggers added');
    
    // Step 7: Test the complete insertion
    console.log('\n📋 Step 7: Testing complete book insertion...');
    
    const authorId = await client.query('SELECT id FROM authors LIMIT 1');
    const categoryId = await client.query('SELECT id FROM categories LIMIT 1');
    
    if (authorId.rows.length > 0 && categoryId.rows.length > 0) {
      try {
        // Test the exact insertion that the API would do
        const testBook = await client.query(`
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
          'Test Book ' + Date.now(),
          null, authorId.rows[0].id, categoryId.rows[0].id, null, null, null, 'English',
          null, null, null, 9.99, null, null, null, null, null, 0, 0, false,
          '/media_root/covers/test.jpg', null, '/media_root/ebooks/test.epub', null,
          'published', false, false, false, null, null, null, null
        ]);
        
        console.log('✅ Complete book insertion successful:', testBook.rows[0].title);
        
        // Test book_formats insertion
        await client.query(`
          INSERT INTO book_formats (book_id, format, file_url, file_size, file_type, is_available)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [testBook.rows[0].id, 'ebook', '/media_root/ebooks/test.epub', 1024000, 'application/epub+zip', true]);
        
        console.log('✅ Book formats insertion successful');
        
        // Clean up
        await client.query('DELETE FROM book_formats WHERE book_id = $1', [testBook.rows[0].id]);
        await client.query('DELETE FROM books WHERE id = $1', [testBook.rows[0].id]);
        console.log('✅ Test data cleaned up');
        
        console.log('\n🎉 ALL TESTS PASSED! Book upload should now work.');
        
      } catch (testError) {
        console.error('❌ Test insertion failed:', testError.message);
        console.error('❌ Error details:', {
          code: testError.code,
          detail: testError.detail,
          hint: testError.hint
        });
      }
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error during comprehensive fix:', error.message);
    console.error('❌ Error details:', {
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
  } finally {
    await pool.end();
  }
  
  console.log('\n✅ Comprehensive book fix complete!');
  console.log('📋 Next steps:');
  console.log('   1. Try uploading a book again');
  console.log('   2. Check if the 500 error is resolved');
  console.log('   3. Verify EPUB files upload correctly');
}

comprehensiveBookFix().catch(console.error); 