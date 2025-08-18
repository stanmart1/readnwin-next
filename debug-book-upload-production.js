const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function debugBookUploadProduction() {
  console.log('🔍 Debugging book upload in production...\n');
  
  // Test database connection
  console.log('📋 Testing database connection...');
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: false // Disable SSL for production
  });

  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Test basic queries
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('books', 'authors', 'categories')
      ORDER BY table_name
    `);
    
    console.log('📋 Available tables:', tablesResult.rows.map(row => row.table_name));
    
    // Test authors table
    const authorsResult = await client.query('SELECT COUNT(*) as count FROM authors');
    console.log('📋 Authors count:', authorsResult.rows[0].count);
    
    // Test categories table
    const categoriesResult = await client.query('SELECT COUNT(*) as count FROM categories');
    console.log('📋 Categories count:', categoriesResult.rows[0].count);
    
    client.release();
    
  } catch (dbError) {
    console.error('❌ Database connection failed:', dbError.message);
    console.error('❌ Error details:', {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      port: process.env.DB_PORT || '5432',
      ssl: false
    });
  } finally {
    await pool.end();
  }
  
  // Test file upload paths
  console.log('\n📋 Testing file upload paths...');
  
  const uploadDirs = [
    '/app/media_root',
    '/app/media_root/covers',
    '/app/media_root/ebooks',
    '/app/media_root/audiobooks',
    '/app/media_root/samples'
  ];
  
  for (const dir of uploadDirs) {
    try {
      console.log(`📁 Testing directory: ${dir}`);
      
      // Check if directory exists
      try {
        await fs.access(dir);
        console.log(`   ✅ Directory exists: ${dir}`);
        
        // Test write permissions
        const testFile = path.join(dir, 'test.txt');
        await fs.writeFile(testFile, 'test');
        await fs.unlink(testFile);
        console.log(`   ✅ Write permissions OK`);
        
      } catch (accessError) {
        console.log(`   🔧 Directory doesn't exist, attempting to create: ${dir}`);
        try {
          await fs.mkdir(dir, { recursive: true });
          console.log(`   ✅ Directory created: ${dir}`);
          
          // Test write permissions after creation
          const testFile = path.join(dir, 'test.txt');
          await fs.writeFile(testFile, 'test');
          await fs.unlink(testFile);
          console.log(`   ✅ Write permissions OK`);
          
        } catch (mkdirError) {
          console.log(`   ❌ Failed to create directory: ${dir}`);
          console.log(`   ❌ Error: ${mkdirError.message}`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Error with directory ${dir}:`, error.message);
    }
  }
  
  // Test environment variables
  console.log('\n📋 Environment variables check...');
  console.log('   NODE_ENV:', process.env.NODE_ENV);
  console.log('   DB_HOST:', process.env.DB_HOST);
  console.log('   DB_NAME:', process.env.DB_NAME);
  console.log('   DB_USER:', process.env.DB_USER ? '***SET***' : 'NOT SET');
  console.log('   DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET');
  console.log('   DB_PORT:', process.env.DB_PORT || '5432');
  
  console.log('\n✅ Debug complete!');
  console.log('📋 Next steps:');
  console.log('   1. Check if database connection is working');
  console.log('   2. Verify file upload directories exist and are writable');
  console.log('   3. Check environment variables are properly set');
  console.log('   4. Try uploading a book again');
}

debugBookUploadProduction().catch(console.error); 