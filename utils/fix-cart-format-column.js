const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addFormatColumnToCartItems() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Checking cart_items table structure...');
    
    // Check if format column exists
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'cart_items' AND column_name = 'format'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('➕ Adding format column to cart_items table...');
      
      // Add format column with default value
      await client.query(`
        ALTER TABLE cart_items 
        ADD COLUMN format VARCHAR(20) DEFAULT 'ebook'
      `);
      
      // Update existing records to have format based on book format
      await client.query(`
        UPDATE cart_items 
        SET format = COALESCE(b.format, 'ebook')
        FROM books b 
        WHERE cart_items.book_id = b.id
      `);
      
      console.log('✅ Format column added successfully');
    } else {
      console.log('✅ Format column already exists');
    }
    
    // Check if added_at column exists (some tables might have created_at instead)
    const addedAtCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'cart_items' AND column_name = 'added_at'
    `);
    
    if (addedAtCheck.rows.length === 0) {
      console.log('➕ Adding added_at column to cart_items table...');
      
      await client.query(`
        ALTER TABLE cart_items 
        ADD COLUMN added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      
      // Update existing records
      await client.query(`
        UPDATE cart_items 
        SET added_at = COALESCE(created_at, CURRENT_TIMESTAMP)
        WHERE added_at IS NULL
      `);
      
      console.log('✅ Added_at column added successfully');
    } else {
      console.log('✅ Added_at column already exists');
    }
    
  } catch (error) {
    console.error('❌ Error updating cart_items table:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  addFormatColumnToCartItems()
    .then(() => {
      console.log('🎉 Cart items table update completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to update cart items table:', error);
      process.exit(1);
    });
}

module.exports = { addFormatColumnToCartItems };