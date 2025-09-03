#!/usr/bin/env node

/**
 * Script to fix image path issues between development and production environments
 * This script will:
 * 1. Analyze current image storage locations
 * 2. Migrate images to standardized locations
 * 3. Update database paths to use consistent format
 * 4. Create symlinks/copies for backward compatibility
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

async function fixImagePaths() {
  console.log('🔧 Starting image path fix for cross-environment compatibility...\n');

  try {
    // Step 1: Analyze current situation
    await analyzeCurrentImageStorage();
    
    // Step 2: Create standardized directory structure
    await createStandardizedDirectories();
    
    // Step 3: Migrate existing images
    await migrateExistingImages();
    
    // Step 4: Update database paths
    await updateDatabasePaths();
    
    // Step 5: Create compatibility symlinks
    await createCompatibilityLinks();
    
    console.log('✅ Image path fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during image path fix:', error);
  } finally {
    await pool.end();
  }
}

async function analyzeCurrentImageStorage() {
  console.log('📊 Analyzing current image storage...');
  
  // Check what directories exist
  const possibleDirs = [
    'public/uploads/covers',
    'uploads/covers', 
    'storage/covers',
    'storage/uploads/covers',
    '/app/storage/covers',
    '/app/storage/uploads/covers'
  ];
  
  const existingDirs = [];
  const imageCount = {};
  
  for (const dir of possibleDirs) {
    if (fs.existsSync(dir)) {
      existingDirs.push(dir);
      try {
        const files = fs.readdirSync(dir).filter(f => 
          f.match(/\.(jpg|jpeg|png|webp|gif)$/i)
        );
        imageCount[dir] = files.length;
        console.log(`  📁 ${dir}: ${files.length} images`);
      } catch (error) {
        console.log(`  📁 ${dir}: Error reading directory`);
      }
    }
  }
  
  // Check database for image paths
  try {
    const result = await pool.query(`
      SELECT 
        cover_image_url,
        cover_image_path,
        COUNT(*) as count
      FROM books 
      WHERE cover_image_url IS NOT NULL OR cover_image_path IS NOT NULL
      GROUP BY cover_image_url, cover_image_path
      ORDER BY count DESC
      LIMIT 10
    `);
    
    console.log('\\n📋 Database image path patterns:');
    result.rows.forEach(row => {
      const path = row.cover_image_url || row.cover_image_path;
      console.log(`  🔗 ${path}: ${row.count} books`);
    });
  } catch (error) {
    console.log('⚠️ Could not analyze database paths:', error.message);
  }
  
  console.log('');
}

async function createStandardizedDirectories() {
  console.log('📁 Creating standardized directory structure...');
  
  const requiredDirs = [
    'storage/covers',
    'storage/covers/original',
    'storage/covers/thumbnails',
    'storage/uploads/covers',
    'public/uploads/covers'
  ];
  
  // In production, also create /app/storage structure
  if (process.env.NODE_ENV === 'production') {
    requiredDirs.push(
      '/app/storage/covers',
      '/app/storage/covers/original', 
      '/app/storage/covers/thumbnails',
      '/app/storage/uploads/covers'
    );
  }
  
  for (const dir of requiredDirs) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`  ✅ Created: ${dir}`);
      } else {
        console.log(`  ✅ Exists: ${dir}`);
      }
    } catch (error) {
      console.log(`  ❌ Failed to create ${dir}:`, error.message);
    }
  }
  
  console.log('');
}

async function migrateExistingImages() {
  console.log('🚚 Migrating existing images to standardized locations...');
  
  const sourceDirs = [
    'public/uploads/covers',
    'uploads/covers'
  ];
  
  const targetDir = process.env.NODE_ENV === 'production' 
    ? '/app/storage/covers'
    : 'storage/covers';
  
  let migratedCount = 0;
  let skippedCount = 0;
  
  for (const sourceDir of sourceDirs) {
    if (!fs.existsSync(sourceDir)) continue;
    
    console.log(`  📂 Processing ${sourceDir}...`);
    
    try {
      const files = fs.readdirSync(sourceDir).filter(f => 
        f.match(/\.(jpg|jpeg|png|webp|gif)$/i)
      );
      
      for (const file of files) {
        const sourcePath = path.join(sourceDir, file);
        const targetPath = path.join(targetDir, file);
        
        // Skip if target already exists
        if (fs.existsSync(targetPath)) {
          skippedCount++;
          continue;
        }
        
        try {
          // Copy file to new location
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`    ✅ Migrated: ${file}`);
          migratedCount++;
        } catch (error) {
          console.log(`    ❌ Failed to migrate ${file}:`, error.message);
        }
      }
    } catch (error) {
      console.log(`  ❌ Error processing ${sourceDir}:`, error.message);
    }
  }
  
  console.log(`  📊 Migration summary: ${migratedCount} migrated, ${skippedCount} skipped\\n`);
}

async function updateDatabasePaths() {
  console.log('🗄️ Updating database paths to standardized format...');
  
  try {
    // Get all books with cover images
    const result = await pool.query(`
      SELECT id, title, cover_image_url, cover_image_path
      FROM books 
      WHERE cover_image_url IS NOT NULL OR cover_image_path IS NOT NULL
    `);
    
    console.log(`  📋 Found ${result.rows.length} books with cover images`);
    
    let updatedCount = 0;
    
    for (const book of result.rows) {
      const currentPath = book.cover_image_url || book.cover_image_path;
      
      // Extract filename from current path
      const filename = extractFilename(currentPath);
      
      // Generate standardized path
      const standardizedPath = `/storage/covers/${filename}`;
      
      // Only update if path is different
      if (currentPath !== standardizedPath) {
        try {
          await pool.query(`
            UPDATE books 
            SET cover_image_url = $1, cover_image_path = $1
            WHERE id = $2
          `, [standardizedPath, book.id]);
          
          console.log(`    ✅ Updated book ${book.id}: ${currentPath} -> ${standardizedPath}`);
          updatedCount++;
        } catch (error) {
          console.log(`    ❌ Failed to update book ${book.id}:`, error.message);
        }
      }
    }
    
    console.log(`  📊 Updated ${updatedCount} book records\\n`);
    
  } catch (error) {
    console.log(`  ❌ Database update failed:`, error.message);
  }
}

async function createCompatibilityLinks() {
  console.log('🔗 Creating compatibility symlinks...');
  
  const targetDir = process.env.NODE_ENV === 'production' 
    ? '/app/storage/covers'
    : 'storage/covers';
  
  // Create symlinks for backward compatibility
  const compatibilityLinks = [
    {
      source: targetDir,
      target: 'public/uploads/covers-link'
    }
  ];
  
  for (const link of compatibilityLinks) {
    try {
      // Remove existing link if it exists
      if (fs.existsSync(link.target)) {
        fs.unlinkSync(link.target);
      }
      
      // Create symlink (if supported)
      try {
        fs.symlinkSync(path.resolve(link.source), link.target, 'dir');
        console.log(`  ✅ Created symlink: ${link.target} -> ${link.source}`);
      } catch (symlinkError) {
        console.log(`  ⚠️ Symlink not supported, skipping: ${link.target}`);
      }
    } catch (error) {
      console.log(`  ❌ Failed to create symlink ${link.target}:`, error.message);
    }
  }
  
  console.log('');
}

function extractFilename(filePath) {
  if (!filePath) return '';
  
  // Remove query parameters
  const cleanPath = filePath.split('?')[0];
  
  // Get the last part of the path
  const parts = cleanPath.split('/');
  return parts[parts.length - 1];
}

// Run the fix
if (require.main === module) {
  fixImagePaths();
}

module.exports = { fixImagePaths };