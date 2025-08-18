const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration from original Aiven database
const dbConfig = {
  host: 'readnwin-nextjs-book-nextjs.b.aivencloud.com',
  database: 'defaultdb',
  user: 'avnadmin',
  password: 'AVNS_Xv38UAMF77xN--vUfeX',
  port: 28428,
  ssl: {
    rejectUnauthorized: false
  }
};

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function createPostgreSQL17Dump() {
  const pool = new Pool(dbConfig);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const dumpFile = `readnwin_fresh_dump_postgres17_${timestamp}.sql`;
  
  try {
    log('🚀 Starting fresh PostgreSQL 17 compatible dump creation...', 'cyan');
    
    // Test connection
    const client = await pool.connect();
    const versionResult = await client.query('SELECT version()');
    log(`✅ Connected to PostgreSQL: ${versionResult.rows[0].version}`, 'green');
    
    // Get all tables
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    const tables = tablesResult.rows.map(row => row.tablename);
    log(`📊 Found ${tables.length} tables to dump`, 'blue');
    
    let dumpContent = `-- PostgreSQL 17 Compatible Database Dump
-- Generated: ${new Date().toISOString()}
-- Database: ${dbConfig.database}
-- Server: ${dbConfig.host}:${dbConfig.port}
-- PostgreSQL Version: 17.5
-- Compatibility: PostgreSQL 17+

-- Disable foreign key checks during import
SET session_replication_role = replica;

-- Drop database if exists (for fresh import)
DROP DATABASE IF EXISTS "${dbConfig.database}";

-- Create database
CREATE DATABASE "${dbConfig.database}";

-- Connect to the database
\\c "${dbConfig.database}";

-- Enable foreign key checks
SET session_replication_role = DEFAULT;

`;

    // Get sequences
    log('📝 Dumping sequences...', 'yellow');
    const sequencesResult = await client.query(`
      SELECT sequence_name 
      FROM information_schema.sequences 
      WHERE sequence_schema = 'public'
      ORDER BY sequence_name
    `);
    
    for (const seq of sequencesResult.rows) {
      const seqName = seq.sequence_name;
      const seqInfo = await client.query(`
        SELECT 
          start_value,
          minimum_value,
          maximum_value,
          increment,
          cycle_option,
          data_type
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public' 
        AND sequence_name = $1
      `, [seqName]);
      
      if (seqInfo.rows.length > 0) {
        const seqData = seqInfo.rows[0];
        dumpContent += `-- Sequence: ${seqName}
CREATE SEQUENCE IF NOT EXISTS "${seqName}"
    START WITH ${seqData.start_value}
    INCREMENT BY ${seqData.increment}
    MINVALUE ${seqData.minimum_value}
    MAXVALUE ${seqData.maximum_value}
    CYCLE ${seqData.cycle_option === 'YES' ? 'YES' : 'NO'};

`;
      }
    }

    // Process each table
    for (const table of tables) {
      log(`📋 Processing table: ${table}`, 'yellow');
      
      // Get table structure
      const structureResult = await client.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1 
        ORDER BY ordinal_position
      `, [table]);
      
      // Get primary key
      const pkResult = await client.query(`
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY' 
        AND tc.table_name = $1
        ORDER BY kcu.ordinal_position
      `, [table]);
      
      // Get foreign keys
      const fkResult = await client.query(`
        SELECT 
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          rc.update_rule,
          rc.delete_rule
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        JOIN information_schema.referential_constraints AS rc
          ON rc.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = $1
      `, [table]);
      
      // Get indexes
      const indexResult = await client.query(`
        SELECT 
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE tablename = $1 
        AND indexname NOT LIKE '%_pkey'
        ORDER BY indexname
      `, [table]);
      
      // Create table structure
      dumpContent += `-- Table: ${table}
DROP TABLE IF EXISTS "${table}" CASCADE;

CREATE TABLE "${table}" (
`;
      
      const columns = [];
      for (const col of structureResult.rows) {
        let colDef = `  "${col.column_name}" ${col.data_type}`;
        
        if (col.character_maximum_length) {
          colDef += `(${col.character_maximum_length})`;
        } else if (col.numeric_precision && col.numeric_scale) {
          colDef += `(${col.numeric_precision},${col.numeric_scale})`;
        } else if (col.numeric_precision) {
          colDef += `(${col.numeric_precision})`;
        }
        
        if (col.is_nullable === 'NO') {
          colDef += ' NOT NULL';
        }
        
        if (col.column_default) {
          colDef += ` DEFAULT ${col.column_default}`;
        }
        
        columns.push(colDef);
      }
      
      dumpContent += columns.join(',\n') + '\n);\n\n';
      
      // Add primary key
      if (pkResult.rows.length > 0) {
        const pkColumns = pkResult.rows.map(row => `"${row.column_name}"`).join(', ');
        dumpContent += `-- Primary key for ${table}
ALTER TABLE "${table}" ADD CONSTRAINT "${table}_pkey" PRIMARY KEY (${pkColumns});

`;
      }
      
      // Add foreign keys
      for (const fk of fkResult.rows) {
        dumpContent += `-- Foreign key constraint for ${table}.${fk.column_name}
ALTER TABLE "${table}" ADD CONSTRAINT "${table}_${fk.column_name}_fkey" 
  FOREIGN KEY ("${fk.column_name}") 
  REFERENCES "${fk.foreign_table_name}" ("${fk.foreign_column_name}")
  ON UPDATE ${fk.update_rule} 
  ON DELETE ${fk.delete_rule};

`;
      }
      
      // Add indexes
      for (const idx of indexResult.rows) {
        dumpContent += `-- Index: ${idx.indexname}
${idx.indexdef};

`;
      }
      
      // Get table data
      const dataResult = await client.query(`SELECT * FROM "${table}" ORDER BY 1`);
      
      if (dataResult.rows.length > 0) {
        dumpContent += `-- Data for ${table}
`;
        
        for (const row of dataResult.rows) {
          const columns = Object.keys(row);
          const values = columns.map(col => {
            const value = row[col];
            if (value === null) return 'NULL';
            if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
            if (typeof value === 'boolean') return value ? 'true' : 'false';
            if (value instanceof Date) return `'${value.toISOString()}'`;
            return value;
          });
          
          dumpContent += `INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        dumpContent += '\n';
      }
      
      log(`✅ Completed table: ${table} (${dataResult.rows.length} rows)`, 'green');
    }
    
    // Add final statements
    dumpContent += `-- Reset sequences to their current values
`;
    
    for (const seq of sequencesResult.rows) {
      const seqName = seq.sequence_name;
      const lastValueResult = await client.query(`
        SELECT last_value FROM "${seqName}"
      `);
      
      if (lastValueResult.rows.length > 0) {
        const lastValue = lastValueResult.rows[0].last_value;
        dumpContent += `SELECT setval('"${seqName}"', ${lastValue}, true);\n`;
      }
    }
    
    dumpContent += `
-- Enable foreign key checks
SET session_replication_role = DEFAULT;

-- Analyze tables for optimal performance
`;
    
    for (const table of tables) {
      dumpContent += `ANALYZE "${table}";\n`;
    }
    
    // Write to file
    fs.writeFileSync(dumpFile, dumpContent);
    
    const fileSize = (fs.statSync(dumpFile).size / 1024 / 1024).toFixed(2);
    log(`✅ PostgreSQL 17 compatible dump created successfully!`, 'green');
    log(`📁 File: ${dumpFile}`, 'blue');
    log(`📊 Size: ${fileSize} MB`, 'blue');
    log(`📋 Tables: ${tables.length}`, 'blue');
    log(`🔄 Sequences: ${sequencesResult.rows.length}`, 'blue');
    
    client.release();
    await pool.end();
    
    return dumpFile;
    
  } catch (error) {
    log(`❌ Error creating dump: ${error.message}`, 'red');
    console.error(error);
    await pool.end();
    throw error;
  }
}

// Run the script
createPostgreSQL17Dump()
  .then(dumpFile => {
    log(`🎉 Fresh PostgreSQL 17 dump completed: ${dumpFile}`, 'green');
    process.exit(0);
  })
  .catch(error => {
    log(`💥 Dump creation failed: ${error.message}`, 'red');
    process.exit(1);
  }); 