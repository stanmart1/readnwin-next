const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

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
    const result = await client.query('SELECT NOW() as current_time');
    client.release();
    log(`✅ Database connection successful: ${result.rows[0].current_time}`, 'green');
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

async function createDump(dumpType, outputFile, options = []) {
  const baseOptions = [
    '-h', dbConfig.host,
    '-p', dbConfig.port.toString(),
    '-U', dbConfig.user,
    '-d', dbConfig.database,
    '-f', outputFile
  ];

  const command = `PGPASSWORD="${dbConfig.password}" pg_dump ${baseOptions.join(' ')} ${options.join(' ')}`;
  
  try {
    log(`🔧 Creating ${dumpType} dump...`, 'blue');
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr && !stderr.includes('WARNING')) {
      log(`⚠️  ${dumpType} dump warnings: ${stderr}`, 'yellow');
    }
    
    log(`✅ ${dumpType} dump created: ${outputFile}`, 'green');
    return true;
  } catch (error) {
    log(`❌ Failed to create ${dumpType} dump: ${error.message}`, 'red');
    return false;
  }
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
`;

  const summaryFile = path.join(dumpDir, `migration_summary_${timestamp}.txt`);
  fs.writeFileSync(summaryFile, summary);
  log(`✅ Migration summary created: ${summaryFile}`, 'green');
}

async function main() {
  try {
    log('🔧 Starting database migration dump process...', 'blue');

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
    const schemaSuccess = await createDump('schema', schemaDump, [
      '--schema-only',
      '--no-owner',
      '--no-privileges',
      '--clean',
      '--if-exists',
      '--create'
    ]);

    if (!schemaSuccess) {
      process.exit(1);
    }

    // Create data dump
    const dataSuccess = await createDump('data', dataDump, [
      '--data-only',
      '--disable-triggers'
    ]);

    if (!dataSuccess) {
      process.exit(1);
    }

    // Create full dump
    const fullSuccess = await createDump('full', fullDump, [
      '--no-owner',
      '--no-privileges',
      '--clean',
      '--if-exists',
      '--create'
    ]);

    if (!fullSuccess) {
      process.exit(1);
    }

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
  createDump,
  testConnection,
  getTables
}; 