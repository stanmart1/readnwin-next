require('dotenv').config();
const { query } = require('./utils/database');

async function fixCartTable() {
  console.log('🔧 Fixing cart_items table structure...');
  
  try {
    // First, check current table structure
    console.log('1. Checking current table structure...');
    const structure = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'cart_items' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Current table structure:');
    structure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Check if price column exists
    const hasPrice = structure.rows.some(col => col.column_name === 'price');
    const hasTotalPrice = structure.rows.some(col => col.column_name === 'total_price');
    const hasUpdatedAt = structure.rows.some(col => col.column_name === 'updated_at');
    
    if (!hasPrice) {
      console.log('2. Adding price column...');
      await query(`
        ALTER TABLE cart_items 
        ADD COLUMN price DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0);
      `);
      console.log('✅ Added price column');
    }
    
    if (!hasTotalPrice) {
      console.log('3. Adding total_price column...');
      await query(`
        ALTER TABLE cart_items 
        ADD COLUMN total_price DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (total_price >= 0);
      `);
      console.log('✅ Added total_price column');
    }
    
    if (!hasUpdatedAt) {
      console.log('4. Adding updated_at column...');
      await query(`
        ALTER TABLE cart_items 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      `);
      console.log('✅ Added updated_at column');
    }
    
    // Update created_at to use timezone if it doesn't
    console.log('5. Updating created_at column to use timezone...');
    try {
      await query(`
        ALTER TABLE cart_items 
        ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;
      `);
      console.log('✅ Updated created_at column');
    } catch (error) {
      console.log('ℹ️ created_at column already has timezone or update not needed');
    }
    
    // Add unique constraint if it doesn't exist
    console.log('6. Adding unique constraint...');
    try {
      await query(`
        ALTER TABLE cart_items 
        ADD CONSTRAINT cart_items_user_book_unique UNIQUE (user_id, book_id);
      `);
      console.log('✅ Added unique constraint');
    } catch (error) {
      console.log('ℹ️ Unique constraint already exists or not needed');
    }
    
    // Add foreign key constraints if they don't exist
    console.log('7. Adding foreign key constraints...');
    try {
      await query(`
        ALTER TABLE cart_items 
        ADD CONSTRAINT cart_items_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
      `);
      console.log('✅ Added user_id foreign key');
    } catch (error) {
      console.log('ℹ️ User foreign key already exists or not needed');
    }
    
    try {
      await query(`
        ALTER TABLE cart_items 
        ADD CONSTRAINT cart_items_book_id_fkey 
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE;
      `);
      console.log('✅ Added book_id foreign key');
    } catch (error) {
      console.log('ℹ️ Book foreign key already exists or not needed');
    }
    
    // Add quantity check constraint
    console.log('8. Adding quantity check constraint...');
    try {
      await query(`
        ALTER TABLE cart_items 
        ADD CONSTRAINT cart_items_quantity_check CHECK (quantity > 0);
      `);
      console.log('✅ Added quantity check constraint');
    } catch (error) {
      console.log('ℹ️ Quantity check constraint already exists or not needed');
    }
    
    // Check final table structure
    console.log('9. Checking final table structure...');
    const finalStructure = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'cart_items' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Final table structure:');
    finalStructure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    console.log('🎉 Cart table structure fixed successfully!');
    
  } catch (error) {
    console.error('❌ Failed to fix cart table:', error);
    console.error('Error details:', error.message);
  }
  
  process.exit(0);
}

fixCartTable();