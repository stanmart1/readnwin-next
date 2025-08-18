require('dotenv').config({ path: '.env.local' });

async function verifyDatabasePrerequisites() {
  console.log('🔍 Verifying Database Prerequisites');
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
    
    // Test 1: Check authors table
    console.log('\n📚 Test 1: Authors Table');
    console.log('-'.repeat(30));
    
    try {
      const authorsResult = await client.query('SELECT COUNT(*) as count FROM authors');
      const authorCount = parseInt(authorsResult.rows[0].count);
      console.log(`📊 Total authors: ${authorCount}`);
      
      if (authorCount === 0) {
        console.log('❌ No authors found - book upload will fail!');
        console.log('💡 You need at least one author to upload books');
      } else if (authorCount < 5) {
        console.log('⚠️ Very few authors - consider adding more');
      } else {
        console.log('✅ Sufficient authors available');
      }
      
      // Show first 5 authors
      const sampleAuthors = await client.query('SELECT id, name, email FROM authors ORDER BY id LIMIT 5');
      console.log('📋 Sample authors:');
      sampleAuthors.rows.forEach(author => {
        console.log(`  ${author.id}: ${author.name} (${author.email})`);
      });
      
    } catch (error) {
      console.log(`❌ Error checking authors: ${error.message}`);
    }
    
    // Test 2: Check categories table
    console.log('\n📂 Test 2: Categories Table');
    console.log('-'.repeat(30));
    
    try {
      const categoriesResult = await client.query('SELECT COUNT(*) as count FROM categories');
      const categoryCount = parseInt(categoriesResult.rows[0].count);
      console.log(`📊 Total categories: ${categoryCount}`);
      
      if (categoryCount === 0) {
        console.log('❌ No categories found - book upload will fail!');
        console.log('💡 You need at least one category to upload books');
      } else if (categoryCount < 3) {
        console.log('⚠️ Very few categories - consider adding more');
      } else {
        console.log('✅ Sufficient categories available');
      }
      
      // Show first 5 categories
      const sampleCategories = await client.query('SELECT id, name, description FROM categories ORDER BY id LIMIT 5');
      console.log('📋 Sample categories:');
      sampleCategories.rows.forEach(category => {
        console.log(`  ${category.id}: ${category.name} - ${category.description || 'No description'}`);
      });
      
    } catch (error) {
      console.log(`❌ Error checking categories: ${error.message}`);
    }
    
    // Test 3: Check books table structure
    console.log('\n📖 Test 3: Books Table Structure');
    console.log('-'.repeat(30));
    
    try {
      const booksColumns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'books' 
        AND column_name IN ('id', 'title', 'author_id', 'category_id', 'price', 'format', 'cover_image_url', 'ebook_file_url', 'inventory_enabled', 'stock_quantity')
        ORDER BY column_name
      `);
      
      console.log('📋 Required book columns:');
      booksColumns.rows.forEach(col => {
        const nullable = col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`  ${col.column_name}: ${col.data_type}${nullable}${defaultVal}`);
      });
      
      // Check if all required columns exist
      const requiredColumns = ['title', 'author_id', 'category_id', 'price'];
      const existingColumns = booksColumns.rows.map(col => col.column_name);
      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log(`❌ Missing required columns: ${missingColumns.join(', ')}`);
      } else {
        console.log('✅ All required book columns exist');
      }
      
    } catch (error) {
      console.log(`❌ Error checking books table: ${error.message}`);
    }
    
    // Test 4: Check existing books
    console.log('\n📚 Test 4: Existing Books');
    console.log('-'.repeat(30));
    
    try {
      const booksResult = await client.query('SELECT COUNT(*) as count FROM books');
      const bookCount = parseInt(booksResult.rows[0].count);
      console.log(`📊 Total books: ${bookCount}`);
      
      if (bookCount > 0) {
        // Show sample books with their authors and categories
        const sampleBooks = await client.query(`
          SELECT b.id, b.title, b.price, b.format, 
                 a.name as author_name, c.name as category_name
          FROM books b
          LEFT JOIN authors a ON b.author_id = a.id
          LEFT JOIN categories c ON b.category_id = c.id
          ORDER BY b.id DESC
          LIMIT 5
        `);
        
        console.log('📋 Recent books:');
        sampleBooks.rows.forEach(book => {
          console.log(`  ${book.id}: "${book.title}" by ${book.author_name || 'Unknown'} (${book.category_name || 'Uncategorized'}) - $${book.price} [${book.format}]`);
        });
      } else {
        console.log('📝 No books found - this is normal for a new system');
      }
      
    } catch (error) {
      console.log(`❌ Error checking books: ${error.message}`);
    }
    
    // Test 5: Check foreign key constraints
    console.log('\n🔗 Test 5: Foreign Key Constraints');
    console.log('-'.repeat(30));
    
    try {
      const constraints = await client.query(`
        SELECT 
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'books'
      `);
      
      console.log('🔗 Book table foreign keys:');
      constraints.rows.forEach(constraint => {
        console.log(`  ${constraint.column_name} → ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
      });
      
    } catch (error) {
      console.log(`❌ Error checking constraints: ${error.message}`);
    }
    
    // Test 6: Test data integrity
    console.log('\n🔍 Test 6: Data Integrity Check');
    console.log('-'.repeat(30));
    
    try {
      // Check for orphaned books (books with non-existent authors or categories)
      const orphanedBooks = await client.query(`
        SELECT b.id, b.title, b.author_id, b.category_id
        FROM books b
        LEFT JOIN authors a ON b.author_id = a.id
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE a.id IS NULL OR c.id IS NULL
      `);
      
      if (orphanedBooks.rows.length > 0) {
        console.log(`⚠️ Found ${orphanedBooks.rows.length} books with missing authors or categories:`);
        orphanedBooks.rows.forEach(book => {
          console.log(`  Book ${book.id}: "${book.title}" (author_id: ${book.author_id}, category_id: ${book.category_id})`);
        });
      } else {
        console.log('✅ No orphaned books found');
      }
      
    } catch (error) {
      console.log(`❌ Error checking data integrity: ${error.message}`);
    }
    
    client.release();
    
    console.log('\n📋 Summary & Recommendations');
    console.log('-'.repeat(40));
    console.log('Based on the database check:');
    console.log('');
    
    // Provide recommendations based on the counts we found
    const recommendations = [];
    
    // Get the counts from the variables we found earlier
    const authorsResult = await client.query('SELECT COUNT(*) as count FROM authors');
    const categoriesResult = await client.query('SELECT COUNT(*) as count FROM categories');
    const authorCount = parseInt(authorsResult.rows[0].count);
    const categoryCount = parseInt(categoriesResult.rows[0].count);
    
    if (authorCount === 0) {
      recommendations.push('❌ Add at least one author to the database');
    }
    
    if (categoryCount === 0) {
      recommendations.push('❌ Add at least one category to the database');
    }
    
    if (recommendations.length === 0) {
      console.log('✅ Database prerequisites are met for book uploads');
      console.log('💡 Book uploads should work correctly');
    } else {
      console.log('❌ Database prerequisites are NOT met:');
      recommendations.forEach(rec => console.log(`  ${rec}`));
      console.log('');
      console.log('🔧 Quick Fix Commands:');
      console.log('-- Add a test author:');
      console.log("INSERT INTO authors (name, email, bio) VALUES ('Test Author', 'test@example.com', 'Test author bio');");
      console.log('');
      console.log('-- Add a test category:');
      console.log("INSERT INTO categories (name, description) VALUES ('Test Category', 'Test category description');");
    }
    
    console.log('');
    console.log('💡 If book uploads still fail after fixing prerequisites:');
    console.log('1. Check file upload permissions in /app/media_root');
    console.log('2. Verify application logs for specific error messages');
    console.log('3. Test with smaller files to rule out size issues');
    console.log('4. Ensure you are logged in as an admin user');
    
  } catch (error) {
    console.log(`❌ Database connection failed: ${error.message}`);
    console.log('');
    console.log('🔧 Troubleshooting database connection:');
    console.log('1. Check environment variables in .env.local');
    console.log('2. Verify database server is running');
    console.log('3. Check network connectivity');
    console.log('4. Verify database credentials');
  } finally {
    await pool.end();
  }
}

verifyDatabasePrerequisites().catch(console.error); 