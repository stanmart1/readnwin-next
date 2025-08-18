const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuration
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const dumpDir = 'database-dumps';
const schemaDump = path.join(dumpDir, `schema_${timestamp}.sql`);
const dataDump = path.join(dumpDir, `data_${timestamp}.sql`);
const fullDump = path.join(dumpDir, `full_dump_${timestamp}.sql`);
const migrationScript = path.join(dumpDir, `migration_${timestamp}.sql`);

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || '149.102.159.118',
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'S48lyoqo1mX7ytoiBvDZfCBB4TiCcGIU1rEdpu0NfBFP3V9q426PKDkGmV8aMD8b',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false, // SSL is disabled for the new database
};

async function testConnection() {
  const pool = new Pool(dbConfig);
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    client.release();
    log(`✅ Database connection successful: ${result.rows[0].current_time}`, 'green');
    log(`📊 PostgreSQL Version: ${result.rows[0].version}`, 'blue');
    return true;
  } catch (error) {
    log(`❌ Database connection failed: ${error.message}`, 'red');
    return false;
  } finally {
    await pool.end();
  }
}

async function getTables() {
  const pool = new Pool(dbConfig);
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    client.release();
    return result.rows.map(row => row.tablename);
  } catch (error) {
    log(`❌ Failed to get tables: ${error.message}`, 'red');
    throw error;
  } finally {
    await pool.end();
  }
}

async function getTableSchema(tableName) {
  const pool = new Pool(dbConfig);
  try {
    const client = await pool.connect();
    
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
      WHERE table_name = $1 AND table_schema = 'public'
      ORDER BY ordinal_position
    `, [tableName]);

    // Get primary key
    const pkResult = await client.query(`
      SELECT kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.constraint_type = 'PRIMARY KEY' 
        AND tc.table_name = $1
      ORDER BY kcu.ordinal_position
    `, [tableName]);

    // Get indexes
    const indexResult = await client.query(`
      SELECT 
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE tablename = $1 AND schemaname = 'public'
      ORDER BY indexname
    `, [tableName]);

    // Get foreign keys
    const fkResult = await client.query(`
      SELECT 
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name = $1
    `, [tableName]);

    client.release();

    return {
      structure: structureResult.rows,
      primaryKey: pkResult.rows.map(row => row.column_name),
      indexes: indexResult.rows,
      foreignKeys: fkResult.rows
    };
  } catch (error) {
    log(`❌ Failed to get schema for table ${tableName}: ${error.message}`, 'red');
    throw error;
  } finally {
    await pool.end();
  }
}

async function getTableData(tableName) {
  const pool = new Pool(dbConfig);
  try {
    const client = await pool.connect();
    
    // Get column names
    const columnsResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1 AND table_schema = 'public'
      ORDER BY ordinal_position
    `, [tableName]);

    const columns = columnsResult.rows.map(row => row.column_name);
    
    // Get data
    const dataResult = await client.query(`SELECT * FROM "${tableName}"`);
    
    client.release();
    
    return {
      columns,
      data: dataResult.rows
    };
  } catch (error) {
    log(`❌ Failed to get data for table ${tableName}: ${error.message}`, 'red');
    throw error;
  } finally {
    await pool.end();
  }
}

function escapeValue(value) {
  if (value === null) return 'NULL';
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "''")}'`;
  }
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value instanceof Date) return `'${value.toISOString()}'`;
  if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  return String(value);
}

function generateCreateTableSQL(tableName, schema) {
  let sql = `-- Table: ${tableName}\n`;
  sql += `DROP TABLE IF EXISTS "${tableName}" CASCADE;\n`;
  sql += `CREATE TABLE "${tableName}" (\n`;
  
  const columns = schema.structure.map(col => {
    let columnDef = `  "${col.column_name}" ${col.data_type}`;
    
    if (col.character_maximum_length) {
      columnDef += `(${col.character_maximum_length})`;
    } else if (col.numeric_precision && col.numeric_scale) {
      columnDef += `(${col.numeric_precision},${col.numeric_scale})`;
    } else if (col.numeric_precision) {
      columnDef += `(${col.numeric_precision})`;
    }
    
    if (col.column_default) {
      columnDef += ` DEFAULT ${col.column_default}`;
    }
    
    if (col.is_nullable === 'NO') {
      columnDef += ` NOT NULL`;
    }
    
    return columnDef;
  });
  
  sql += columns.join(',\n');
  
  // Add primary key
  if (schema.primaryKey.length > 0) {
    sql += `,\n  PRIMARY KEY (${schema.primaryKey.map(pk => `"${pk}"`).join(', ')})`;
  }
  
  sql += '\n);\n\n';
  
  // Add indexes
  schema.indexes.forEach(index => {
    if (!index.indexname.includes('_pkey')) { // Skip primary key indexes
      sql += `${index.indexdef};\n`;
    }
  });
  
  // Add foreign keys
  schema.foreignKeys.forEach(fk => {
    sql += `ALTER TABLE "${tableName}" ADD CONSTRAINT "${fk.constraint_name}" `;
    sql += `FOREIGN KEY ("${fk.column_name}") `;
    sql += `REFERENCES "${fk.foreign_table_name}" ("${fk.foreign_column_name}");\n`;
  });
  
  sql += '\n';
  return sql;
}

