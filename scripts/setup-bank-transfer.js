const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupBankTransfer() {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || '149.102.159.118',
    database: process.env.DB_NAME || 'postgres',
    password: process.env.DB_PASSWORD || 'S48lyoqo1mX7ytoiBvDZfCBB4TiCcGIU1rEdpu0NfBFP3V9q426PKDkGmV8aMD8b',
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: false, // SSL is disabled for the new database
  });

  try {
    console.log('🔧 Setting up bank transfer tables...');
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'setup-bank-transfer.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    await pool.query(schema);
    
    console.log('✅ Bank transfer tables created successfully!');
    
    // Verify the tables exist
    const tables = ['bank_transfers', 'bank_accounts', 'payment_proofs', 'bank_transfer_notifications'];
    
    for (const table of tables) {
      const result = await pool.query(`
        SELECT COUNT(*) as count FROM ${table}
      `);
      console.log(`📊 Table ${table}: ${result.rows[0].count} records`);
    }
    
    // Check bank accounts
    const bankAccounts = await pool.query(`
      SELECT bank_name, account_number, account_name, is_default 
      FROM bank_accounts
    `);
    
    console.log('🏦 Bank accounts:');
    bankAccounts.rows.forEach(account => {
      console.log(`  - ${account.bank_name}: ${account.account_number} (${account.is_default ? 'DEFAULT' : 'secondary'})`);
    });
    
    console.log('🎉 Bank transfer setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up bank transfer tables:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupBankTransfer()
    .then(() => {
      console.log('✅ Setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupBankTransfer }; 