require('dotenv').config();
const { query } = require('./utils/database');

async function verifyImageSystem() {
  try {
    console.log('🔍 Verifying Image Upload/Retrieval System\n');

    // 1. Check images table structure
    console.log('1️⃣ Checking images table structure...');
    const tableStructure = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'images' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Images table columns:');
    tableStructure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // 2. Check total images in database
    const imageCount = await query('SELECT COUNT(*) as count FROM images');
    console.log(`\n📊 Total images in database: ${imageCount.rows[0].count}`);

    // 3. Check recent images
    const recentImages = await query(`
      SELECT id, filename, category, file_size, mime_type, is_active, created_at 
      FROM images 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('\n📸 Recent images:');
    recentImages.rows.forEach(img => {
      console.log(`  - ID: ${img.id}, File: ${img.filename}, Category: ${img.category}, Size: ${img.file_size}, Active: ${img.is_active}`);
    });

    // 4. Check books with cover images
    const booksWithCovers = await query(`
      SELECT COUNT(*) as count 
      FROM books 
      WHERE cover_image_url IS NOT NULL
    `);
    console.log(`\n📚 Books with cover images: ${booksWithCovers.rows[0].count}`);

    // 5. Check for orphaned book references
    const orphanedReferences = await query(`
      SELECT b.id, b.title, b.cover_image_url
      FROM books b
      LEFT JOIN images i ON b.cover_image_url LIKE '%' || i.filename || '%'
      WHERE b.cover_image_url IS NOT NULL 
      AND i.id IS NULL
      LIMIT 10
    `);
    
    console.log(`\n🔗 Orphaned book cover references: ${orphanedReferences.rows.length}`);
    if (orphanedReferences.rows.length > 0) {
      orphanedReferences.rows.forEach(book => {
        console.log(`  - Book ID: ${book.id}, Title: ${book.title}, URL: ${book.cover_image_url}`);
      });
    }

    // 6. Check image categories
    const categories = await query(`
      SELECT category, COUNT(*) as count 
      FROM images 
      GROUP BY category 
      ORDER BY count DESC
    `);
    
    console.log('\n📂 Image categories:');
    categories.rows.forEach(cat => {
      console.log(`  - ${cat.category}: ${cat.count} images`);
    });

    console.log('\n✅ Image system verification complete!');

  } catch (error) {
    console.error('❌ Error verifying image system:', error);
  } finally {
    process.exit(0);
  }
}

verifyImageSystem();