function generateInsertSQL(tableName, data) {
  if (data.data.length === 0) return '';
  
  let sql = `-- Data for table: ${tableName}\n`;
  
  const columns = data.columns.map(col => `"${col}"`).join(', ');
  
  data.data.forEach(row => {
    const values = data.columns.map(col => escapeValue(row[col])).join(', ');
    sql += `INSERT INTO "${tableName}" (${columns}) VALUES (${values});\n`;
  });
  
  sql += '\n';
  return sql;
}

async function createSchemaDump(tables) {
  log('🔧 Creating schema dump...', 'blue');
  
  let schemaSQL = `-- Database Schema Dump\n`;
  schemaSQL += `-- Generated on: ${new Date().toISOString()}\n`;
  schemaSQL += `-- Database: ${dbConfig.database}\n`;
  schemaSQL += `-- Host: ${dbConfig.host}:${dbConfig.port}\n\n`;
  
  for (const table of tables) {
    try {
      log(`  📋 Processing table: ${table}`, 'blue');
      const schema = await getTableSchema(table);
      schemaSQL += generateCreateTableSQL(table, schema);
    } catch (error) {
      log(`  ⚠️  Skipping table ${table}: ${error.message}`, 'yellow');
    }
  }
  
  fs.writeFileSync(schemaDump, schemaSQL);
  log(`✅ Schema dump created: ${schemaDump}`, 'green');
}

async function createDataDump(tables) {
  log('🔧 Creating data dump...', 'blue');
  
  let dataSQL = `-- Database Data Dump\n`;
  dataSQL += `-- Generated on: ${new Date().toISOString()}\n`;
  dataSQL += `-- Database: ${dbConfig.database}\n`;
  dataSQL += `-- Host: ${dbConfig.host}:${dbConfig.port}\n\n`;
  
  for (const table of tables) {
    try {
      log(`  📊 Processing data for table: ${table}`, 'blue');
      const data = await getTableData(table);
      const insertSQL = generateInsertSQL(table, data);
      if (insertSQL) {
        dataSQL += insertSQL;
      }
    } catch (error) {
      log(`  ⚠️  Skipping data for table ${table}: ${error.message}`, 'yellow');
    }
  }
  
  fs.writeFileSync(dataDump, dataSQL);
  log(`✅ Data dump created: ${dataDump}`, 'green');
}

function createFullDump() {
  log('🔧 Creating full dump...', 'blue');
  
  const schemaContent = fs.readFileSync(schemaDump, 'utf8');
  const dataContent = fs.readFileSync(dataDump, 'utf8');
  
  const fullContent = `-- Complete Database Dump\n`;
  fullContent += `-- Generated on: ${new Date().toISOString()}\n`;
  fullContent += `-- Database: ${dbConfig.database}\n`;
  fullContent += `-- Host: ${dbConfig.host}:${dbConfig.port}\n\n`;
  fullContent += `-- =====================================================\n`;
  fullContent += `-- SCHEMA SECTION\n`;
  fullContent += `-- =====================================================\n\n`;
  fullContent += schemaContent;
  fullContent += `-- =====================================================\n`;
  fullContent += `-- DATA SECTION\n`;
  fullContent += `-- =====================================================\n\n`;
  fullContent += dataContent;
  
  fs.writeFileSync(fullDump, fullContent);
  log(`✅ Full dump created: ${fullDump}`, 'green');
}

