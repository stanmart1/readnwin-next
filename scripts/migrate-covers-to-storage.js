#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Paths
const sourceDir = path.join(process.cwd(), 'public/uploads/covers');
const targetDir = '/app/storage/uploads/covers';

async function migrateCoverImages() {
  console.log('🔄 Starting cover image migration...');
  
  // Check if we're in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('ℹ️ Not in production, skipping migration');
    return;
  }
  
  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`📁 Created target directory: ${targetDir}`);
  }
  
  // Check if source directory exists
  if (!fs.existsSync(sourceDir)) {
    console.log(`⚠️ Source directory not found: ${sourceDir}`);
    return;
  }
  
  // Get all files from source directory
  const files = fs.readdirSync(sourceDir);
  console.log(`📋 Found ${files.length} files to migrate`);
  
  let migratedCount = 0;
  let skippedCount = 0;
  
  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    
    // Skip if target already exists
    if (fs.existsSync(targetPath)) {
      console.log(`⏭️ Skipping ${file} (already exists)`);
      skippedCount++;
      continue;
    }
    
    try {
      // Copy file
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Migrated: ${file}`);
      migratedCount++;
    } catch (error) {
      console.error(`❌ Failed to migrate ${file}:`, error.message);
    }
  }
  
  console.log(`🎉 Migration complete! Migrated: ${migratedCount}, Skipped: ${skippedCount}`);
}

// Run migration
migrateCoverImages().catch(console.error);