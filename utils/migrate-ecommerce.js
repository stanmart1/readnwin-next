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

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting ecommerce database migration...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'ecommerce-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📖 Reading schema file...');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          await client.query(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          // Ignore errors for statements that might already exist
          if (error.message.includes('already exists') || error.message.includes('duplicate key')) {
            console.log(`⚠️  Statement ${i + 1} skipped (already exists): ${error.message}`);
          } else {
            console.error(`❌ Error executing statement ${i + 1}:`, error.message);
            throw error;
          }
        }
      }
    }
    
    console.log('🎉 Ecommerce database migration completed successfully!');
    
    // Verify the tables were created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('books', 'categories', 'authors', 'orders', 'cart_items')
      ORDER BY table_name
    `);
    
    console.log('📊 Created tables:', tablesResult.rows.map(row => row.table_name));
    
    // Check if we have any data
    const categoriesResult = await client.query('SELECT COUNT(*) as count FROM categories');
    const authorsResult = await client.query('SELECT COUNT(*) as count FROM authors');
    const booksResult = await client.query('SELECT COUNT(*) as count FROM books');
    
    console.log('📈 Data summary:');
    console.log(`   Categories: ${categoriesResult.rows[0].count}`);
    console.log(`   Authors: ${authorsResult.rows[0].count}`);
    console.log(`   Books: ${booksResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigration }; 