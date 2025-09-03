require('dotenv').config();
const { query } = require('./utils/database');

async function verifyAndUpdateImageAPIs() {
  try {
    console.log('🔍 Verifying Image System Integration\n');

    // 1. Check if all required tables exist
    console.log('1️⃣ Checking database tables...');
    const tables = ['images', 'image_variants', 'image_cache', 'cache_statistics'];
    
    for (const table of tables) {
      const result = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `, [table]);
      
      const exists = result.rows[0].exists;
      console.log(`  - ${table}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
      
      if (!exists) {
        console.log(`    Creating ${table} table...`);
        await createMissingTable(table);
      }
    }

    // 2. Check API endpoints
    console.log('\n2️⃣ Checking API endpoints...');
    const apiEndpoints = [
      '/api/images/covers/[filename]/route.ts',
      '/api/images/upload/route.ts',
      '/api/images/secure/[id]/route.ts'
    ];

    for (const endpoint of apiEndpoints) {
      const fs = require('fs');
      const path = require('path');
      const fullPath = path.join(process.cwd(), 'app', endpoint);
      const exists = fs.existsSync(fullPath);
      console.log(`  - ${endpoint}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
    }

    // 3. Check image storage service
    console.log('\n3️⃣ Checking image storage service...');
    const serviceExists = require('fs').existsSync('./utils/image-storage-service.ts');
    console.log(`  - image-storage-service.ts: ${serviceExists ? '✅ EXISTS' : '❌ MISSING'}`);

    // 4. Check books using old file system vs new database system
    console.log('\n4️⃣ Analyzing book cover storage...');
    
    const oldSystemBooks = await query(`
      SELECT COUNT(*) as count 
      FROM books 
      WHERE cover_image_url LIKE '/uploads/covers/%'
    `);
    
    const newSystemBooks = await query(`
      SELECT COUNT(*) as count 
      FROM books b
      JOIN images i ON b.cover_image_url LIKE '%' || i.filename || '%'
      WHERE i.category = 'cover'
    `);
    
    const nullCoverBooks = await query(`
      SELECT COUNT(*) as count 
      FROM books 
      WHERE cover_image_url IS NULL
    `);

    console.log(`  - Books using old file system: ${oldSystemBooks.rows[0].count}`);
    console.log(`  - Books using new database system: ${newSystemBooks.rows[0].count}`);
    console.log(`  - Books with no cover: ${nullCoverBooks.rows[0].count}`);

    // 5. Check for missing images referenced by books
    console.log('\n5️⃣ Checking for missing image references...');
    const missingImages = await query(`
      SELECT b.id, b.title, b.cover_image_url
      FROM books b
      LEFT JOIN images i ON b.cover_image_url LIKE '%' || i.filename || '%'
      WHERE b.cover_image_url IS NOT NULL 
      AND b.cover_image_url NOT LIKE '/api/images/%'
      AND i.id IS NULL
      LIMIT 5
    `);

    if (missingImages.rows.length > 0) {
      console.log('  ❌ Found books with missing image references:');
      missingImages.rows.forEach(book => {
        console.log(`    - Book ${book.id}: ${book.title} -> ${book.cover_image_url}`);
      });
    } else {
      console.log('  ✅ No missing image references found');
    }

    // 6. Check cache statistics
    console.log('\n6️⃣ Checking cache system...');
    try {
      const cacheStats = await query('SELECT * FROM cache_statistics LIMIT 1');
      if (cacheStats.rows.length > 0) {
        const stats = cacheStats.rows[0];
        console.log(`  - Cache hits: ${stats.cache_hits}`);
        console.log(`  - Cache misses: ${stats.cache_misses}`);
        console.log(`  - Hit rate: ${stats.cache_hits + stats.cache_misses > 0 ? 
          Math.round((stats.cache_hits / (stats.cache_hits + stats.cache_misses)) * 100) : 0}%`);
      } else {
        console.log('  - Initializing cache statistics...');
        await query(`
          INSERT INTO cache_statistics (cache_hits, cache_misses, total_requests, cache_size_bytes)
          VALUES (0, 0, 0, 0)
        `);
      }
    } catch (error) {
      console.log('  ❌ Cache statistics table needs setup');
    }

    console.log('\n✅ Image system verification complete!');
    console.log('\n📋 RECOMMENDATIONS:');
    
    if (oldSystemBooks.rows[0].count > 0) {
      console.log('  - Migrate books from old file system to new database system');
      console.log('  - Update book creation API to use imageStorageService');
    }
    
    if (missingImages.rows.length > 0) {
      console.log('  - Clean up missing image references in books table');
    }
    
    console.log('  - Ensure all upload forms use /api/images/upload endpoint');
    console.log('  - Update image display components to use /api/images/covers/ URLs');

  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    process.exit(0);
  }
}

async function createMissingTable(tableName) {
  const tableDefinitions = {
    'image_variants': `
      CREATE TABLE image_variants (
        id SERIAL PRIMARY KEY,
        image_id INTEGER REFERENCES images(id) ON DELETE CASCADE,
        variant_type VARCHAR(50) NOT NULL,
        width INTEGER,
        height INTEGER,
        file_size INTEGER NOT NULL,
        image_data BYTEA NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,
    'image_cache': `
      CREATE TABLE image_cache (
        id SERIAL PRIMARY KEY,
        cache_key VARCHAR(255) UNIQUE NOT NULL,
        cached_data BYTEA NOT NULL,
        content_type VARCHAR(100) NOT NULL,
        cache_size INTEGER NOT NULL,
        access_count INTEGER DEFAULT 0,
        expires_at TIMESTAMP,
        last_accessed TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `,
    'cache_statistics': `
      CREATE TABLE cache_statistics (
        id SERIAL PRIMARY KEY,
        cache_hits BIGINT DEFAULT 0,
        cache_misses BIGINT DEFAULT 0,
        total_requests BIGINT DEFAULT 0,
        cache_size_bytes BIGINT DEFAULT 0,
        last_cleared TIMESTAMP,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `
  };

  if (tableDefinitions[tableName]) {
    await query(tableDefinitions[tableName]);
    console.log(`    ✅ Created ${tableName} table`);
  }
}

verifyAndUpdateImageAPIs();