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

async function fixInventoryTable() {
  console.log('============================================================');
  console.log('PHASE 4: FIXING INVENTORY TRANSACTIONS TABLE');
  console.log('============================================================');

  const client = await pool.connect();

  try {
    console.log('🔧 Fixing inventory_transactions table...\n');

    // Drop the existing table
    console.log('🗑️ Dropping existing inventory_transactions table...');
    await client.query('DROP TABLE IF EXISTS inventory_transactions CASCADE');
    console.log('✅ Table dropped');

    // Recreate with correct structure
    console.log('📦 Creating inventory_transactions table with correct structure...');
    await client.query(`
      CREATE TABLE inventory_transactions (
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
    console.log('✅ inventory_transactions table recreated successfully');

    // Add indexes
    console.log('⚡ Adding indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_inventory_transactions_book_id ON inventory_transactions(book_id);
      CREATE INDEX IF NOT EXISTS idx_inventory_transactions_order_id ON inventory_transactions(order_id);
      CREATE INDEX IF NOT EXISTS idx_inventory_transactions_operation ON inventory_transactions(operation);
      CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created_at ON inventory_transactions(created_at);
    `);
    console.log('✅ Indexes created successfully');

    console.log('\n🎉 Inventory transactions table fixed successfully!');

  } catch (error) {
    console.error('❌ Failed to fix inventory table:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
fixInventoryTable().catch(console.error); 