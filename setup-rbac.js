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

async function setupRBAC() {
  try {
    console.log('🔧 Setting up RBAC tables...');
    
    const sql = fs.readFileSync(path.join(__dirname, 'create-rbac-tables.sql'), 'utf8');
    await pool.query(sql);
    
    console.log('✅ RBAC tables created successfully!');
    
    // Verify tables exist
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('roles', 'permissions', 'user_roles', 'role_permissions', 'user_permission_cache')
      ORDER BY table_name
    `);
    
    console.log('📋 RBAC tables:', result.rows.map(r => r.table_name).join(', '));
    
  } catch (error) {
    console.error('❌ Error setting up RBAC:', error);
  } finally {
    await pool.end();
  }
}

setupRBAC();