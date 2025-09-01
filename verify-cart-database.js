const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function verifyCartDatabase() {
  try {
    console.log('🔍 Verifying cart database structure...');
    
    // Check if cart_items table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'cart_items'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ cart_items table does not exist. Creating...');
      
      await pool.query(`
        CREATE TABLE cart_items (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          book_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          format VARCHAR(20) DEFAULT 'ebook',
          added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, book_id)
        );
      `);
      
      console.log('✅ cart_items table created successfully');
    } else {
      console.log('✅ cart_items table exists');
    }
    
    // Check table structure
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'cart_items'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 cart_items table structure:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // Check if format column exists
    const formatColumn = columns.rows.find(col => col.column_name === 'format');
    if (!formatColumn) {
      console.log('⚠️ format column missing, adding...');
      await pool.query(`
        ALTER TABLE cart_items ADD COLUMN format VARCHAR(20) DEFAULT 'ebook';
      `);
      console.log('✅ format column added');
    }
    
    // Check if added_at column exists
    const addedAtColumn = columns.rows.find(col => col.column_name === 'added_at');
    if (!addedAtColumn) {
      console.log('⚠️ added_at column missing, adding...');
      await pool.query(`
        ALTER TABLE cart_items ADD COLUMN added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `);
      console.log('✅ added_at column added');
    }
    
    // Check books table structure
    console.log('\n🔍 Checking books table...');
    const booksExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'books'
      );
    `);
    
    if (!booksExists.rows[0].exists) {
      console.log('❌ books table does not exist!');
      return;
    }
    
    const bookColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'books'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 books table structure:');
    bookColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // Check if format column exists in books
    const bookFormatColumn = bookColumns.rows.find(col => col.column_name === 'format');
    if (!bookFormatColumn) {
      console.log('⚠️ format column missing in books table, adding...');
      await pool.query(`
        ALTER TABLE books ADD COLUMN format VARCHAR(20) DEFAULT 'ebook';
      `);
      console.log('✅ format column added to books table');
    }
    
    // Check if stock_quantity column exists in books
    const stockColumn = bookColumns.rows.find(col => col.column_name === 'stock_quantity');
    if (!stockColumn) {
      console.log('⚠️ stock_quantity column missing in books table, adding...');
      await pool.query(`
        ALTER TABLE books ADD COLUMN stock_quantity INTEGER DEFAULT 0;
      `);
      console.log('✅ stock_quantity column added to books table');
    }
    
    // Test a simple query
    console.log('\n🧪 Testing database queries...');
    
    const testQuery = await pool.query('SELECT COUNT(*) as count FROM books');
    console.log(`✅ Books count: ${testQuery.rows[0].count}`);
    
    const cartQuery = await pool.query('SELECT COUNT(*) as count FROM cart_items');
    console.log(`✅ Cart items count: ${cartQuery.rows[0].count}`);
    
    console.log('\n✅ Database verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

verifyCartDatabase();