const { Pool } = require('pg');

async function fixBookDatabaseProduction() {
  console.log('🔧 Fixing book database structure for production...\n');
  
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
    
    // Check if books table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'books'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ Books table does not exist. Creating it...');
      
      // Create books table with all required columns
      await client.query(`
        CREATE TABLE books (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          subtitle VARCHAR(255),
          author_id INTEGER NOT NULL,
          category_id INTEGER NOT NULL,
          isbn VARCHAR(20),
          description TEXT,
          short_description TEXT,
          language VARCHAR(50) DEFAULT 'English',
          pages INTEGER,
          publication_date DATE,
          publisher VARCHAR(255),
          price DECIMAL(10,2) NOT NULL,
          original_price DECIMAL(10,2),
          cost_price DECIMAL(10,2),
          weight_grams INTEGER,
          dimensions JSONB,
          shipping_class VARCHAR(50),
          stock_quantity INTEGER DEFAULT 0,
          low_stock_threshold INTEGER DEFAULT 0,
          inventory_enabled BOOLEAN DEFAULT false,
          cover_image_url VARCHAR(500),
          sample_pdf_url VARCHAR(500),
          ebook_file_url VARCHAR(500),
          audiobook_file_url VARCHAR(500),
          format VARCHAR(20) DEFAULT 'ebook',
          status VARCHAR(20) DEFAULT 'draft',
          is_featured BOOLEAN DEFAULT false,
          is_bestseller BOOLEAN DEFAULT false,
          is_new_release BOOLEAN DEFAULT false,
          seo_title VARCHAR(255),
          seo_description TEXT,
          seo_keywords TEXT,
          view_count INTEGER DEFAULT 0,
          rating DECIMAL(3,2),
          review_count INTEGER DEFAULT 0,
          created_by INTEGER,
          updated_by INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      console.log('✅ Books table created successfully');
    } else {
      console.log('✅ Books table exists');
      
      // Check for missing columns and add them
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
      
      for (const column of requiredColumns) {
        const columnExists = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'books' 
            AND column_name = $1
          );
        `, [column.name]);
        
        if (!columnExists.rows[0].exists) {
          console.log(`🔧 Adding missing column: ${column.name}`);
          await client.query(`ALTER TABLE books ADD COLUMN ${column.name} ${column.type}`);
          console.log(`✅ Added column: ${column.name}`);
        }
      }
    }
    
    // Check if book_formats table exists
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
    }
    
    // Check if book_uploads table exists
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
    }
    
    // Create indexes for better performance
    console.log('🔧 Creating indexes...');
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
      await client.query(indexQuery);
    }
    console.log('✅ Indexes created');
    
    // Add trigger for updated_at
    console.log('🔧 Adding updated_at trigger...');
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    
    await client.query(`
      DROP TRIGGER IF EXISTS update_books_updated_at ON books;
      CREATE TRIGGER update_books_updated_at
          BEFORE UPDATE ON books
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);
    
    await client.query(`
      DROP TRIGGER IF EXISTS update_book_formats_updated_at ON book_formats;
      CREATE TRIGGER update_book_formats_updated_at
          BEFORE UPDATE ON book_formats
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);
    
    await client.query(`
      DROP TRIGGER IF EXISTS update_book_uploads_updated_at ON book_uploads;
      CREATE TRIGGER update_book_uploads_updated_at
          BEFORE UPDATE ON book_uploads
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);
    
    console.log('✅ Updated_at triggers added');
    
    // Test insertion
    console.log('\n🔍 Testing book insertion...');
    const authorResult = await client.query('SELECT id FROM authors LIMIT 1');
    const categoryResult = await client.query('SELECT id FROM categories LIMIT 1');
    
    if (authorResult.rows.length > 0 && categoryResult.rows.length > 0) {
      const testBook = await client.query(`
        INSERT INTO books (
          title, author_id, category_id, price, format, language, 
          stock_quantity, low_stock_threshold, inventory_enabled, 
          cover_image_url, ebook_file_url, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, title
      `, [
        'Test Book ' + Date.now(),
        authorResult.rows[0].id,
        categoryResult.rows[0].id,
        9.99,
        'ebook',
        'English',
        0,
        0,
        false,
        '/media_root/covers/test.jpg',
        '/media_root/ebooks/test.pdf',
        'published'
      ]);
      
      console.log('✅ Test book inserted successfully:', testBook.rows[0].title);
      
      // Clean up
      await client.query('DELETE FROM books WHERE id = $1', [testBook.rows[0].id]);
      console.log('✅ Test book cleaned up');
    }
    
    client.release();
    console.log('\n✅ Book database structure fixed successfully!');
    console.log('📋 You can now try uploading books again.');
    
  } catch (error) {
    console.error('❌ Error fixing book database:', error.message);
    console.error('❌ Error details:', {
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
  } finally {
    await pool.end();
  }
}

fixBookDatabaseProduction().catch(console.error); 