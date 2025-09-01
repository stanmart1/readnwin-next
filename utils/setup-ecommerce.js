const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Safe database configuration
function getDatabaseConfig() {
  const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: true, // Always validate certificates in production
      ca: process.env.DB_CA_CERT,
    } : false,
  };
}

const pool = new Pool(getDatabaseConfig());

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