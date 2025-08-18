const { Pool } = require('pg');

// Database connection configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || '149.102.159.118',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'S48lyoqo1mX7ytoiBvDZfCBB4TiCcGIU1rEdpu0NfBFP3V9q426PKDkGmV8aMD8b',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false, // SSL is disabled for the new database
});

async function addUpdatedAtColumn() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Adding updated_at column to payment_proofs table...');
    
    // Test connection
    const testResult = await client.query('SELECT NOW()');
    console.log('✅ Database connection successful:', testResult.rows[0]);
    
    // Check if updated_at column already exists
    const columnCheck = await client.query(`
      SELECT column_name
      FROM information_schema.columns 
      WHERE table_name = 'payment_proofs' 
      AND column_name = 'updated_at';
    `);
    
    if (columnCheck.rows.length > 0) {
      console.log('ℹ️ updated_at column already exists');
      return;
    }
    
    // Begin transaction
    await client.query('BEGIN');
    console.log('🔄 Starting transaction...');
    
    // Add updated_at column
    console.log('➕ Adding updated_at column...');
    await client.query(`
      ALTER TABLE payment_proofs 
      ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
    console.log('✅ updated_at column added');
    
    // Create trigger function if it doesn't exist
    console.log('🔧 Creating trigger function...');
    await client.query(`
      CREATE OR REPLACE FUNCTION update_payment_proofs_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    console.log('✅ Trigger function created');
    
    // Create trigger
    console.log('🔗 Creating trigger...');
    await client.query(`
      CREATE TRIGGER update_payment_proofs_updated_at 
      BEFORE UPDATE ON payment_proofs
      FOR EACH ROW EXECUTE FUNCTION update_payment_proofs_updated_at();
    `);
    console.log('✅ Trigger created');
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('✅ Transaction committed successfully');
    
    // Verify the final structure
    const finalStructure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'payment_proofs' 
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Final table structure:');
    finalStructure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check the triggers
    const triggers = await client.query(`
      SELECT trigger_name, event_manipulation, action_statement
      FROM information_schema.triggers 
      WHERE event_object_table = 'payment_proofs';
    `);
    
    if (triggers.rows.length > 0) {
      console.log('✅ Triggers found:');
      triggers.rows.forEach(trigger => {
        console.log(`  - ${trigger.trigger_name}: ${trigger.event_manipulation} -> ${trigger.action_statement.substring(0, 100)}...`);
      });
    }
    
    console.log('🎉 updated_at column addition completed successfully!');
    
  } catch (error) {
    console.error('❌ Operation failed:', error);
    
    // Rollback transaction if it was started
    try {
      await client.query('ROLLBACK');
      console.log('🔄 Transaction rolled back');
    } catch (rollbackError) {
      console.error('❌ Rollback failed:', rollbackError);
    }
    
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the operation
addUpdatedAtColumn()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
