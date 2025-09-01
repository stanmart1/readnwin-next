const fs = require('fs');
const path = require('path');

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  }
}

function copyFile(source, destination) {
  try {
    if (fs.existsSync(source)) {
      ensureDirectoryExists(path.dirname(destination));
      fs.copyFileSync(source, destination);
      console.log(`✅ Copied: ${source} -> ${destination}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error copying ${source}:`, error.message);
    return false;
  }
}

function fixMissingImages() {
  const projectRoot = process.cwd();
  
  // Define source and target directories
  const sourceDir = path.join(projectRoot, 'public', 'uploads', 'works');
  const targetDirs = [
    path.join(projectRoot, 'uploads', 'works'),
    path.join(projectRoot, 'storage', 'assets', 'uploads', 'works')
  ];
  
  console.log('🔧 Fixing missing images...');
  console.log('Source directory:', sourceDir);
  
  if (!fs.existsSync(sourceDir)) {
    console.log('❌ Source directory does not exist:', sourceDir);
    return;
  }
  
  // Get all files in source directory
  const files = fs.readdirSync(sourceDir);
  console.log(`📁 Found ${files.length} files in source directory`);
  
  // Copy files to target directories
  for (const targetDir of targetDirs) {
    console.log(`\n📂 Copying to: ${targetDir}`);
    ensureDirectoryExists(targetDir);
    
    for (const file of files) {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);
      
      if (fs.statSync(sourcePath).isFile()) {
        copyFile(sourcePath, targetPath);
      }
    }
  }
  
  // Also ensure covers directory exists and is accessible
  const coversSourceDir = path.join(projectRoot, 'public', 'uploads', 'covers');
  const coversTargetDirs = [
    path.join(projectRoot, 'uploads', 'covers'),
    path.join(projectRoot, 'storage', 'assets', 'uploads', 'covers')
  ];
  
  if (fs.existsSync(coversSourceDir)) {
    const coverFiles = fs.readdirSync(coversSourceDir);
    console.log(`\n📚 Found ${coverFiles.length} cover files`);
    
    for (const targetDir of coversTargetDirs) {
      console.log(`📂 Copying covers to: ${targetDir}`);
      ensureDirectoryExists(targetDir);
      
      for (const file of coverFiles) {
        const sourcePath = path.join(coversSourceDir, file);
        const targetPath = path.join(targetDir, file);
        
        if (fs.statSync(sourcePath).isFile()) {
          copyFile(sourcePath, targetPath);
        }
      }
    }
  }
  
  console.log('\n🎉 Image fixing completed!');
}

// Run if called directly
if (require.main === module) {
  fixMissingImages();
}

module.exports = { fixMissingImages };