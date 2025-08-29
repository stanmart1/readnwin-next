const { Pool } = require('pg');

async function debugAuthorCreation() {
  console.log('🔍 Debugging author creation...\n');
  
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
    console.log('✅ Database connection successful');
    
    // Check if authors table exists
    console.log('\n📋 Checking authors table...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'authors'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Authors table does not exist! Creating it...');
      
      await client.query(`
        CREATE TABLE authors (
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
      
      console.log('✅ Authors table created successfully');
    } else {
      console.log('✅ Authors table exists');
    }
    
    // Check table structure
    console.log('\n📋 Checking authors table structure...');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'authors' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Authors table columns:');
    columnsResult.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'} ${col.column_default ? `DEFAULT: ${col.column_default}` : ''}`);
    });
    
    // Test author creation
    console.log('\n🔍 Testing author creation...');
    const testAuthorName = 'Test Author ' + Date.now();
    
    try {
      const result = await client.query(`
        INSERT INTO authors (name, email, bio, avatar_url, website_url, social_media, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        testAuthorName,
        null, // email
        '', // bio
        null, // avatar_url
        '', // website_url
        null, // social_media
        'active' // status
      ]);
      
      console.log('✅ Author created successfully!');
      console.log('📋 Created author:', result.rows[0]);
      
      // Clean up
      await client.query('DELETE FROM authors WHERE id = $1', [result.rows[0].id]);
      console.log('✅ Test author cleaned up');
      
    } catch (insertError) {
      console.error('❌ AUTHOR CREATION FAILED!');
      console.error('❌ Error message:', insertError.message);
      console.error('❌ Error code:', insertError.code);
      console.error('❌ Error detail:', insertError.detail);
      console.error('❌ Error hint:', insertError.hint);
      console.error('❌ Error constraint:', insertError.constraint);
    }
    
    client.release();
    
  } catch (dbError) {
    console.error('❌ Database connection failed:', dbError.message);
  } finally {
    await pool.end();
  }
}

debugAuthorCreation().catch(console.error);