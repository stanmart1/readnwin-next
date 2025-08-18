const { Pool } = require('pg');

async function simpleBookInsert() {
  console.log('🔍 Testing simple book insertion...\n');
  
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
    
    // Get valid author and category
    const authorResult = await client.query('SELECT id, name FROM authors LIMIT 1');
    const categoryResult = await client.query('SELECT id, name FROM categories LIMIT 1');
    
    if (authorResult.rows.length === 0 || categoryResult.rows.length === 0) {
      console.log('❌ No authors or categories found');
      return;
    }
    
    console.log(`📋 Using author: ${authorResult.rows[0].name} (ID: ${authorResult.rows[0].id})`);
    console.log(`📋 Using category: ${categoryResult.rows[0].name} (ID: ${categoryResult.rows[0].id})`);
    
    // Test simple insertion without all the extra columns
    console.log('\n🔍 Testing simple book insertion...');
    
    try {
      const result = await client.query(`
        INSERT INTO books (
          title, author_id, category_id, price, format, language, 
          stock_quantity, low_stock_threshold, inventory_enabled, 
          cover_image_url, ebook_file_url, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, title, status
      `, [
        'Simple Test Book ' + Date.now(),
        authorResult.rows[0].id,
        categoryResult.rows[0].id,
        9.99,
        'ebook',
        'English',
        0,
        0,
        false,
        '/media_root/covers/test.jpg',
        '/media_root/ebooks/test.pdf',
        'published'
      ]);
      
      console.log('✅ Simple insertion successful:', result.rows[0]);
      
      // Clean up
      await client.query('DELETE FROM books WHERE id = $1', [result.rows[0].id]);
      console.log('✅ Test book cleaned up');
      
      console.log('\n🎉 Simple insertion works! The issue is with the complex insertion.');
      
    } catch (simpleError) {
      console.error('❌ Simple insertion failed:', simpleError.message);
      console.error('❌ Error code:', simpleError.code);
      
      // Now try with even fewer columns
      console.log('\n🔍 Testing minimal insertion...');
      
      try {
        const minimalResult = await client.query(`
          INSERT INTO books (
            title, author_id, category_id, price, status
          ) VALUES ($1, $2, $3, $4, $5)
          RETURNING id, title
        `, [
          'Minimal Test Book ' + Date.now(),
          authorResult.rows[0].id,
          categoryResult.rows[0].id,
          9.99,
          'published'
        ]);
        
        console.log('✅ Minimal insertion successful:', minimalResult.rows[0]);
        
        // Clean up
        await client.query('DELETE FROM books WHERE id = $1', [minimalResult.rows[0].id]);
        console.log('✅ Test book cleaned up');
        
        console.log('\n🎉 Minimal insertion works! The issue is with specific columns.');
        
      } catch (minimalError) {
        console.error('❌ Minimal insertion also failed:', minimalError.message);
        console.error('❌ This suggests a fundamental table structure issue.');
      }
    }
    
    client.release();
    
  } catch (dbError) {
    console.error('❌ Database connection failed:', dbError.message);
  } finally {
    await pool.end();
  }
}

simpleBookInsert().catch(console.error); 