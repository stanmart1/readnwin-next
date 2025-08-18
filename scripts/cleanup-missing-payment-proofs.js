require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { existsSync } = require('fs');
const { join } = require('path');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false
});

async function cleanupMissingPaymentProofs() {
  const client = await pool.connect();
  try {
    console.log('🔍 Checking for missing payment proof files...');
    
    // Get all payment proofs
    const proofs = await client.query(`
      SELECT 
        id,
        file_name,
        file_path,
        upload_date,
        status
      FROM payment_proofs 
      ORDER BY upload_date DESC
    `);
    
    console.log(`📋 Found ${proofs.rows.length} payment proofs in database`);
    
    const missingFiles = [];
    const validFiles = [];
    
    for (const proof of proofs.rows) {
      const filename = proof.file_path.split('/').pop();
      if (filename) {
        const filePath = join(process.cwd(), 'public', 'uploads', 'payment-proofs', filename);
        
        if (existsSync(filePath)) {
          validFiles.push(proof);
        } else {
          missingFiles.push(proof);
          console.log(`❌ Missing file: ${filename} (ID: ${proof.id})`);
        }
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`  ✅ Valid files: ${validFiles.length}`);
    console.log(`  ❌ Missing files: ${missingFiles.length}`);
    
    if (missingFiles.length > 0) {
      console.log(`\n🔧 Cleaning up ${missingFiles.length} missing payment proof records...`);
      
      for (const proof of missingFiles) {
        console.log(`  - Deleting record for missing file: ${proof.file_name} (ID: ${proof.id})`);
        
        await client.query(
          'DELETE FROM payment_proofs WHERE id = $1',
          [proof.id]
        );
      }
      
      console.log(`✅ Cleanup completed. Removed ${missingFiles.length} orphaned records.`);
    } else {
      console.log(`✅ No missing files found. All payment proof records are valid.`);
    }
    
  } finally {
    client.release();
    await pool.end();
  }
}

cleanupMissingPaymentProofs().catch(console.error); 