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

async function setupEcommerce() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Setting up ecommerce database schema...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'ecommerce-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📖 Reading schema file...');
    
    // Execute the entire schema
    console.log('⏳ Executing schema...');
    await client.query(schema);
    console.log('✅ Schema executed successfully');
    
    console.log('🎉 Ecommerce database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupEcommerce()
    .then(() => {
      console.log('✅ Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupEcommerce }; 