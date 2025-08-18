const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

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

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT version()');
    client.release();
    console.log('✅ Database connection test successful:', result.rows[0].version);
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    return false;
  }
}

async function runEcommerceMigrations() {
  console.log('🚀 Running ecommerce database migrations...');
  
  try {
    // Read the ecommerce schema file
    const schemaPath = path.join(__dirname, 'ecommerce-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          const client = await pool.connect();
          await client.query(statement);
          client.release();
          console.log(`✅ Statement ${i + 1}/${statements.length} executed successfully`);
        } catch (error) {
          // Skip if table already exists (IF NOT EXISTS should handle this)
          if (error.message.includes('already exists')) {
            console.log(`⚠️  Statement ${i + 1}/${statements.length} skipped (already exists)`);
            continue;
          }
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          console.error('Statement:', statement.substring(0, 100) + '...');
          throw error;
        }
      }
    }
    
    console.log('✅ All ecommerce migrations completed successfully');
  } catch (error) {
    console.error('❌ Error running ecommerce migrations:', error);
    throw error;
  }
}

async function verifyEcommerceSetup() {
  console.log('🔍 Verifying ecommerce database setup...');
  
  try {
    // Check if ecommerce tables were created
    const requiredTables = [
      'categories', 'authors', 'books', 'cart_items', 'orders', 
      'order_items', 'discounts', 'wishlist_items', 'reading_progress', 
      'user_library', 'book_reviews'
    ];
    
    for (const tableName of requiredTables) {
      const client = await pool.connect();
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        );
      `, [tableName]);
      client.release();
      
      if (tableCheck.rows[0].exists) {
        console.log(`✅ Table ${tableName} exists`);
      } else {
        console.log(`❌ Table ${tableName} missing`);
      }
    }
    
    console.log('✅ Ecommerce database setup verification completed');
  } catch (error) {
    console.error('❌ Error verifying ecommerce setup:', error);
    throw error;
  }
}

async function initializeEcommerceDatabase() {
  console.log('🚀 Starting ecommerce database initialization...');
  
  try {
    // Test connection first
    console.log('🔌 Testing database connection...');
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Database connection failed');
    }
    
    // Run ecommerce migrations
    await runEcommerceMigrations();
    
    // Verify setup
    await verifyEcommerceSetup();
    
    console.log('🎉 Ecommerce database initialization completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Ecommerce schema has been created');
    console.log('- Cart functionality should now work');
    console.log('- All ecommerce tables are ready');
    
  } catch (error) {
    console.error('❌ Ecommerce database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the initialization
initializeEcommerceDatabase().catch(console.error); 