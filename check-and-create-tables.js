#!/usr/bin/env node

const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '149.102.159.118',
  database: 'postgres',
  password: '6c8u2MsYqlbQxL5IxftjrV7QQnlLymdsmzMtTeIe4Ur1od7RR9CdODh3VfQ4ka2f',
  port: 5432,
  ssl: false
});

async function checkAndCreateTables() {
  console.log('🔍 Checking database tables...\n');
  
  try {
    const client = await pool.connect();
    
    // Define required tables and their creation SQL
    const requiredTables = {
      'reading_progress': `
        CREATE TABLE reading_progress (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          book_id INTEGER NOT NULL,
          progress_percentage DECIMAL(5,2) DEFAULT 0,
          current_chapter_id VARCHAR(255),
          total_reading_time_seconds INTEGER DEFAULT 0,
          last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, book_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON reading_progress(user_id);
        CREATE INDEX IF NOT EXISTS idx_reading_progress_book_id ON reading_progress(book_id);
        CREATE INDEX IF NOT EXISTS idx_reading_progress_last_read ON reading_progress(last_read_at DESC);
      `,
      
      'user_library': `
        CREATE TABLE user_library (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          book_id INTEGER NOT NULL,
          order_id INTEGER,
          purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          download_count INTEGER DEFAULT 0,
          last_downloaded_at TIMESTAMP,
          is_favorite BOOLEAN DEFAULT false,
          access_type VARCHAR(50) DEFAULT 'purchased',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, book_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_user_library_user_id ON user_library(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_library_book_id ON user_library(book_id);
      `,
      
      'books': `
        CREATE TABLE books (
          id SERIAL PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          author_id INTEGER,
          category_id INTEGER,
          description TEXT,
          isbn VARCHAR(20),
          price DECIMAL(10,2) DEFAULT 0,
          cover_image_url TEXT,
          ebook_file_url TEXT,
          format VARCHAR(20) DEFAULT 'ebook',
          status VARCHAR(20) DEFAULT 'published',
          stock_quantity INTEGER DEFAULT 0,
          is_featured BOOLEAN DEFAULT false,
          pages INTEGER,
          language VARCHAR(50) DEFAULT 'English',
          publisher VARCHAR(255),
          publication_date DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
        CREATE INDEX IF NOT EXISTS idx_books_author ON books(author_id);
        CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id);
        CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
      `,
      
      'authors': `
        CREATE TABLE authors (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          bio TEXT,
          avatar_url TEXT,
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_authors_name ON authors(name);
        CREATE INDEX IF NOT EXISTS idx_authors_email ON authors(email);
      `,
      
      'categories': `
        CREATE TABLE categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          slug VARCHAR(255) UNIQUE,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
        CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
      `,
      
      'users': `
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255),
          role VARCHAR(50) DEFAULT 'user',
          email_verified BOOLEAN DEFAULT false,
          avatar_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      `
    };
    
    // Check which tables exist
    const existingTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const existingTableNames = existingTables.rows.map(row => row.table_name);
    console.log('📋 Existing tables:', existingTableNames.join(', ') || 'None');
    
    // Create missing tables
    let createdCount = 0;
    for (const [tableName, createSQL] of Object.entries(requiredTables)) {
      if (!existingTableNames.includes(tableName)) {
        console.log(`\n🔨 Creating table: ${tableName}`);
        try {
          await client.query(createSQL);
          console.log(`✅ Created: ${tableName}`);
          createdCount++;
        } catch (error) {
          console.log(`❌ Failed to create ${tableName}:`, error.message);
        }
      } else {
        console.log(`✅ Exists: ${tableName}`);
      }
    }
    
    // Insert default data if tables were created
    if (createdCount > 0) {
      console.log('\n📝 Inserting default data...');
      
      // Insert default categories
      try {
        await client.query(`
          INSERT INTO categories (name, description, slug) VALUES
          ('Fiction', 'Fictional stories and novels', 'fiction'),
          ('Non-Fiction', 'Educational and factual books', 'non-fiction'),
          ('Science', 'Scientific and technical books', 'science'),
          ('Biography', 'Life stories and memoirs', 'biography'),
          ('Business', 'Business and entrepreneurship', 'business')
          ON CONFLICT (name) DO NOTHING
        `);
        console.log('✅ Default categories inserted');
      } catch (error) {
        console.log('⚠️ Categories insert failed:', error.message);
      }
      
      // Insert default authors
      try {
        await client.query(`
          INSERT INTO authors (name, email, bio) VALUES
          ('Unknown Author', 'unknown@readnwin.com', 'Default author for books without specified authors'),
          ('ReadnWin Team', 'team@readnwin.com', 'Content created by the ReadnWin team')
          ON CONFLICT DO NOTHING
        `);
        console.log('✅ Default authors inserted');
      } catch (error) {
        console.log('⚠️ Authors insert failed:', error.message);
      }
    }
    
    console.log(`\n🎉 Database check complete! Created ${createdCount} new tables.`);
    
    client.release();
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAndCreateTables();