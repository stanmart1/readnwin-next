const { Pool } = require('pg');

async function checkAuthors() {
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
    console.log('✅ Database connected');
    
    // Check if authors table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'authors'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Authors table does not exist, creating it...');
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
      console.log('✅ Authors table created');
    } else {
      console.log('✅ Authors table exists');
    }
    
    // Check current authors
    const authorsResult = await client.query('SELECT id, name, email, status FROM authors ORDER BY name LIMIT 10');
    console.log(`📋 Current authors count: ${authorsResult.rows.length}`);
    
    if (authorsResult.rows.length === 0) {
      console.log('📋 No authors found, creating sample authors...');
      
      const sampleAuthors = [
        { name: 'John Doe', email: 'john@example.com', bio: 'A prolific writer of fiction novels.' },
        { name: 'Jane Smith', email: 'jane@example.com', bio: 'Expert in technical writing and documentation.' },
        { name: 'Michael Johnson', email: null, bio: 'Children\'s book author and illustrator.' },
        { name: 'Sarah Williams', email: 'sarah@example.com', bio: 'Romance novelist with multiple bestsellers.' },
        { name: 'David Brown', email: null, bio: 'Science fiction and fantasy author.' }
      ];
      
      for (const author of sampleAuthors) {
        await client.query(`
          INSERT INTO authors (name, email, bio, status)
          VALUES ($1, $2, $3, 'active')
        `, [author.name, author.email, author.bio]);
      }
      
      console.log(`✅ Created ${sampleAuthors.length} sample authors`);
      
      // Re-check authors
      const newAuthorsResult = await client.query('SELECT id, name, email, status FROM authors ORDER BY name');
      console.log(`📋 Authors after creation: ${newAuthorsResult.rows.length}`);
      newAuthorsResult.rows.forEach(author => {
        console.log(`   - ${author.name} (${author.email || 'No email'}) - ${author.status}`);
      });
    } else {
      console.log('📋 Existing authors:');
      authorsResult.rows.forEach(author => {
        console.log(`   - ${author.name} (${author.email || 'No email'}) - ${author.status}`);
      });
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

checkAuthors();