require('dotenv').config();
const { Pool } = require('pg');

async function testAuthors() {
  console.log('🔍 Testing Authors functionality...');
  
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: false
  });

  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    
    // Check if authors table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'authors'
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('❌ Authors table does not exist, creating it...');
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS authors (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          bio TEXT,
          avatar_url VARCHAR(500),
          website_url VARCHAR(500),
          social_media JSONB,
          is_verified BOOLEAN DEFAULT false,
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Authors table created');
    } else {
      console.log('✅ Authors table exists');
    }
    
    // Check current authors count
    const countResult = await client.query('SELECT COUNT(*) as count FROM authors');
    const authorCount = parseInt(countResult.rows[0].count);
    console.log(`📋 Current authors in database: ${authorCount}`);
    
    if (authorCount === 0) {
      console.log('📋 No authors found, creating sample authors...');
      
      const sampleAuthors = [
        'John Doe',
        'Jane Smith', 
        'Michael Johnson',
        'Sarah Williams',
        'David Brown'
      ];
      
      for (const name of sampleAuthors) {
        await client.query(`
          INSERT INTO authors (name, status) VALUES ($1, 'active')
        `, [name]);
      }
      
      console.log(`✅ Created ${sampleAuthors.length} sample authors`);
    }
    
    // Show current authors
    const authorsResult = await client.query(`
      SELECT id, name, email, status, created_at 
      FROM authors 
      ORDER BY name 
      LIMIT 10
    `);
    
    console.log('📋 Current authors:');
    authorsResult.rows.forEach(author => {
      console.log(`   - ID: ${author.id}, Name: ${author.name}, Status: ${author.status}`);
    });
    
    client.release();
    await pool.end();
    console.log('✅ Authors functionality test completed successfully');
    
  } catch (error) {
    console.error('❌ Error testing authors:', error.message);
    await pool.end();
    process.exit(1);
  }
}

testAuthors();