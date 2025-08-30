const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Setting up database tables...');
    
    // Read and execute the SQL file
    const sqlFile = path.join(__dirname, 'create-missing-tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      try {
        await pool.query(statement);
        console.log('✓ Executed:', statement.split('\n')[0].trim());
      } catch (error) {
        console.log('⚠ Warning:', error.message);
      }
    }
    
    console.log('Database setup completed!');
    
  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    await pool.end();
  }
}

setupDatabase();