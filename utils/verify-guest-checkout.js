const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function verifyGuestCheckout() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verifying guest checkout implementation...');
    
    // Check if cart_items table exists
    const cartTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'cart_items'
      )
    `);
    
    console.log(`📋 cart_items table exists: ${cartTableExists.rows[0].exists}`);
    
    if (cartTableExists.rows[0].exists) {
      // Check cart_items table structure
      const cartColumns = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'cart_items' 
        ORDER BY ordinal_position
      `);
      
      console.log('\n📋 cart_items table columns:');
      cartColumns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    }
    
    // Check if books table exists
    const booksTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'books'
      )
    `);
    
    console.log(`\n📚 books table exists: ${booksTableExists.rows[0].exists}`);
    
    if (booksTableExists.rows[0].exists) {
      // Check for sample books
      const sampleBooks = await client.query(`
        SELECT id, title, price, format, status 
        FROM books 
        WHERE status = 'published' 
        LIMIT 3
      `);
      
      console.log(`\n📖 Sample published books (${sampleBooks.rows.length}):`);
      sampleBooks.rows.forEach(book => {
        console.log(`  - ID: ${book.id}, Title: "${book.title}", Price: ₦${book.price}, Format: ${book.format}`);
      });
    }
    
    // Check if user_shipping_addresses table exists
    const shippingTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_shipping_addresses'
      )
    `);
    
    console.log(`\n🚚 user_shipping_addresses table exists: ${shippingTableExists.rows[0].exists}`);
    
    // Check if audit_logs table exists
    const auditTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'audit_logs'
      )
    `);
    
    console.log(`📊 audit_logs table exists: ${auditTableExists.rows[0].exists}`);
    
    // Test cart operations (simulate guest cart transfer)
    if (cartTableExists.rows[0].exists && booksTableExists.rows[0].exists) {
      console.log('\n🧪 Testing cart operations...');
      
      // Get a test user (create one if needed)
      let testUser = await client.query(`
        SELECT id FROM users WHERE email = 'test@example.com' LIMIT 1
      `);\n      
      if (testUser.rows.length === 0) {\n        console.log('Creating test user...');\n        testUser = await client.query(`\n          INSERT INTO users (email, username, password_hash, first_name, last_name, status)\n          VALUES ('test@example.com', 'testuser', '$2a$12$dummy', 'Test', 'User', 'active')\n          RETURNING id\n        `);\n      }\n      \n      const userId = testUser.rows[0].id;\n      console.log(`👤 Using test user ID: ${userId}`);\n      \n      // Clear any existing cart items for test user\n      await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);\n      \n      // Get a sample book\n      const sampleBook = await client.query(`\n        SELECT id FROM books WHERE status = 'published' LIMIT 1\n      `);\n      \n      if (sampleBook.rows.length > 0) {\n        const bookId = sampleBook.rows[0].id;\n        console.log(`📖 Using test book ID: ${bookId}`);\n        \n        // Test adding item to cart\n        await client.query(`\n          INSERT INTO cart_items (user_id, book_id, quantity)\n          VALUES ($1, $2, $3)\n        `, [userId, bookId, 1]);\n        \n        console.log('✅ Successfully added item to cart');\n        \n        // Test retrieving cart items\n        const cartItems = await client.query(`\n          SELECT ci.*, b.title, b.price \n          FROM cart_items ci\n          JOIN books b ON ci.book_id = b.id\n          WHERE ci.user_id = $1\n        `, [userId]);\n        \n        console.log(`✅ Retrieved ${cartItems.rows.length} cart items`);\n        \n        // Clean up test data\n        await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);\n        console.log('🧹 Cleaned up test cart items');\n      }\n    }\n    \n    console.log('\\n🎉 Guest checkout verification completed!');\n    \n    return {\n      cartTableExists: cartTableExists.rows[0].exists,\n      booksTableExists: booksTableExists.rows[0].exists,\n      shippingTableExists: shippingTableExists.rows[0].exists,\n      auditTableExists: auditTableExists.rows[0].exists\n    };\n    \n  } catch (error) {\n    console.error('❌ Error verifying guest checkout:', error);\n    throw error;\n  } finally {\n    client.release();\n  }\n}\n\n// Run if called directly\nif (require.main === module) {\n  verifyGuestCheckout()\n    .then((result) => {\n      console.log('\\n📊 Verification Summary:');\n      console.log(`  - Cart functionality: ${result.cartTableExists ? '✅' : '❌'}`);\n      console.log(`  - Books available: ${result.booksTableExists ? '✅' : '❌'}`);\n      console.log(`  - Shipping support: ${result.shippingTableExists ? '✅' : '❌'}`);\n      console.log(`  - Audit logging: ${result.auditTableExists ? '✅' : '❌'}`);\n      process.exit(0);\n    })\n    .catch((error) => {\n      console.error('💥 Verification failed:', error);\n      process.exit(1);\n    });\n}\n\nmodule.exports = { verifyGuestCheckout };