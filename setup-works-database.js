require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function setupWorksDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Setting up works database...');
    
    // Read and execute the SQL file
    const sqlPath = path.join(__dirname, 'create-works-table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`📝 Executing: ${statement.substring(0, 50)}...`);
        await client.query(statement);
      }
    }
    
    console.log('✅ Works database setup completed successfully!');
    
    // Verify the table was created
    const result = await client.query(`
      SELECT COUNT(*) as count FROM works
    `);
    
    console.log(`📊 Found ${result.rows[0].count} works in the database`);
    
    // List all works
    const works = await client.query(`
      SELECT id, title, image_path, is_active FROM works ORDER BY order_index
    `);
    
    console.log('\n📋 Current works:');
    works.rows.forEach(work => {
      console.log(`  - ID ${work.id}: ${work.title} (${work.is_active ? 'Active' : 'Inactive'})`);
    });
    
  } catch (error) {
    console.error('❌ Error setting up works database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

setupWorksDatabase().catch(console.error); 