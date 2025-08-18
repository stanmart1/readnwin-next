require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function cleanupWorksDuplicates() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Cleaning up duplicate works...');
    
    // First, let's see what we have
    const allWorks = await client.query(`
      SELECT id, title, image_path, order_index FROM works ORDER BY id
    `);
    
    console.log('\n📋 Current works before cleanup:');
    allWorks.rows.forEach(work => {
      console.log(`  - ID ${work.id}: ${work.title} (Order: ${work.order_index})`);
    });
    
    // Delete duplicates (keep IDs 1-5, delete IDs 6-10)
    const deleteResult = await client.query(`
      DELETE FROM works WHERE id IN (6, 7, 8, 9, 10)
    `);
    
    console.log(`\n🗑️  Deleted ${deleteResult.rowCount} duplicate entries`);
    
    // Verify the cleanup
    const remainingWorks = await client.query(`
      SELECT id, title, image_path, order_index FROM works ORDER BY order_index, id
    `);
    
    console.log('\n📋 Remaining works after cleanup:');
    remainingWorks.rows.forEach(work => {
      console.log(`  - ID ${work.id}: ${work.title} (Order: ${work.order_index})`);
    });
    
    console.log(`\n✅ Cleanup completed! ${remainingWorks.rows.length} works remaining`);
    
  } catch (error) {
    console.error('❌ Error cleaning up works:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

cleanupWorksDuplicates().catch(console.error); 