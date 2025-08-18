const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || '149.102.159.118',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'S48lyoqo1mX7ytoiBvDZfCBB4TiCcGIU1rEdpu0NfBFP3V9q426PKDkGmV8aMD8b',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false, // SSL is disabled for the new database
});

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Initializing database for admin dashboard...\n');

    // 1. Check if users table exists
    console.log('👥 Checking users table...');
    const usersCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    
    if (!usersCheck.rows[0].exists) {
      console.log('❌ Users table does not exist. Please run the RBAC schema first.');
      return;
    }
    console.log('✅ Users table exists');

    // 2. Check if books table exists
    console.log('📚 Checking books table...');
    const booksCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'books'
      );
    `);
    
    if (!booksCheck.rows[0].exists) {
      console.log('❌ Books table does not exist. Please run the ecommerce schema first.');
      return;
    }
    console.log('✅ Books table exists');

    // 3. Check if orders table exists
    console.log('🛒 Checking orders table...');
    const ordersCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'orders'
      );
    `);
    
    if (!ordersCheck.rows[0].exists) {
      console.log('❌ Orders table does not exist. Please run the ecommerce schema first.');
      return;
    }
    console.log('✅ Orders table exists');

    // 4. Check if inventory_transactions table exists
    console.log('📦 Checking inventory_transactions table...');
    const inventoryCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'inventory_transactions'
      );
    `);
    
    if (!inventoryCheck.rows[0].exists) {
      console.log('📦 Creating inventory_transactions table...');
      await client.query(`
        CREATE TABLE inventory_transactions (
          id SERIAL PRIMARY KEY,
          book_id INTEGER REFERENCES books(id),
          transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'adjustment', 'return')),
          quantity INTEGER NOT NULL,
          previous_stock INTEGER NOT NULL,
          new_stock INTEGER NOT NULL,
          reference_id INTEGER,
          reference_type VARCHAR(50),
          notes TEXT,
          created_by INTEGER REFERENCES users(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ inventory_transactions table created');
    } else {
      console.log('✅ inventory_transactions table exists');
    }

    // 5. Insert some sample data if tables are empty
    console.log('\n📊 Checking for sample data...');
    
    // Check users count
    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    if (parseInt(userCount.rows[0].count) === 0) {
      console.log('👥 No users found. Creating default admin user...');
      await client.query(`
        INSERT INTO users (email, username, password_hash, first_name, last_name, status, email_verified)
        VALUES (
          'admin@readnwin.com',
          'admin',
          '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O',
          'System',
          'Administrator',
          'active',
          TRUE
        ) ON CONFLICT (email) DO NOTHING;
      `);
      console.log('✅ Default admin user created');
    }

    // Check books count
    const bookCount = await client.query('SELECT COUNT(*) as count FROM books');
    if (parseInt(bookCount.rows[0].count) === 0) {
      console.log('📚 No books found. Creating sample books...');
      
      // First, create some categories
      await client.query(`
        INSERT INTO categories (name, slug, description, sort_order) VALUES
        ('Fiction', 'fiction', 'Literary fiction and novels', 1),
        ('Non-Fiction', 'non-fiction', 'Educational and informational books', 2),
        ('Self-Help', 'self-help', 'Personal development and improvement', 3)
        ON CONFLICT (slug) DO NOTHING;
      `);

      // Create some authors
      await client.query(`
        INSERT INTO authors (name, email, bio, status) VALUES
        ('John Doe', 'john@example.com', 'Bestselling author', 'active'),
        ('Jane Smith', 'jane@example.com', 'Award-winning writer', 'active')
        ON CONFLICT (email) DO NOTHING;
      `);

      // Create sample books
      await client.query(`
        INSERT INTO books (title, author_id, category_id, price, stock_quantity, status, format) VALUES
        ('The Art of Programming', 1, 1, 29.99, 50, 'published', 'ebook'),
        ('Business Success Guide', 2, 2, 24.99, 30, 'published', 'ebook'),
        ('Personal Development Manual', 1, 3, 19.99, 25, 'published', 'ebook')
        ON CONFLICT DO NOTHING;
      `);
      console.log('✅ Sample books created');
    }

    // Check orders count
    const orderCount = await client.query('SELECT COUNT(*) as count FROM orders');
    if (parseInt(orderCount.rows[0].count) === 0) {
      console.log('🛒 No orders found. Creating sample orders...');
      
      // Create sample orders
      await client.query(`
        INSERT INTO orders (order_number, user_id, status, subtotal, total_amount, currency, payment_status) VALUES
        ('ORD-001', 1, 'delivered', 29.99, 29.99, 'USD', 'paid'),
        ('ORD-002', 1, 'processing', 44.98, 44.98, 'USD', 'paid')
        ON CONFLICT (order_number) DO NOTHING;
      `);
      console.log('✅ Sample orders created');
    }

    console.log('\n🎉 Database initialization complete!');
    console.log('📊 Admin dashboard should now work properly.');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the initialization
initDatabase().catch(console.error); 