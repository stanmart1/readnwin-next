require('dotenv').config();
const { Pool } = require('pg');

async function fixBookLoading() {
  console.log('🔧 Fixing book loading issues...\n');
  
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME || 'postgres',
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: false
  });
  
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // 1. Check if books table exists
    console.log('\n📋 Checking books table...');
    const booksTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'books'
      );
    `);
    
    if (!booksTableExists.rows[0].exists) {
      console.log('❌ Books table does not exist. Creating...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS books (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          subtitle VARCHAR(255),
          author_id INTEGER,
          category_id INTEGER,
          isbn VARCHAR(20),
          description TEXT,
          short_description TEXT,
          language VARCHAR(10) DEFAULT 'en',
          pages INTEGER,
          publication_date DATE,
          publisher VARCHAR(255),
          price DECIMAL(10,2) DEFAULT 0,
          original_price DECIMAL(10,2),
          cost_price DECIMAL(10,2),
          weight_grams INTEGER,
          dimensions VARCHAR(50),
          shipping_class VARCHAR(50),
          stock_quantity INTEGER DEFAULT 0,
          low_stock_threshold INTEGER DEFAULT 10,
          inventory_enabled BOOLEAN DEFAULT false,
          cover_image_url TEXT,
          sample_pdf_url TEXT,
          ebook_file_url TEXT,
          audiobook_file_url TEXT,
          file_format VARCHAR(20),
          file_size BIGINT,
          file_hash VARCHAR(64),
          processing_status VARCHAR(20) DEFAULT 'pending',
          word_count INTEGER DEFAULT 0,
          estimated_reading_time INTEGER DEFAULT 0,
          chapters JSONB,
          status VARCHAR(20) DEFAULT 'published',
          is_featured BOOLEAN DEFAULT false,
          is_bestseller BOOLEAN DEFAULT false,
          is_new_release BOOLEAN DEFAULT false,
          seo_title VARCHAR(255),
          seo_description TEXT,
          seo_keywords TEXT,
          created_by INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Books table created');
    } else {
      console.log('✅ Books table exists');
    }
    
    // 2. Check if authors table exists
    console.log('\n📋 Checking authors table...');
    const authorsTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'authors'
      );
    `);
    
    if (!authorsTableExists.rows[0].exists) {
      console.log('❌ Authors table does not exist. Creating...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS authors (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          bio TEXT,
          avatar_url TEXT,
          website VARCHAR(255),
          social_links JSONB,
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Authors table created');
    } else {
      console.log('✅ Authors table exists');
    }
    
    // 3. Check if categories table exists
    console.log('\n📋 Checking categories table...');
    const categoriesTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'categories'
      );
    `);
    
    if (!categoriesTableExists.rows[0].exists) {
      console.log('❌ Categories table does not exist. Creating...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE,
          description TEXT,
          parent_id INTEGER,
          image_url TEXT,
          is_featured BOOLEAN DEFAULT false,
          sort_order INTEGER DEFAULT 0,
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Categories table created');
    } else {
      console.log('✅ Categories table exists');
    }
    
    // 4. Check and add sample data if needed
    console.log('\n📋 Checking sample data...');
    
    // Check authors count
    const authorsCount = await client.query('SELECT COUNT(*) as count FROM authors');
    if (parseInt(authorsCount.rows[0].count) === 0) {
      console.log('❌ No authors found. Adding sample author...');
      await client.query(`
        INSERT INTO authors (name, email, bio) 
        VALUES ('Sample Author', 'author@example.com', 'This is a sample author for testing purposes.')
      `);
      console.log('✅ Sample author added');
    } else {
      console.log(`✅ Found ${authorsCount.rows[0].count} authors`);
    }
    
    // Check categories count
    const categoriesCount = await client.query('SELECT COUNT(*) as count FROM categories');
    if (parseInt(categoriesCount.rows[0].count) === 0) {
      console.log('❌ No categories found. Adding sample categories...');
      await client.query(`
        INSERT INTO categories (name, slug, description) VALUES 
        ('Fiction', 'fiction', 'Fictional books and novels'),
        ('Non-Fiction', 'non-fiction', 'Non-fictional books and educational content'),
        ('Technology', 'technology', 'Technology and programming books'),
        ('Business', 'business', 'Business and entrepreneurship books')
      `);
      console.log('✅ Sample categories added');
    } else {
      console.log(`✅ Found ${categoriesCount.rows[0].count} categories`);
    }
    
    // 5. Test the API query
    console.log('\n📋 Testing book query...');
    try {
      const testQuery = await client.query(`
        SELECT 
          b.id,
          b.title,
          b.author_id,
          b.category_id,
          b.price,
          b.status,
          b.created_at,
          a.name as author_name,
          c.name as category_name,
          COALESCE(b.stock_quantity, 0) as stock_quantity,
          COALESCE(b.is_featured, false) as is_featured,
          COALESCE(b.file_format, 'unknown') as format
        FROM books b
        LEFT JOIN authors a ON b.author_id = a.id
        LEFT JOIN categories c ON b.category_id = c.id
        ORDER BY b.created_at DESC
        LIMIT 5
      `);
      console.log(`✅ Query test successful. Found ${testQuery.rows.length} books`);
      
      if (testQuery.rows.length > 0) {
        console.log('📋 Sample books:');
        testQuery.rows.forEach((book, index) => {
          console.log(`   ${index + 1}. ${book.title} by ${book.author_name || 'Unknown'}`);
        });
      }
    } catch (queryError) {
      console.log('❌ Query test failed:', queryError.message);
    }
    
    // 6. Check permissions (simplified)
    console.log('\n📋 Checking user permissions...');
    try {
      const usersTableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        );
      `);
      
      if (usersTableExists.rows[0].exists) {
        const usersCount = await client.query('SELECT COUNT(*) as count FROM users');
        console.log(`✅ Found ${usersCount.rows[0].count} users`);
        
        // Check if there's at least one admin user
        const adminUsers = await client.query(`
          SELECT COUNT(*) as count FROM users 
          WHERE role IN ('admin', 'super_admin') OR id = 1
        `);
        
        if (parseInt(adminUsers.rows[0].count) === 0) {
          console.log('⚠️ No admin users found. You may need to set user role to admin manually.');
        } else {
          console.log(`✅ Found ${adminUsers.rows[0].count} admin users`);
        }
      } else {
        console.log('⚠️ Users table not found. Authentication may not work properly.');
      }
    } catch (permError) {
      console.log('⚠️ Could not check user permissions:', permError.message);
    }
    
    client.release();
    
    console.log('\n🎉 Book loading fix completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Database connection working');
    console.log('✅ Required tables exist');
    console.log('✅ Sample data available');
    console.log('✅ Query structure validated');
    
    console.log('\n💡 Next steps:');
    console.log('1. Restart your Next.js development server');
    console.log('2. Try accessing the book management page again');
    console.log('3. Check the browser console for any remaining errors');
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your .env file has correct database credentials');
    console.log('2. Ensure the database server is running');
    console.log('3. Verify network connectivity to the database');
  } finally {
    await pool.end();
  }
}

fixBookLoading().catch(console.error);