#!/usr/bin/env node

/**
 * Check Users Table Structure
 * Examines the users table columns and constraints
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function checkUsersTable() {
  log('🔍 Checking Users Table Structure', 'bright');
  log('');

  // Database configuration
  const dbConfig = {
    user: process.env.DB_USER || 'readnwin_readnwinuser',
    host: process.env.DB_HOST || '149.102.159.118',
    database: 'postgres',
    password: process.env.DB_PASSWORD || 'izIoqVwU97i9niQPN3vj',
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: false,
  };

  let pool;
  try {
    pool = new Pool(dbConfig);
    const client = await pool.connect();
    
    logSuccess('Database connection successful!');
    log('');

    // Check users table columns
    logInfo('Checking users table columns...');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    logSuccess(`Found ${columnsResult.rows.length} columns in users table:`);
    columnsResult.rows.forEach((row, index) => {
      const nullable = row.is_nullable === 'YES' ? 'nullable' : 'NOT NULL';
      const defaultVal = row.column_default ? ` (default: ${row.column_default})` : '';
      log(`  ${index + 1}. ${row.column_name} (${row.data_type}) - ${nullable}${defaultVal}`, 'cyan');
    });
    log('');

    // Check orders table payment_status constraint
    logInfo('Checking orders table payment_status constraint...');
    const constraintResult = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'orders'::regclass 
      AND conname = 'orders_payment_status_check'
    `);
    
    if (constraintResult.rows.length > 0) {
      logSuccess('Payment status constraint found:');
      log(`  ${constraintResult.rows[0].definition}`, 'cyan');
    } else {
      logWarning('Payment status constraint not found');
    }
    log('');

    // Check orders table columns
    logInfo('Checking orders table payment_status column...');
    const ordersColumnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'payment_status'
    `);
    
    if (ordersColumnsResult.rows.length > 0) {
      logSuccess('Payment status column found:');
      const col = ordersColumnsResult.rows[0];
      log(`  ${col.column_name} (${col.data_type}) - ${col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'}`, 'cyan');
    } else {
      logError('Payment status column not found in orders table');
    }
    log('');

    // Test the problematic query
    logInfo('Testing the problematic query: SELECT name, email FROM users WHERE id = 1');
    try {
      const testResult = await client.query('SELECT name, email FROM users WHERE id = 1');
      logSuccess('Query executed successfully');
      log(`Result: ${JSON.stringify(testResult.rows[0])}`, 'cyan');
    } catch (error) {
      logError(`Query failed: ${error.message}`);
      
      // Try with correct column names
      logInfo('Trying with correct column names...');
      const correctResult = await client.query('SELECT first_name, last_name, email FROM users WHERE id = 1');
      logSuccess('Correct query executed successfully');
      log(`Result: ${JSON.stringify(correctResult.rows[0])}`, 'cyan');
    }
    log('');

    client.release();
    logSuccess('Users table check completed successfully!');

  } catch (error) {
    logError(`Database connection failed: ${error.message}`);
  } finally {
    if (pool) {
      await pool.end();
      logInfo('Database connection pool closed');
    }
  }
}

// Run the check
checkUsersTable().catch(error => {
  logError(`Check failed: ${error.message}`);
  process.exit(1);
}); 