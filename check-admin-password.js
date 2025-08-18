const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'avnadmin',
  host: process.env.DB_HOST || 'readnwin-nextjs-book-nextjs.b.aivencloud.com',
  database: process.env.DB_NAME || 'defaultdb',
  password: process.env.DB_PASSWORD || 'AVNS_Xv38UAMF77xN--vUfeX',
  port: parseInt(process.env.DB_PORT || '28428'),
  ssl: {
    rejectUnauthorized: false,
  },
});

async function checkAdminPassword() {
  try {
    console.log('🔍 Checking admin user password...');
    
    // Get admin user from database
    const result = await pool.query(
      'SELECT id, email, username, password_hash, status FROM users WHERE email = $1',
      ['admin@readnwin.com']
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Admin user not found in database');
      return;
    }
    
    const adminUser = result.rows[0];
    console.log('✅ Admin user found:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Status: ${adminUser.status}`);
    console.log(`   Password Hash: ${adminUser.password_hash}`);
    
    // Test password verification
    const testPassword = 'Admin123!';
    const isValid = await bcrypt.compare(testPassword, adminUser.password_hash);
    
    console.log(`\n🔐 Password verification test:`);
    console.log(`   Test password: ${testPassword}`);
    console.log(`   Is valid: ${isValid ? '✅ YES' : '❌ NO'}`);
    
    // Generate a new hash for comparison
    const newHash = await bcrypt.hash(testPassword, 12);
    console.log(`\n🔄 New hash for '${testPassword}':`);
    console.log(`   ${newHash}`);
    
    // Test the new hash
    const newHashValid = await bcrypt.compare(testPassword, newHash);
    console.log(`   New hash verification: ${newHashValid ? '✅ YES' : '❌ NO'}`);
    
    // Check if we need to update the password
    if (!isValid) {
      console.log('\n⚠️  Password hash mismatch detected!');
      console.log('   The stored hash does not match the expected password.');
      console.log('   This could be due to:');
      console.log('   1. Different bcrypt salt rounds');
      console.log('   2. Different password used during setup');
      console.log('   3. Database corruption');
      
      console.log('\n🛠️  To fix this, you can:');
      console.log('   1. Update the password hash in the database');
      console.log('   2. Or reset the admin password');
    }
    
  } catch (error) {
    console.error('❌ Error checking admin password:', error);
  } finally {
    await pool.end();
  }
}

checkAdminPassword(); 