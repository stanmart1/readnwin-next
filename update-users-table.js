const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.production' });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false
});

async function updateUsersTable() {
  try {
    console.log('🔧 Adding role column to users table...');
    
    const sql = fs.readFileSync(path.join(__dirname, 'add-user-role-column.sql'), 'utf8');
    await pool.query(sql);
    
    console.log('✅ Users table updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating users table:', error);
  } finally {
    await pool.end();
  }
}

updateUsersTable();