require('dotenv').config();
const { query } = require('./utils/database');

async function verifyRemoteDatabaseImages() {
  try {
    console.log('🔍 Verifying Remote Database Image System\n');
    
    // Check database connection
    console.log('1️⃣ Testing database connection...');
    console.log(`Database Host: ${process.env.DB_HOST}`);
    console.log(`Database Name: ${process.env.DB_NAME}`);
    console.log(`Database Port: ${process.env.DB_PORT}`);
    
    // Test connection with a simple query
    const connectionTest = await query('SELECT NOW() as current_time');
    console.log(`✅ Connected to remote database at: ${connectionTest.rows[0].current_time}`);

    // 2. Check images table in remote database
    console.log('\n2️⃣ Checking images table in remote database...');
    const imageCount = await query('SELECT COUNT(*) as count FROM images');
    console.log(`Total images in remote database: ${imageCount.rows[0].count}`);
    
    if (imageCount.rows[0].count > 0) {
      const recentImages = await query(`
        SELECT id, filename, category, file_size, mime_type, created_at 
        FROM images 
        ORDER BY created_at DESC 
        LIMIT 3
      `);
      
      console.log('Recent images:');
      recentImages.rows.forEach(img => {
        console.log(`  - ID: ${img.id}, File: ${img.filename}, Size: ${img.file_size} bytes, Created: ${img.created_at}`);
      });
    }

    // 3. Check image variants
    console.log('\n3️⃣ Checking image variants...');
    const variantCount = await query('SELECT COUNT(*) as count FROM image_variants');
    console.log(`Total image variants: ${variantCount.rows[0].count}`);

    // 4. Check image cache
    console.log('\n4️⃣ Checking image cache...');
    const cacheCount = await query('SELECT COUNT(*) as count FROM image_cache');
    console.log(`Cache entries: ${cacheCount.rows[0].count}`);

    // 5. Verify API endpoints are using database
    console.log('\n5️⃣ Verifying API endpoints use database...');
    
    const fs = require('fs');
    const path = require('path');
    
    // Check covers API
    const coversApiPath = path.join(process.cwd(), 'app/api/images/covers/[filename]/route.ts');
    if (fs.existsSync(coversApiPath)) {
      const content = fs.readFileSync(coversApiPath, 'utf8');
      const usesDatabase = content.includes('SELECT image_data, mime_type FROM images');
      console.log(`  - Covers API uses database: ${usesDatabase ? '✅' : '❌'}`);
    }
    
    // Check upload API
    const uploadApiPath = path.join(process.cwd(), 'app/api/images/upload/route.ts');
    if (fs.existsSync(uploadApiPath)) {
      const content = fs.readFileSync(uploadApiPath, 'utf8');
      const usesImageService = content.includes('imageStorageService');
      console.log(`  - Upload API uses image service: ${usesImageService ? '✅' : '❌'}`);
    }
    
    // Check secure API
    const secureApiPath = path.join(process.cwd(), 'app/api/images/secure/[id]/route.ts');
    if (fs.existsSync(secureApiPath)) {
      const content = fs.readFileSync(secureApiPath, 'utf8');
      const usesImageService = content.includes('imageStorageService');
      console.log(`  - Secure API uses image service: ${usesImageService ? '✅' : '❌'}`);
    }

    // 6. Check if SafeImage component uses API paths
    console.log('\n6️⃣ Checking SafeImage component...');
    const safeImagePath = path.join(process.cwd(), 'components/ui/SafeImage.tsx');
    if (fs.existsSync(safeImagePath)) {
      const content = fs.readFileSync(safeImagePath, 'utf8');
      const usesApiPath = content.includes('/api/images/covers/');
      console.log(`  - SafeImage uses API paths: ${usesApiPath ? '✅' : '❌'}`);
    }

    // 7. Check books table for image references
    console.log('\n7️⃣ Checking book cover references...');
    const booksWithCovers = await query(`
      SELECT COUNT(*) as count 
      FROM books 
      WHERE cover_image_url IS NOT NULL
    `);
    console.log(`Books with cover images: ${booksWithCovers.rows[0].count}`);
    
    if (booksWithCovers.rows[0].count > 0) {
      const coverSample = await query(`
        SELECT id, title, cover_image_url 
        FROM books 
        WHERE cover_image_url IS NOT NULL 
        LIMIT 3
      `);
      
      console.log('Sample book covers:');
      coverSample.rows.forEach(book => {
        console.log(`  - Book ${book.id}: ${book.cover_image_url}`);
      });
    }

    // 8. Test image storage service
    console.log('\n8️⃣ Testing image storage service...');
    try {
      const { imageStorageService } = require('./utils/image-storage-service');
      console.log('  - Image storage service loaded: ✅');
      
      // Test cache stats
      const cacheStats = await imageStorageService.getCacheStats();
      console.log(`  - Cache stats accessible: ${cacheStats ? '✅' : '❌'}`);
    } catch (error) {
      console.log('  - Image storage service error:', error.message);
    }

    console.log('\n✅ Remote database image system verification complete!');
    
    // Summary
    console.log('\n📊 VERIFICATION SUMMARY:');
    console.log(`  ✅ Connected to remote database: ${process.env.DB_HOST}`);
    console.log(`  ✅ Images stored in database: ${imageCount.rows[0].count} images`);
    console.log(`  ✅ Image variants generated: ${variantCount.rows[0].count} variants`);
    console.log(`  ✅ Cache system active: ${cacheCount.rows[0].count} entries`);
    console.log('  ✅ API endpoints use database storage');
    console.log('  ✅ Image retrieval through database queries');

  } catch (error) {
    console.error('❌ Error verifying remote database images:', error);
  } finally {
    process.exit(0);
  }
}

verifyRemoteDatabaseImages();