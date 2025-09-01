const { query } = require('./database');

async function initAnalyticsTables() {
  try {
    console.log('🔍 Checking analytics tables...');

    // Create authors table if missing
    await query(`
      CREATE TABLE IF NOT EXISTS authors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create categories table if missing  
    await query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_library table if missing
    await query(`
      CREATE TABLE IF NOT EXISTS user_library (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, book_id)
      )
    `);

    // Sync existing data
    await syncExistingData();
    
    console.log('✅ Analytics tables initialized');
  } catch (error) {
    console.error('❌ Failed to initialize analytics tables:', error);
  }
}

async function syncExistingData() {
  // Sync authors from books table
  await query(`
    INSERT INTO authors (name)
    SELECT DISTINCT author_name 
    FROM books 
    WHERE author_name IS NOT NULL 
    AND author_name NOT IN (SELECT name FROM authors)
  `);

  // Sync categories from books table
  await query(`
    INSERT INTO categories (name)
    SELECT DISTINCT category_name 
    FROM books 
    WHERE category_name IS NOT NULL 
    AND category_name NOT IN (SELECT name FROM categories)
  `);

  // Update books to reference proper author_id and category_id
  await query(`
    UPDATE books 
    SET author_id = a.id 
    FROM authors a 
    WHERE books.author_name = a.name AND books.author_id IS NULL
  `);

  await query(`
    UPDATE books 
    SET category_id = c.id 
    FROM categories c 
    WHERE books.category_name = c.name AND books.category_id IS NULL
  `);
}

module.exports = { initAnalyticsTables };