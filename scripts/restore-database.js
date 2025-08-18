const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// New database configuration from Prisma
const NEW_DB_CONFIG = {
  connectionString: 'postgres://dedd81da84296adf743a389bfb303bb488459e613f6963738dee3209347767fc:sk_ax95N9XcuvZos2QGXmkJM@db.prisma.io:5432/?sslmode=require'
};

// Find the latest dump file
function findLatestDump() {
  const dumpDir = 'database-dumps';
  if (!fs.existsSync(dumpDir)) {
    throw new Error('Database dumps directory not found');
  }
  
  const files = fs.readdirSync(dumpDir)
    .filter(file => file.startsWith('full_dump_') && file.endsWith('.sql'))
    .sort()
    .reverse();
  
  if (files.length === 0) {
    throw new Error('No dump files found');
  }
  
  return path.join(dumpDir, files[0]);
}

async function testConnection() {
  const pool = new Pool(NEW_DB_CONFIG);
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    client.release();
    console.log(`✅ Connected to new database: ${result.rows[0].current_time}`);
    console.log(`📊 PostgreSQL Version: ${result.rows[0].version}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to connect to new database: ${error.message}`);
    return false;
  } finally {
    await pool.end();
  }
}

async function restoreDatabase(dumpFile) {
  const pool = new Pool(NEW_DB_CONFIG);
  
  try {
    console.log('🔧 Starting database restoration...');
    console.log(`📁 Using dump file: ${dumpFile}`);
    
    // Read the dump file
    const dumpContent = fs.readFileSync(dumpFile, 'utf8');
    console.log(`📊 Dump file size: ${(dumpContent.length / 1024 / 1024).toFixed(2)} MB`);
    
    // Split the dump into individual statements
    const statements = dumpContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📋 Found ${statements.length} SQL statements to execute`);
    
    const client = await pool.connect();
    
    // Execute statements in batches
    const batchSize = 10;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i += batchSize) {
      const batch = statements.slice(i, i + batchSize);
      
      for (const statement of batch) {
        try {
          if (statement.trim()) {
            await client.query(statement);
            successCount++;
          }
        } catch (error) {
          console.log(`⚠️  Error executing statement: ${error.message}`);
          errorCount++;
        }
      }
      
      // Progress update
      const progress = Math.round(((i + batchSize) / statements.length) * 100);
      console.log(`📈 Progress: ${Math.min(progress, 100)}% (${successCount} successful, ${errorCount} errors)`);
    }
    
    client.release();
    
    console.log(`✅ Database restoration completed!`);
    console.log(`📊 Results: ${successCount} statements executed successfully, ${errorCount} errors`);
    
    return { successCount, errorCount };
    
  } catch (error) {
    console.error(`❌ Error during restoration: ${error.message}`);
    throw error;
  } finally {
    await pool.end();
  }
}

async function verifyRestoration() {
  const pool = new Pool(NEW_DB_CONFIG);
  
  try {
    console.log('🔍 Verifying database restoration...');
    
    const client = await pool.connect();
    
    // Check if tables were created
    const tablesResult = await client.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tableCount = parseInt(tablesResult.rows[0].table_count);
    console.log(`📊 Tables found: ${tableCount}`);
    
    // Check some key tables
    const keyTables = ['users', 'books', 'orders', 'categories'];
    for (const table of keyTables) {
      try {
        const countResult = await client.query(`SELECT COUNT(*) as count FROM "${table}"`);
        console.log(`📋 Table "${table}": ${countResult.rows[0].count} records`);
      } catch (error) {
        console.log(`⚠️  Table "${table}" not found or error: ${error.message}`);
      }
    }
    
    client.release();
    
  } catch (error) {
    console.error(`❌ Error during verification: ${error.message}`);
  } finally {
    await pool.end();
  }
}

async function main() {
  try {
    console.log('🚀 Starting database migration to Prisma...');
    
    // Find the latest dump file
    const dumpFile = findLatestDump();
    console.log(`📁 Found dump file: ${dumpFile}`);
    
    // Test connection to new database
    console.log('🔧 Testing connection to new database...');
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.error('❌ Cannot proceed without database connection');
      process.exit(1);
    }
    
    // Restore the database
    const results = await restoreDatabase(dumpFile);
    
    // Verify the restoration
    await verifyRestoration();
    
    console.log('\n🎉 Database migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update your .env file with the new database URL:');
    console.log(`   DATABASE_URL="${NEW_DB_CONFIG.connectionString}"`);
    console.log('2. Test your application with the new database');
    console.log('3. Update any other configuration files that reference the old database');
    
  } catch (error) {
    console.error(`❌ Migration failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  testConnection,
  restoreDatabase,
  verifyRestoration
}; 