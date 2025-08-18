#!/usr/bin/env node

const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'avnadmin',
  host: process.env.DB_HOST || 'readnwin-nextjs-book-nextjs.b.aivencloud.com',
  database: process.env.DB_NAME || 'defaultdb',
  password: process.env.DB_PASSWORD || 'AVNS_Xv38UAMF77xN--vUfeX',
  port: parseInt(process.env.DB_PORT || '28428'),
  ssl: {
    rejectUnauthorized: false,
    ca: process.env.DB_CA_CERT,
  },
});

async function migratePhase4() {
  console.log('============================================================');
  console.log('PHASE 4: DATABASE SCHEMA MIGRATION');
  console.log('============================================================');

  const client = await pool.connect();

  try {
    console.log('🔧 Starting Phase 4 database migration...\n');

    // 1. Create order_status_history table
    console.log('📋 Creating order_status_history table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_status_history (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES users(id)
      );
    `);
    console.log('✅ order_status_history table created successfully');

    // 2. Create inventory_transactions table
    console.log('📦 Creating inventory_transactions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory_transactions (
        id SERIAL PRIMARY KEY,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        operation VARCHAR(20) NOT NULL CHECK (operation IN ('reserve', 'release', 'update', 'adjust')),
        previous_stock INTEGER,
        new_stock INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES users(id)
      );
    `);
    console.log('✅ inventory_transactions table created successfully');

    // 3. Create order_notes table
    console.log('📝 Creating order_notes table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_notes (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        note TEXT NOT NULL,
        is_internal BOOLEAN DEFAULT FALSE,
        note_type VARCHAR(50) DEFAULT 'general',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ order_notes table created successfully');

    // 4. Add indexes for performance
    console.log('⚡ Creating performance indexes...');
    
    // Order status history indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_status_history_status ON order_status_history(status);
      CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at);
    `);

    // Inventory transactions indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_inventory_transactions_book_id ON inventory_transactions(book_id);
      CREATE INDEX IF NOT EXISTS idx_inventory_transactions_order_id ON inventory_transactions(order_id);
      CREATE INDEX IF NOT EXISTS idx_inventory_transactions_operation ON inventory_transactions(operation);
      CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created_at ON inventory_transactions(created_at);
    `);

    // Order notes indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_order_notes_order_id ON order_notes(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_notes_user_id ON order_notes(user_id);
      CREATE INDEX IF NOT EXISTS idx_order_notes_is_internal ON order_notes(is_internal);
      CREATE INDEX IF NOT EXISTS idx_order_notes_created_at ON order_notes(created_at);
    `);

    console.log('✅ Performance indexes created successfully');

    // 5. Add constraints and triggers
    console.log('🔒 Adding constraints and triggers...');

    // Add stock validation trigger
    await client.query(`
      CREATE OR REPLACE FUNCTION validate_stock_operation()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Ensure new_stock is not negative
        IF NEW.new_stock < 0 THEN
          RAISE EXCEPTION 'Stock cannot be negative';
        END IF;
        
        -- Ensure quantity is positive
        IF NEW.quantity <= 0 THEN
          RAISE EXCEPTION 'Quantity must be positive';
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trigger_validate_stock_operation ON inventory_transactions;
      CREATE TRIGGER trigger_validate_stock_operation
        BEFORE INSERT OR UPDATE ON inventory_transactions
        FOR EACH ROW
        EXECUTE FUNCTION validate_stock_operation();
    `);

    console.log('✅ Constraints and triggers added successfully');

    // 6. Insert initial data for testing
    console.log('📊 Inserting initial test data...');

    // Insert sample order status history for existing orders
    const existingOrders = await client.query('SELECT id FROM orders LIMIT 5');
    if (existingOrders.rows.length > 0) {
      for (const order of existingOrders.rows) {
        await client.query(`
          INSERT INTO order_status_history (order_id, status, notes, created_by)
          VALUES ($1, 'pending', 'Order created', 1)
          ON CONFLICT DO NOTHING
        `, [order.id]);
      }
      console.log(`✅ Added status history for ${existingOrders.rows.length} existing orders`);
    }

    // Insert sample inventory transactions for existing books
    const existingBooks = await client.query('SELECT id, stock_quantity FROM books LIMIT 5');
    if (existingBooks.rows.length > 0) {
      for (const book of existingBooks.rows) {
        await client.query(`
          INSERT INTO inventory_transactions (book_id, quantity, operation, previous_stock, new_stock, notes, created_by)
          VALUES ($1, $2, 'update', $2, $2, 'Initial stock setup', 1)
          ON CONFLICT DO NOTHING
        `, [book.id, book.stock_quantity || 10]);
      }
      console.log(`✅ Added inventory transactions for ${existingBooks.rows.length} books`);
    }

    console.log('\n🎉 Phase 4 database migration completed successfully!');
    console.log('\n📋 Summary of changes:');
    console.log('   ✅ order_status_history table created');
    console.log('   ✅ inventory_transactions table created');
    console.log('   ✅ order_notes table created');
    console.log('   ✅ Performance indexes added');
    console.log('   ✅ Constraints and triggers added');
    console.log('   ✅ Initial test data inserted');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
migratePhase4().catch(console.error); 