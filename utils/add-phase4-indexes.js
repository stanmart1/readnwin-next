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

async function addIndexes() {
  console.log('============================================================');
  console.log('PHASE 4: ADDING PERFORMANCE INDEXES');
  console.log('============================================================');

  const client = await pool.connect();

  try {
    console.log('⚡ Adding performance indexes...\n');

    // Order status history indexes
    console.log('📋 Adding order_status_history indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_status_history_status ON order_status_history(status);
      CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at);
    `);
    console.log('✅ order_status_history indexes created');

    // Inventory transactions indexes
    console.log('📦 Adding inventory_transactions indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_inventory_transactions_book_id ON inventory_transactions(book_id);
      CREATE INDEX IF NOT EXISTS idx_inventory_transactions_order_id ON inventory_transactions(order_id);
      CREATE INDEX IF NOT EXISTS idx_inventory_transactions_operation ON inventory_transactions(operation);
      CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created_at ON inventory_transactions(created_at);
    `);
    console.log('✅ inventory_transactions indexes created');

    // Order notes indexes
    console.log('📝 Adding order_notes indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_order_notes_order_id ON order_notes(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_notes_user_id ON order_notes(user_id);
      CREATE INDEX IF NOT EXISTS idx_order_notes_is_internal ON order_notes(is_internal);
      CREATE INDEX IF NOT EXISTS idx_order_notes_created_at ON order_notes(created_at);
    `);
    console.log('✅ order_notes indexes created');

    console.log('\n🎉 All Phase 4 indexes added successfully!');

  } catch (error) {
    console.error('❌ Failed to add indexes:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
addIndexes().catch(console.error); 