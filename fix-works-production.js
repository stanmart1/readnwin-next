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

async function fixWorksProduction() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Fixing works production issues...');
    
    // 1. Check if works table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'works'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('📝 Creating works table...');
      
      await client.query(`
        CREATE TABLE works (
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
        CREATE INDEX idx_works_order ON works(order_index ASC, created_at DESC)
      `);
      
      await client.query(`
        CREATE INDEX idx_works_active ON works(is_active) WHERE is_active = true
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
      `);
      
      console.log('✅ Sample data inserted');
    } else {
      console.log('✅ Works table already exists');
    }
    
    // 2. Check current works
    const works = await client.query(`
      SELECT id, title, image_path, is_active FROM works ORDER BY order_index
    `);
    
    console.log(`\n📊 Current works in database: ${works.rows.length}`);
    works.rows.forEach(work => {
      console.log(`  - ID ${work.id}: ${work.title} (${work.is_active ? 'Active' : 'Inactive'})`);
    });
    
    // 3. Test database connection
    const testResult = await client.query('SELECT COUNT(*) as count FROM works WHERE is_active = true');
    console.log(`\n✅ Database test: ${testResult.rows[0].count} active works found`);
    
  } catch (error) {
    console.error('❌ Error fixing works production:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixWorksProduction().catch(console.error); 