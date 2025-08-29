const { Pool } = require('pg');

// Use production environment variables
const pool = new Pool({
  user: 'postgres',
  host: '149.102.159.118',
  database: 'postgres',
  password: '6c8u2MsYqlbQxL5IxftjrV7QQnlLymdsmzMtTeIe4Ur1od7RR9CdODh3VfQ4ka2f',
  port: 5432,
  ssl: false,
  connectionTimeoutMillis: 10000,
});

async function testConnection() {
  try {
    console.log('🔍 Testing database connection with production credentials...\n');
    
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Test basic query
    const result = await client.query('SELECT NOW() as current_time, version() as db_version');
    console.log('📅 Current time:', result.rows[0].current_time);
    console.log('🗄️ Database version:', result.rows[0].db_version);
    
    // Check if orders table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'orders'
      );
    `);
    console.log('📋 Orders table exists:', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
      // Count orders
      const countResult = await client.query('SELECT COUNT(*) as total FROM orders');
      console.log('📊 Total orders in database:', countResult.rows[0].total);
      
      // Check order_items table
      const itemsTableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'order_items'
        );
      `);
      console.log('📦 Order_items table exists:', itemsTableCheck.rows[0].exists);
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('🔧 Connection details:');
    console.error('   Host: 149.102.159.118');
    console.error('   Port: 5432');
    console.error('   Database: postgres');
    console.error('   User: postgres');
  }
}

testConnection();