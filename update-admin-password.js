const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// Database connection configuration
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

async function updateAdminPassword() {
  try {
    console.log('🔍 Updating admin password...');
    
    const client = await pool.connect();
    
    // Update admin user password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const updateResult = await client.query(`
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE email = 'admin@readnwin.com'
      RETURNING id, email, username
    `, [hashedPassword]);
    
    if (updateResult.rows.length > 0) {
      console.log('✅ Admin password updated successfully');
      console.log('Updated user:', updateResult.rows[0]);
      
      // Verify the password
      const verifyResult = await client.query(`
        SELECT password_hash FROM users WHERE email = 'admin@readnwin.com'
      `);
      
      const isValidPassword = await bcrypt.compare('admin123', verifyResult.rows[0].password_hash);
      console.log(`Password verification: ${isValidPassword ? '✅ Success' : '❌ Failed'}`);
      
      if (isValidPassword) {
        console.log('✅ Login credentials are now valid');
        console.log('Email: admin@readnwin.com');
        console.log('Password: admin123');
      }
    } else {
      console.log('❌ Admin user not found');
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error updating admin password:', error);
  } finally {
    await pool.end();
  }
}

updateAdminPassword(); 