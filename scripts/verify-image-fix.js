#!/usr/bin/env node

/**
 * Verification script to test image accessibility across environments
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function verifyImageFix() {
  console.log('🔍 Verifying image fix across environments...\n');

  try {
    // Test 1: Check directory structure
    await testDirectoryStructure();
    
    // Test 2: Check database paths
    await testDatabasePaths();
    
    // Test 3: Test image accessibility
    await testImageAccessibility();
    
    // Test 4: Test API endpoints
    await testApiEndpoints();
    
    console.log('✅ Image fix verification completed!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await pool.end();
  }
}

async function testDirectoryStructure() {
  console.log('📁 Testing directory structure...');
  
  const requiredDirs = [
    'storage/covers',
    'storage/covers/original',
    'public/uploads/covers'
  ];
  
  // Add production paths if in production
  if (process.env.NODE_ENV === 'production') {
    requiredDirs.push(
      '/app/storage/covers',
      '/app/storage/covers/original'
    );
  }
  
  let allExist = true;
  
  for (const dir of requiredDirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => 
        f.match(/\.(jpg|jpeg|png|webp|gif)$/i)
      );
      console.log(`  ✅ ${dir}: ${files.length} images`);
    } else {
      console.log(`  ❌ ${dir}: Missing`);
      allExist = false;
    }
  }
  
  if (allExist) {
    console.log('  🎉 All required directories exist');
  } else {
    console.log('  ⚠️ Some directories are missing');
  }
  
  console.log('');
}

async function testDatabasePaths() {
  console.log('🗄️ Testing database paths...');
  
  try {
    const result = await pool.query(`
      SELECT 
        id,
        title,
        cover_image_url,
        cover_image_path
      FROM books 
      WHERE cover_image_url IS NOT NULL OR cover_image_path IS NOT NULL
      LIMIT 5
    `);
    
    console.log(`  📋 Found ${result.rows.length} books with cover images`);
    
    let standardizedCount = 0;
    let needsUpdateCount = 0;
    
    for (const book of result.rows) {
      const coverPath = book.cover_image_url || book.cover_image_path;
      
      if (coverPath.startsWith('/storage/covers/') || coverPath.startsWith('/api/images/covers/')) {
        standardizedCount++;
        console.log(`  ✅ Book ${book.id}: ${coverPath} (standardized)`);
      } else {
        needsUpdateCount++;
        console.log(`  ⚠️ Book ${book.id}: ${coverPath} (needs update)`);
      }
    }
    
    console.log(`  📊 Standardized: ${standardizedCount}, Needs update: ${needsUpdateCount}`);
    
  } catch (error) {
    console.log(`  ❌ Database test failed:`, error.message);
  }
  
  console.log('');
}

async function testImageAccessibility() {
  console.log('🖼️ Testing image accessibility...');
  
  try {
    const result = await pool.query(`
      SELECT 
        id,
        title,
        cover_image_url,
        cover_image_path
      FROM books 
      WHERE cover_image_url IS NOT NULL OR cover_image_path IS NOT NULL
      LIMIT 3
    `);
    
    for (const book of result.rows) {
      const coverPath = book.cover_image_url || book.cover_image_path;
      const filename = extractFilename(coverPath);
      
      console.log(`  📖 Testing book ${book.id}: ${book.title}`);
      console.log(`    Database path: ${coverPath}`);
      
      // Test different possible locations
      const possiblePaths = [
        `storage/covers/${filename}`,
        `public/uploads/covers/${filename}`,
        `uploads/covers/${filename}`
      ];
      
      if (process.env.NODE_ENV === 'production') {
        possiblePaths.push(`/app/storage/covers/${filename}`);
      }
      
      let found = false;
      for (const testPath of possiblePaths) {
        if (fs.existsSync(testPath)) {
          console.log(`    ✅ Found at: ${testPath}`);
          found = true;
          break;
        }
      }
      
      if (!found) {
        console.log(`    ❌ Image not found in any location`);
        console.log(`    Searched: ${possiblePaths.join(', ')}`);
      }
    }
    
  } catch (error) {
    console.log(`  ❌ Image accessibility test failed:`, error.message);
  }
  
  console.log('');
}

async function testApiEndpoints() {
  console.log('🌐 Testing API endpoints...');
  
  // Test if we can import the path resolver
  try {
    const ImagePathResolver = require('../utils/image-path-resolver.ts');
    console.log('  ✅ ImagePathResolver module loads correctly');
    
    // Test path resolution
    const testPaths = [
      '/uploads/covers/test.jpg',
      'storage/covers/test.jpg',
      'test.jpg'
    ];
    
    for (const testPath of testPaths) {
      const resolved = ImagePathResolver.default.resolveCoverImageUrl(testPath);
      console.log(`    ${testPath} -> ${resolved}`);
    }
    
  } catch (error) {
    console.log(`  ❌ ImagePathResolver test failed:`, error.message);
  }
  
  console.log('');
}

function extractFilename(filePath) {
  if (!filePath) return '';
  const cleanPath = filePath.split('?')[0];
  const parts = cleanPath.split('/');
  return parts[parts.length - 1];
}

// Run verification
if (require.main === module) {
  verifyImageFix();
}

module.exports = { verifyImageFix };