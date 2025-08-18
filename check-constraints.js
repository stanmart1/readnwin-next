const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Database connection configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || '149.102.159.118',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'S48lyoqo1mX7ytoiBvDZfCBB4TiCcGIU1rEdpu0NfBFP3V9q426PKDkGmV8aMD8b',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false, // SSL is disabled for the new database
});

async function checkConstraints() {
  try {
    console.log('🔍 Checking book_reviews table constraints...\n');
    
    // 1. Check current check constraints
    console.log('1. Current check constraints:');
    const constraintsResult = await pool.query(`
      SELECT 
        conname as constraint_name,
        pg_get_constraintdef(oid) as constraint_definition
      FROM pg_constraint 
      WHERE conrelid = 'book_reviews'::regclass 
        AND contype = 'c';
    `);
    
    if (constraintsResult.rows.length > 0) {
      constraintsResult.rows.forEach(row => {
        console.log(`   ${row.constraint_name}: ${row.constraint_definition}`);
      });
    } else {
      console.log('   No check constraints found');
    }
    console.log('');
    
    // 2. Check current status values
    console.log('2. Current status values in book_reviews:');
    const statusValues = await pool.query(`
      SELECT DISTINCT status FROM book_reviews ORDER BY status;
    `);
    
    statusValues.rows.forEach(row => {
      console.log(`   - ${row.status}`);
    });
    console.log('');
    
    // 3. Check what the code is trying to insert
    console.log('3. Testing status values...');
    const testStatuses = ['pending', 'approved', 'rejected', 'approve', 'reject'];
    
    for (const status of testStatuses) {
      try {
        const testResult = await pool.query(`
          SELECT '${status}'::varchar as test_status
        `);
        console.log(`   ✅ '${status}' is valid`);
      } catch (error) {
        console.log(`   ❌ '${status}' is invalid: ${error.message}`);
      }
    }
    console.log('');
    
    // 4. Show the failing row details
    console.log('4. Failing row details from error:');
    console.log('   Row contains: (1, 1, 1, 5, "Excellent insights on money psychology", "This book completely changed my perspective on money and investi...", t, 12, "approve", 2025-07-28 18:45:35.951, 2025-08-07 17:59:39.262674, f)');
    console.log('   Problem: status = "approve" (should be "approved")');
    console.log('');
    
    // 5. Fix the constraint if needed
    console.log('5. Checking if constraint needs to be updated...');
    const constraintCheck = await pool.query(`
      SELECT 
        conname as constraint_name,
        pg_get_constraintdef(oid) as constraint_definition
      FROM pg_constraint 
      WHERE conrelid = 'book_reviews'::regclass 
        AND contype = 'c'
        AND conname = 'book_reviews_status_check';
    `);
    
    if (constraintCheck.rows.length > 0) {
      const constraint = constraintCheck.rows[0];
      console.log(`   Current constraint: ${constraint.constraint_definition}`);
      
      // Check if it allows 'approved' and 'rejected'
      if (constraint.constraint_definition.includes("'approved'") && 
          constraint.constraint_definition.includes("'rejected'")) {
        console.log('   ✅ Constraint looks correct');
      } else {
        console.log('   ❌ Constraint needs to be updated');
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking constraints:', error);
  } finally {
    await pool.end();
  }
}

checkConstraints(); 