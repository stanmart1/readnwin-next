const { Pool } = require('pg');

async function debugBookDatabase() {
  console.log('🔍 Debugging book database structure...\n');
  
  // Test database connection
  console.log('📋 Testing database connection...');
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
    
    // Check if required tables exist
    console.log('\n📋 Checking required tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('books', 'authors', 'categories', 'book_formats', 'book_uploads')
      ORDER BY table_name
    `);
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    console.log('📋 Existing tables:', existingTables);
    
    // Check books table structure
    if (existingTables.includes('books')) {
      console.log('\n📋 Checking books table structure...');
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
    }
    
    // Check authors table
    if (existingTables.includes('authors')) {
      console.log('\n📋 Checking authors table...');
      const authorsCount = await client.query('SELECT COUNT(*) as count FROM authors');
      console.log('📋 Authors count:', authorsCount.rows[0].count);
      
      if (authorsCount.rows[0].count > 0) {
        const sampleAuthors = await client.query('SELECT id, name FROM authors LIMIT 5');
        console.log('📋 Sample authors:', sampleAuthors.rows);
      }
    }
    
    // Check categories table
    if (existingTables.includes('categories')) {
      console.log('\n📋 Checking categories table...');
      const categoriesCount = await client.query('SELECT COUNT(*) as count FROM categories');
      console.log('📋 Categories count:', categoriesCount.rows[0].count);
      
      if (categoriesCount.rows[0].count > 0) {
        const sampleCategories = await client.query('SELECT id, name FROM categories LIMIT 5');
        console.log('📋 Sample categories:', sampleCategories.rows);
      }
    }
    
    // Check book_formats table
    if (existingTables.includes('book_formats')) {
      console.log('\n📋 Checking book_formats table structure...');
      const formatsColumns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'book_formats' 
        ORDER BY ordinal_position
      `);
      
      console.log('📋 Book formats table columns:');
      formatsColumns.rows.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
      });
    }
    
    // Check book_uploads table
    if (existingTables.includes('book_uploads')) {
      console.log('\n📋 Checking book_uploads table structure...');
      const uploadsColumns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'book_uploads' 
        ORDER BY ordinal_position
      `);
      
      console.log('📋 Book uploads table columns:');
      uploadsColumns.rows.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
      });
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
        AND tc.table_name IN ('books', 'book_formats', 'book_uploads')
    `);
    
    console.log('📋 Foreign key constraints:');
    foreignKeys.rows.forEach(fk => {
      console.log(`   ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
    });
    
    // Test a simple book insertion to see what happens
    console.log('\n📋 Testing book insertion...');
    try {
      // First, get a valid author and category
      const authorResult = await client.query('SELECT id FROM authors LIMIT 1');
      const categoryResult = await client.query('SELECT id FROM categories LIMIT 1');
      
      if (authorResult.rows.length > 0 && categoryResult.rows.length > 0) {
        const authorId = authorResult.rows[0].id;
        const categoryId = categoryResult.rows[0].id;
        
        console.log(`📋 Testing with author_id: ${authorId}, category_id: ${categoryId}`);
        
        // Try to insert a test book
        const testBook = await client.query(`
          INSERT INTO books (
            title, author_id, category_id, price, format, 
            language, stock_quantity, low_stock_threshold, 
            inventory_enabled, status, cover_image_url
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id, title
        `, [
          'Test Book ' + Date.now(),
          authorId,
          categoryId,
          9.99,
          'ebook',
          'English',
          0,
          0,
          false,
          'published',
          '/media_root/covers/test.jpg'
        ]);
        
        console.log('✅ Test book inserted successfully:', testBook.rows[0]);
        
        // Clean up the test book
        await client.query('DELETE FROM books WHERE id = $1', [testBook.rows[0].id]);
        console.log('✅ Test book cleaned up');
        
      } else {
        console.log('❌ No authors or categories found for testing');
      }
      
    } catch (insertError) {
      console.error('❌ Book insertion test failed:', insertError.message);
      console.error('❌ Error details:', {
        code: insertError.code,
        detail: insertError.detail,
        hint: insertError.hint
      });
    }
    
    client.release();
    
  } catch (dbError) {
    console.error('❌ Database connection failed:', dbError.message);
    console.error('❌ Error details:', {
      code: dbError.code,
      detail: dbError.detail,
      hint: dbError.hint
    });
  } finally {
    await pool.end();
  }
  
  console.log('\n✅ Database debug complete!');
  console.log('📋 Next steps:');
  console.log('   1. Check if all required tables exist');
  console.log('   2. Verify table structures are correct');
  console.log('   3. Ensure foreign key constraints are properly set');
  console.log('   4. Check if there are any data validation issues');
}

debugBookDatabase().catch(console.error); 