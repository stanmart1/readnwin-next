#!/usr/bin/env node

/**
 * Update Payment Status Constraint
 * Adds payment_processing to the allowed payment status values
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

async function updatePaymentStatusConstraint() {
  log('🔧 Updating Payment Status Constraint', 'bright');
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

    // Check current constraint
    logInfo('Checking current payment status constraint...');
    const currentConstraintResult = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'orders'::regclass 
      AND conname = 'orders_payment_status_check'
    `);
    
    if (currentConstraintResult.rows.length > 0) {
      logSuccess('Current constraint found:');
      log(`  ${currentConstraintResult.rows[0].definition}`, 'cyan');
    } else {
      logWarning('No payment status constraint found');
    }
    log('');

    // Drop the current constraint
    logInfo('Dropping current constraint...');
    await client.query(`
      ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check
    `);
    logSuccess('Current constraint dropped');
    log('');

    // Add new constraint with payment_processing
    logInfo('Adding new constraint with payment_processing...');
    await client.query(`
      ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
      CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'payment_processing'))
    `);
    logSuccess('New constraint added successfully');
    log('');

    // Verify the new constraint
    logInfo('Verifying new constraint...');
    const newConstraintResult = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint 
      WHERE conrelid = 'orders'::regclass 
      AND conname = 'orders_payment_status_check'
    `);
    
    if (newConstraintResult.rows.length > 0) {
      logSuccess('New constraint verified:');
      log(`  ${newConstraintResult.rows[0].definition}`, 'cyan');
    }
    log('');

    // Test inserting with payment_processing
    logInfo('Testing payment_processing value...');
    try {
      // Create a test order with payment_processing
      const testResult = await client.query(`
        INSERT INTO orders (
          order_number, user_id, status, subtotal, tax_amount, 
          shipping_amount, discount_amount, total_amount, currency, 
          payment_method, payment_status, created_at, updated_at
        ) VALUES (
          'TEST-${Date.now()}', 1, 'pending', 1000, 0, 0, 0, 1000, 
          'NGN', 'bank_transfer', 'payment_processing', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        ) RETURNING id
      `);
      
      logSuccess(`Test order created with ID: ${testResult.rows[0].id}`);
      
      // Clean up test order
      await client.query('DELETE FROM orders WHERE id = $1', [testResult.rows[0].id]);
      logSuccess('Test order cleaned up');
      
    } catch (error) {
      logError(`Test failed: ${error.message}`);
    }
    log('');

    client.release();
    logSuccess('Payment status constraint update completed successfully!');

  } catch (error) {
    logError(`Database operation failed: ${error.message}`);
  } finally {
    if (pool) {
      await pool.end();
      logInfo('Database connection pool closed');
    }
  }
}

// Run the update
updatePaymentStatusConstraint().catch(error => {
  logError(`Update failed: ${error.message}`);
  process.exit(1);
}); 