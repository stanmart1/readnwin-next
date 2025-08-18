const { Pool } = require('pg');

async function testBookUpdate() {
  console.log('🔍 Testing book update functionality...\n');
  
  // Use the same database configuration as the app
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: 'postgres', // Using postgres database directly
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: false
  });

  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // First, let's check if we have any books to update
    const booksResult = await client.query('SELECT id, title, is_featured FROM books LIMIT 5');
    console.log('📋 Available books:', booksResult.rows);
    
    if (booksResult.rows.length === 0) {
      console.log('❌ No books found in database');
      return;
    }
    
    const testBook = booksResult.rows[0];
    console.log(`🔍 Testing update on book: ${testBook.title} (ID: ${testBook.id})`);
    console.log(`📋 Current is_featured value: ${testBook.is_featured}`);
    
    // Test the exact update query that the API uses
    const updateData = {
      is_featured: !testBook.is_featured // Toggle the featured status
    };
    
    console.log(`📋 Update data:`, updateData);
    
    // Build the update query exactly like the ecommerce service does
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;
    
    // Only include fields that are actually provided
    if (updateData.is_featured !== undefined) {
      updateFields.push(`is_featured = $${paramIndex}`);
      updateValues.push(updateData.is_featured);
      paramIndex++;
    }
    
    // Always update the updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // Add the book ID as the last parameter
    updateValues.push(testBook.id);
    
    const updateQuery = `
      UPDATE books SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    console.log(`🔍 Update query:`, updateQuery);
    console.log(`🔍 Update values:`, updateValues);
    
    try {
      const result = await client.query(updateQuery, updateValues);
      
      if (result.rows.length === 0) {
        console.log('❌ No rows affected when updating book');
      } else {
        console.log('✅ Book updated successfully!');
        console.log('📋 Updated book:', result.rows[0]);
      }
      
    } catch (updateError) {
      console.error('❌ UPDATE ERROR:');
      console.error('❌ Error message:', updateError.message);
      console.error('❌ Error code:', updateError.code);
      console.error('❌ Error detail:', updateError.detail);
      console.error('❌ Error hint:', updateError.hint);
      console.error('❌ Error where:', updateError.where);
      
      // Provide specific fix based on error type
      if (updateError.code === '42703') {
        console.log('\n🔧 FIX: Missing column detected');
        console.log('📋 The is_featured column might not exist in the books table');
      } else if (updateError.code === '23502') {
        console.log('\n🔧 FIX: NOT NULL constraint violation');
        console.log('📋 Check that all required fields are provided');
      } else if (updateError.code === '23503') {
        console.log('\n🔧 FIX: Foreign key constraint violation');
        console.log('📋 Check that author_id and category_id exist in their respective tables');
      } else if (updateError.code === '42P01') {
        console.log('\n🔧 FIX: Table does not exist');
        console.log('📋 Run the table creation script');
      }
    }
    
    client.release();
    
  } catch (dbError) {
    console.error('❌ Database connection failed:', dbError.message);
    console.error('❌ This is likely the root cause of the 500 error!');
  } finally {
    await pool.end();
  }
}

// Load environment variables
require('dotenv').config();

testBookUpdate().catch(console.error); 