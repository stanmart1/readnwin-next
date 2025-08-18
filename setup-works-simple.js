require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

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
    
    // Create the works table
    await client.query(`
      CREATE TABLE IF NOT EXISTS works (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_path VARCHAR(500) NOT NULL,
        alt_text VARCHAR(255) NOT NULL,
        order_index INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Works table created');
    
    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_works_order ON works(order_index ASC, created_at DESC)
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_works_active ON works(is_active) WHERE is_active = true
    `);
    
    console.log('✅ Indexes created');
    
    // Insert sample data
    await client.query(`
      INSERT INTO works (title, description, image_path, alt_text, order_index, is_active) VALUES
      ('Digital Library Innovation', 'Revolutionary digital library platform that transforms how readers discover and engage with books.', '/carousel/one.jpeg', 'Digital library interface with modern design', 1, true),
      ('Reading Experience Design', 'User-centered design approach that creates immersive and intuitive reading experiences.', '/carousel/two.jpeg', 'Modern reading interface with clean design', 2, true),
      ('E-Book Platform Development', 'Advanced e-book platform with seamless reading across all devices and formats.', '/carousel/three.jpeg', 'E-book platform with multiple device support', 3, true),
      ('User Interface Excellence', 'Beautiful and functional user interfaces that enhance the reading journey.', '/carousel/four.jpeg', 'Polished user interface design', 4, true),
      ('Technology Integration', 'Seamless integration of cutting-edge technology to enhance the reading experience.', '/carousel/five.jpeg', 'Technology integration showcase', 5, true)
      ON CONFLICT DO NOTHING
    `);
    
    console.log('✅ Sample data inserted');
    
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