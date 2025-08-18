const { Pool } = require('pg');

// Database configuration from .env.local
const dbConfig = {
  host: '149.102.159.118',
  database: 'readnwin_readnwindb',
  user: 'readnwin_readnwinuser',
  password: 'izIoqVwU97i9niQPN3vj',
  port: 5432
};

async function checkDatabaseSchema() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('🔍 Checking database schema...');
    
    const client = await pool.connect();
    
    // Check current database
    const dbResult = await client.query('SELECT current_database()');
    console.log(`📊 Current database: ${dbResult.rows[0].current_database}`);
    
    // Check current schema
    const schemaResult = await client.query('SELECT current_schema()');
    console.log(`📋 Current schema: ${schemaResult.rows[0].current_schema}`);
    
    // List all schemas
    const schemasResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      ORDER BY schema_name
    `);
    console.log('\n📚 Available schemas:');
    schemasResult.rows.forEach(row => {
      console.log(`  - ${row.schema_name}`);
    });
    
    // List all tables in all schemas
    const tablesResult = await client.query(`
      SELECT 
        table_schema,
        table_name,
        table_type
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY table_schema, table_name
    `);
    
    console.log('\n📋 Available tables:');
    if (tablesResult.rows.length === 0) {
      console.log('  No tables found in user schemas');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_schema}.${row.table_name} (${row.table_type})`);
      });
    }
    
    // Check if there are any tables in public schema specifically
    const publicTablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`\n📊 Tables in public schema: ${publicTablesResult.rows.length}`);
    publicTablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Check sequences
    const sequencesResult = await client.query(`
      SELECT 
        sequence_schema,
        sequence_name
      FROM information_schema.sequences 
      WHERE sequence_schema NOT IN ('information_schema', 'pg_catalog')
      ORDER BY sequence_schema, sequence_name
    `);
    
    console.log('\n🔄 Available sequences:');
    if (sequencesResult.rows.length === 0) {
      console.log('  No sequences found in user schemas');
    } else {
      sequencesResult.rows.forEach(row => {
        console.log(`  - ${row.sequence_schema}.${row.sequence_name}`);
      });
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
    await pool.end();
    throw error;
  }
}

checkDatabaseSchema()
  .then(() => {
    console.log('\n✅ Schema check completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Schema check failed:', error.message);
    process.exit(1);
  }); 