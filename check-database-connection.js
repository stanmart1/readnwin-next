const { Pool } = require('pg');

async function checkDatabaseConnection() {
  console.log('🔍 Checking database connection and book upload issues...\n');
  
  // Test different database configurations
  const configs = [
    {
      name: 'Production Database',
      config: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || '5432'),
        ssl: false
      }
    },
    {
      name: 'Postgres Database (fallback)',
      config: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: 'postgres',
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT || '5432'),
        ssl: false
      }
    }
  ];
  
  for (const { name, config } of configs) {
    console.log(`📋 Testing ${name}...`);
    console.log(`📋 Host: ${config.host}`);
    console.log(`📋 Database: ${config.database}`);
    console.log(`📋 User: ${config.user ? '***SET***' : 'NOT SET'}`);
    console.log(`📋 Password: ${config.password ? '***SET***' : 'NOT SET'}`);
    console.log(`📋 Port: ${config.port}`);
    console.log(`📋 SSL: ${config.ssl}`);
    
    const pool = new Pool(config);
    
    try {
      const client = await pool.connect();
      console.log(`✅ ${name} connection successful!`);
      
      // Check if we can query the database
      const versionResult = await client.query('SELECT version()');
      console.log(`📋 Database version: ${versionResult.rows[0].version.split(' ')[0]} ${versionResult.rows[0].version.split(' ')[1]}`);
      
      // Check if books table exists
      const booksTableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'books'
        );
      `);
      
      if (booksTableExists.rows[0].exists) {
        console.log('✅ Books table exists');
        
        // Check books table structure
        const booksColumns = await client.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'books' 
          ORDER BY ordinal_position
        `);
        
        console.log('📋 Books table columns:');
        booksColumns.rows.forEach(col => {
          console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'} ${col.column_default ? `DEFAULT: ${col.column_default}` : ''}`);
        });
        
        // Check for missing columns that the API needs
        const requiredColumns = [
          'title', 'subtitle', 'author_id', 'category_id', 'isbn', 'description', 
          'short_description', 'language', 'pages', 'publication_date', 'publisher', 
          'price', 'original_price', 'cost_price', 'weight_grams', 'dimensions', 
          'shipping_class', 'stock_quantity', 'low_stock_threshold', 'inventory_enabled', 
          'cover_image_url', 'sample_pdf_url', 'ebook_file_url', 'audiobook_file_url', 
          'status', 'is_featured', 'is_bestseller', 'is_new_release', 'seo_title', 
          'seo_description', 'seo_keywords', 'created_by'
        ];
        
        const existingColumns = booksColumns.rows.map(col => col.column_name);
        const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
        
        if (missingColumns.length > 0) {
          console.log('❌ MISSING COLUMNS:', missingColumns);
        } else {
          console.log('✅ All required columns exist');
        }
        
        // Check book count
        const booksCount = await client.query('SELECT COUNT(*) as count FROM books');
        console.log(`📋 Books count: ${booksCount.rows[0].count}`);
        
      } else {
        console.log('❌ Books table does not exist');
      }
      
      // Check if book_formats table exists
      const formatsTableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'book_formats'
        );
      `);
      
      if (formatsTableExists.rows[0].exists) {
        console.log('✅ Book formats table exists');
      } else {
        console.log('❌ Book formats table does not exist');
      }
      
      // Check if book_uploads table exists
      const uploadsTableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'book_uploads'
        );
      `);
      
      if (uploadsTableExists.rows[0].exists) {
        console.log('✅ Book uploads table exists');
      } else {
        console.log('❌ Book uploads table does not exist');
      }
      
      // Check authors table
      const authorsTableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'authors'
        );
      `);
      
      if (authorsTableExists.rows[0].exists) {
        const authorsCount = await client.query('SELECT COUNT(*) as count FROM authors');
        console.log(`📋 Authors table exists with ${authorsCount.rows[0].count} authors`);
        
        if (authorsCount.rows[0].count === 0) {
          console.log('⚠️ No authors found - this will cause book upload to fail');
        }
      } else {
        console.log('❌ Authors table does not exist');
      }
      
      // Check categories table
      const categoriesTableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'categories'
        );
      `);
      
      if (categoriesTableExists.rows[0].exists) {
        const categoriesCount = await client.query('SELECT COUNT(*) as count FROM categories');
        console.log(`📋 Categories table exists with ${categoriesCount.rows[0].count} categories`);
        
        if (categoriesCount.rows[0].count === 0) {
          console.log('⚠️ No categories found - this will cause book upload to fail');
        }
      } else {
        console.log('❌ Categories table does not exist');
      }
      
      // Check foreign key constraints
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
      if (foreignKeys.rows.length > 0) {
        foreignKeys.rows.forEach(fk => {
          console.log(`   ${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
        });
      } else {
        console.log('   No foreign key constraints found');
      }
      
      // Test a simple query to see if there are any permission issues
      try {
        await client.query('SELECT 1 as test');
        console.log('✅ Basic query permissions OK');
      } catch (permError) {
        console.log('❌ Permission issue:', permError.message);
      }
      
      client.release();
      console.log(`\n✅ ${name} check completed successfully\n`);
      
    } catch (error) {
      console.log(`❌ ${name} connection failed: ${error.message}`);
      console.log(`❌ Error code: ${error.code}`);
      console.log(`❌ Error detail: ${error.detail}`);
      console.log(`❌ Error hint: ${error.hint}`);
      
      if (error.code === 'ECONNREFUSED') {
        console.log('🔧 This suggests the database server is not running or not accessible');
      } else if (error.code === 'ENOTFOUND') {
        console.log('🔧 This suggests the database host cannot be resolved');
      } else if (error.code === '28P01') {
        console.log('🔧 This suggests authentication failed - check username/password');
      } else if (error.code === '3D000') {
        console.log('🔧 This suggests the database does not exist');
      }
      
      console.log('');
    } finally {
      await pool.end();
    }
  }
  
  console.log('📋 Database connection check complete!');
  console.log('📋 Next steps:');
  console.log('   1. Check environment variables are set correctly');
  console.log('   2. Verify database server is running');
  console.log('   3. Check network connectivity to database');
  console.log('   4. Run the comprehensive fix if database is accessible');
}

checkDatabaseConnection().catch(console.error); 