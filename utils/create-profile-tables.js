const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createProfileTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Creating profile-related tables...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-profile-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await client.query(sql);
    
    console.log('✅ Profile tables created successfully');
    
    // Verify tables were created
    const tables = ['student_info', 'reading_progress', 'genres', 'book_genres'];
    
    for (const table of tables) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `, [table]);
      
      console.log(`📋 ${table} table exists: ${result.rows[0].exists}`);
    }
    
    // Check users table columns
    const usersColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name IN ('bio', 'profile_image', 'is_student')
    `);
    
    console.log('👤 Users table additional columns:');
    usersColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating profile tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  createProfileTables()
    .then(() => {
      console.log('🎉 Profile tables setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Failed to create profile tables:', error);
      process.exit(1);
    });
}

module.exports = { createProfileTables };