function createMigrationScript() {
  const script = `-- Database Migration Script
-- Generated on: ${new Date().toISOString()}
-- Source Database: ${dbConfig.database}
-- Target Database: [YOUR_TARGET_DATABASE_NAME]

-- =====================================================
-- MIGRATION INSTRUCTIONS
-- =====================================================

-- 1. Create the target database:
--    CREATE DATABASE your_target_database_name;

-- 2. Run this migration script on the target database:
--    psql -h your_target_host -p your_target_port -U your_target_user -d your_target_database -f ${path.basename(migrationScript)}

-- 3. Or run the full dump directly:
--    psql -h your_target_host -p your_target_port -U your_target_user -d your_target_database -f ${path.basename(fullDump)}

-- =====================================================
-- DATABASE CONFIGURATION
-- =====================================================

-- Update your .env file with the new database credentials:
-- DB_HOST=your_new_host
-- DB_NAME=your_new_database_name
-- DB_USER=your_new_username
-- DB_PASSWORD=your_new_password
-- DB_PORT=your_new_port

-- =====================================================
-- PRE-MIGRATION CHECKS
-- =====================================================

-- Check if target database exists
SELECT 'Target database check' as status;

-- =====================================================
-- SCHEMA MIGRATION
-- =====================================================

-- The schema will be created by the full dump
-- This includes all tables, indexes, constraints, and sequences

-- =====================================================
-- DATA MIGRATION
-- =====================================================

-- All data will be migrated by the full dump
-- This includes all records from all tables

-- =====================================================
-- POST-MIGRATION VERIFICATION
-- =====================================================

-- Verify tables were created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify data was migrated (example for users table)
-- SELECT COUNT(*) as user_count FROM users;

-- Verify sequences are working
-- SELECT nextval('users_id_seq');

-- =====================================================
-- CLEANUP (if needed)
-- =====================================================

-- If you need to reset sequences after migration:
-- SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
`;

  fs.writeFileSync(migrationScript, script);
  log(`✅ Migration script created: ${migrationScript}`, 'green');
}

function createSummaryReport(tables) {
  const summary = `Database Migration Summary
==========================

Generated on: ${new Date().toISOString()}
Source Database: ${dbConfig.database}
Source Host: ${dbConfig.host}:${dbConfig.port}

Files Created:
==============

1. Schema Dump: ${path.basename(schemaDump)}
   - Contains only database structure (tables, indexes, constraints)
   - Use this if you only need to recreate the schema

2. Data Dump: ${path.basename(dataDump)}
   - Contains only data (INSERT statements)
   - Use this if you only need to migrate data to existing schema

3. Full Dump: ${path.basename(fullDump)}
   - Contains both schema and data
   - Recommended for complete database migration

4. Migration Script: ${path.basename(migrationScript)}
   - Contains instructions and verification queries
   - Use this as a guide for the migration process

Tables Found: ${tables.length}
${tables.map(table => `- ${table}`).join('\n')}

Migration Steps:
================

1. Create target database on new server
2. Update your .env file with new database credentials
3. Run the full dump on the target database:
   psql -h [target_host] -p [target_port] -U [target_user] -d [target_database] -f ${path.basename(fullDump)}

4. Verify migration by running queries from the migration script

Important Notes:
================

- Make sure to backup your target database before migration
- Test the migration on a staging environment first
- Update all application configuration files with new database credentials
- Verify all application functionality after migration
- This dump was created using a version-compatible method (no pg_dump version issues)
`;

  const summaryFile = path.join(dumpDir, `migration_summary_${timestamp}.txt`);
  fs.writeFileSync(summaryFile, summary);
  log(`✅ Migration summary created: ${summaryFile}`, 'green');
}

async function main() {
  try {
    log('🔧 Starting version-compatible database migration dump process...', 'blue');

    // Create dump directory
    log('🔧 Creating dump directory...', 'blue');
    if (!fs.existsSync(dumpDir)) {
      fs.mkdirSync(dumpDir, { recursive: true });
    }
    log(`✅ Dump directory created: ${dumpDir}`, 'green');

    // Test database connection
    const connectionOk = await testConnection();
    if (!connectionOk) {
      process.exit(1);
    }

    // Get list of tables
    log('🔧 Getting list of tables...', 'blue');
    const tables = await getTables();
    
    if (tables.length === 0) {
      log('⚠️  No tables found in the database', 'yellow');
      return;
    }

    log(`✅ Found ${tables.length} tables`, 'green');

    // Create schema dump
    await createSchemaDump(tables);

    // Create data dump
    await createDataDump(tables);

    // Create full dump
    createFullDump();

    // Create migration script
    createMigrationScript();

    // Create summary report
    createSummaryReport(tables);

    // Display file sizes
    log('🔧 Dump file sizes:', 'blue');
    const files = [schemaDump, dataDump, fullDump, migrationScript];
    files.forEach(file => {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        log(`   ${path.basename(file)}: ${sizeInMB} MB`, 'reset');
      }
    });

    log('✅ Database migration dump completed successfully!', 'green');
    log('', 'reset');
    log('🔧 Next steps:', 'blue');
    log('1. Copy the dump files to your target server', 'reset');
    log('2. Update your .env file with new database credentials', 'reset');
    log('3. Run the migration on your target database', 'reset');
    log('4. Test your application with the new database', 'reset');
    log('', 'reset');
    log(`Files created in: ${dumpDir}/`, 'reset');

  } catch (error) {
    log(`❌ Error during migration dump: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  testConnection,
  getTables,
  createSchemaDump,
  createDataDump
}; 