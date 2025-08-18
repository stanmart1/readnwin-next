const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const dumpDir = 'database-dumps';
const fullDump = path.join(dumpDir, `full_dump_${timestamp}.sql`);

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || '149.102.159.118',
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'S48lyoqo1mX7ytoiBvDZfCBB4TiCcGIU1rEdpu0NfBFP3V9q426PKDkGmV8aMD8b',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false, // SSL is disabled for the new database
};

async function createDump() {
  const pool = new Pool({
    host: process.env.DB_HOST || '149.102.159.118',
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'S48lyoqo1mX7ytoiBvDZfCBB4TiCcGIU1rEdpu0NfBFP3V9q426PKDkGmV8aMD8b',
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: false, // SSL is disabled for the new database
  });
  
  try {
    console.log('🔧 Starting database dump...');
    
    // Create dump directory
    if (!fs.existsSync(dumpDir)) {
      fs.mkdirSync(dumpDir, { recursive: true });
    }
    
    // Test connection
    const client = await pool.connect();
    const versionResult = await client.query('SELECT version()');
    console.log(`✅ Connected to: ${versionResult.rows[0].version}`);
    
    // Get all tables
    const tablesResult = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    const tables = tablesResult.rows.map(row => row.tablename);
    console.log(`📊 Found ${tables.length} tables`);
    
    let dumpContent = `-- Database Dump\n`;
    dumpContent += `-- Generated: ${new Date().toISOString()}\n`;
    dumpContent += `-- Database: ${dbConfig.database}\n\n`;
    
    // Process each table
    for (const table of tables) {
      console.log(`📋 Processing table: ${table}`);
      
      try {
        // Get table structure
        const structureResult = await client.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = $1 AND table_schema = 'public'
          ORDER BY ordinal_position
        `, [table]);
        
        // Create table
        dumpContent += `-- Table: ${table}\n`;
        dumpContent += `DROP TABLE IF EXISTS "${table}" CASCADE;\n`;
        dumpContent += `CREATE TABLE "${table}" (\n`;
        
        const columns = structureResult.rows.map(col => {
          let def = `  "${col.column_name}" ${col.data_type}`;
          if (col.column_default) def += ` DEFAULT ${col.column_default}`;
          if (col.is_nullable === 'NO') def += ` NOT NULL`;
          return def;
        });
        
        dumpContent += columns.join(',\n') + '\n);\n\n';
        
        // Get data
        const dataResult = await client.query(`SELECT * FROM "${table}"`);
        
        if (dataResult.rows.length > 0) {
          const columnNames = structureResult.rows.map(col => `"${col.column_name}"`).join(', ');
          
          dataResult.rows.forEach(row => {
            const values = structureResult.rows.map(col => {
              const value = row[col.column_name];
              if (value === null) return 'NULL';
              if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
              if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
              return String(value);
            }).join(', ');
            
            dumpContent += `INSERT INTO "${table}" (${columnNames}) VALUES (${values});\n`;
          });
        }
        
        dumpContent += '\n';
        
      } catch (error) {
        console.log(`⚠️  Error processing table ${table}: ${error.message}`);
      }
    }
    
    // Write dump file
    fs.writeFileSync(fullDump, dumpContent);
    
    const stats = fs.statSync(fullDump);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`✅ Dump created: ${fullDump} (${sizeInMB} MB)`);
    console.log(`📁 Files saved in: ${dumpDir}/`);
    
    client.release();
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    await pool.end();
  }
}

createDump(); 