const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration for Aiven Cloud PostgreSQL
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
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  statement_timeout: 30000,
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

async function applyNewSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting new ecommerce schema application...\n');

    // Test connection first
    if (!(await testConnection())) {
      throw new Error('Database connection failed');
    }

    // Read the new schema file
    const schemaPath = path.join(__dirname, 'ecommerce-schema-new.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    console.log('📋 Applying new ecommerce schema...');
    
    // Split the SQL into individual statements and execute them
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await client.query(statement);
          console.log(`✅ Executed statement ${i + 1}/${statements.length}`);
        } catch (error) {
          // Skip if table already exists or constraint already exists
          if (error.message.includes('already exists') || error.message.includes('duplicate key')) {
            console.log(`⚠️  Skipped statement ${i + 1} (already exists)`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            throw error;
          }
        }
      }
    }

    console.log('\n✅ New ecommerce schema applied successfully!');

    // Verify the new structure
    console.log('\n🔍 Verifying new database structure...');
    
    const tables = [
      'users', 'categories', 'authors', 'books', 'cart_items', 
      'orders', 'order_items', 'user_library', 'payment_transactions',
      'bank_transfer_proofs', 'shipping_methods', 'tax_rates', 
      'discounts', 'payment_gateways'
    ];

    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✅ ${table} table: ${result.rows[0].count} records`);
      } catch (error) {
        console.error(`❌ ${table} table verification failed:`, error.message);
      }
    }

    console.log('\n🎉 New ecommerce system database is ready!');

  } catch (error) {
    console.error('❌ Error applying new schema:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the script
if (require.main === module) {
  applyNewSchema()
    .then(() => {
      console.log('\n✅ Schema application completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Schema application failed:', error);
      process.exit(1);
    });
}

module.exports = { applyNewSchema }; 