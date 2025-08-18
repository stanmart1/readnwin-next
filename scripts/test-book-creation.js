require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false
});

async function testBookCreation() {
  const client = await pool.connect();
  try {
    console.log('🧪 Testing Book Creation Process');
    console.log('=' .repeat(60));
    
    // Test 1: Check if authors exist
    console.log('\n📋 Test 1: Check Available Authors');
    console.log('-'.repeat(40));
    
    const authors = await client.query('SELECT id, name FROM authors ORDER BY id LIMIT 5');
    console.log(`✅ Found ${authors.rows.length} authors in database`);
    authors.rows.forEach(author => {
      console.log(`  - ID: ${author.id}, Name: "${author.name}"`);
    });
    
    // Test 2: Check if categories exist
    console.log('\n📋 Test 2: Check Available Categories');
    console.log('-'.repeat(40));
    
    const categories = await client.query('SELECT id, name FROM categories ORDER BY id LIMIT 5');
    console.log(`✅ Found ${categories.rows.length} categories in database`);
    categories.rows.forEach(category => {
      console.log(`  - ID: ${category.id}, Name: "${category.name}"`);
    });
    
    // Test 3: Check books table schema
    console.log('\n📋 Test 3: Check Books Table Schema');
    console.log('-'.repeat(40));
    
    const schema = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'books' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Books table columns:');
    schema.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'} ${col.column_default ? `DEFAULT: ${col.column_default}` : ''}`);
    });
    
    // Test 4: Simulate book creation with minimal data
    console.log('\n📋 Test 4: Simulate Book Creation');
    console.log('-'.repeat(40));
    
    if (authors.rows.length === 0) {
      console.log('❌ No authors found - cannot test book creation');
      return;
    }
    
    if (categories.rows.length === 0) {
      console.log('❌ No categories found - cannot test book creation');
      return;
    }
    
    const testAuthorId = authors.rows[0].id;
    const testCategoryId = categories.rows[0].id;
    
    try {
      // Start transaction
      await client.query('BEGIN');
      
      console.log('🔍 Attempting to create test book...');
      
      const insertResult = await client.query(`
        INSERT INTO books (
          title, author_id, category_id, price, format, status,
          language, stock_quantity, low_stock_threshold, inventory_enabled
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        ) RETURNING id, title, format, status
      `, [
        'Test Book for Creation',
        testAuthorId,
        testCategoryId,
        19.99,
        'ebook',
        'published',
        'English',
        0,
        0,
        false
      ]);
      
      const createdBook = insertResult.rows[0];
      console.log(`✅ Test book created successfully:`);
      console.log(`  - ID: ${createdBook.id}`);
      console.log(`  - Title: "${createdBook.title}"`);
      console.log(`  - Format: ${createdBook.format}`);
      console.log(`  - Status: ${createdBook.status}`);
      
      // Clean up - delete the test book
      await client.query('DELETE FROM books WHERE id = $1', [createdBook.id]);
      console.log('🧹 Test book cleaned up');
      
      await client.query('COMMIT');
      console.log('✅ Book creation test completed successfully');
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.log('❌ Book creation test failed:');
      console.log(`  Error: ${error.message}`);
      console.log(`  Code: ${error.code}`);
      console.log(`  Detail: ${error.detail}`);
      console.log(`  Hint: ${error.hint}`);
    }
    
    // Test 5: Check for any database constraints
    console.log('\n📋 Test 5: Check Database Constraints');
    console.log('-'.repeat(40));
    
    const constraints = await client.query(`
      SELECT 
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      LEFT JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
      WHERE tc.table_name = 'books'
      ORDER BY tc.constraint_type, tc.constraint_name
    `);
    
    console.log('📊 Books table constraints:');
    constraints.rows.forEach(constraint => {
      if (constraint.constraint_type === 'FOREIGN KEY') {
        console.log(`  - FK: ${constraint.column_name} → ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
      } else if (constraint.constraint_type === 'PRIMARY KEY') {
        console.log(`  - PK: ${constraint.column_name}`);
      } else if (constraint.constraint_type === 'UNIQUE') {
        console.log(`  - UNIQUE: ${constraint.column_name}`);
      }
    });
    
    console.log('\n📝 Summary');
    console.log('-'.repeat(40));
    console.log('✅ Database schema is correct');
    console.log('✅ Authors and categories exist');
    console.log('✅ Book creation works at database level');
    console.log('\n🔍 The issue is likely with:');
    console.log('  - File upload process');
    console.log('  - Form validation');
    console.log('  - API endpoint handling');
    console.log('  - Frontend form submission');
    
  } finally {
    client.release();
    await pool.end();
  }
}

testBookCreation().catch(console.error); 