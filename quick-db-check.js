require('dotenv').config({ path: '.env.local' });

async function quickDatabaseCheck() {
  console.log('🔍 Quick Database Check for Book Uploads');
  console.log('=' .repeat(50));
  
  const { Pool } = require('pg');
  
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'postgres',
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: false
  });
  
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Check authors
    const authorsResult = await client.query('SELECT COUNT(*) as count FROM authors');
    const authorCount = parseInt(authorsResult.rows[0].count);
    console.log(`📚 Authors: ${authorCount} found`);
    
    // Check categories
    const categoriesResult = await client.query('SELECT COUNT(*) as count FROM categories');
    const categoryCount = parseInt(categoriesResult.rows[0].count);
    console.log(`📂 Categories: ${categoryCount} found`);
    
    // Check books
    const booksResult = await client.query('SELECT COUNT(*) as count FROM books');
    const bookCount = parseInt(booksResult.rows[0].count);
    console.log(`📖 Books: ${bookCount} found`);
    
    console.log('\n📋 Database Status:');
    console.log('-'.repeat(30));
    
    if (authorCount === 0) {
      console.log('❌ NO AUTHORS - Book upload will fail!');
      console.log('💡 You need at least one author to upload books');
    } else {
      console.log('✅ Authors available');
    }
    
    if (categoryCount === 0) {
      console.log('❌ NO CATEGORIES - Book upload will fail!');
      console.log('💡 You need at least one category to upload books');
    } else {
      console.log('✅ Categories available');
    }
    
    if (authorCount > 0 && categoryCount > 0) {
      console.log('✅ Database prerequisites are met for book uploads');
      console.log('💡 Book uploads should work correctly');
    } else {
      console.log('❌ Database prerequisites are NOT met');
      console.log('');
      console.log('🔧 Quick Fix Commands:');
      console.log('');
      if (authorCount === 0) {
        console.log('-- Add a test author:');
        console.log("INSERT INTO authors (name, email, bio) VALUES ('Test Author', 'test@example.com', 'Test author bio');");
        console.log('');
      }
      if (categoryCount === 0) {
        console.log('-- Add a test category:');
        console.log("INSERT INTO categories (name, description) VALUES ('Test Category', 'Test category description');");
        console.log('');
      }
    }
    
    // Show sample data
    if (authorCount > 0) {
      const sampleAuthor = await client.query('SELECT id, name FROM authors ORDER BY id LIMIT 1');
      console.log(`📝 Sample author: ${sampleAuthor.rows[0].id} - ${sampleAuthor.rows[0].name}`);
    }
    
    if (categoryCount > 0) {
      const sampleCategory = await client.query('SELECT id, name FROM categories ORDER BY id LIMIT 1');
      console.log(`📝 Sample category: ${sampleCategory.rows[0].id} - ${sampleCategory.rows[0].name}`);
    }
    
    client.release();
    
  } catch (error) {
    console.log(`❌ Database connection failed: ${error.message}`);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check environment variables in .env.local');
    console.log('2. Verify database server is running');
    console.log('3. Check network connectivity');
  } finally {
    await pool.end();
  }
}

quickDatabaseCheck().catch(console.error); 