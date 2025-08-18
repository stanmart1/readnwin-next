const fs = require('fs');
const path = require('path');

function ensureUploadDirectories() {
  console.log('📁 Ensuring All Upload Directories Exist');
  console.log('=' .repeat(60));
  
  const baseUploadDir = path.join(process.cwd(), 'public', 'uploads');
  const directories = [
    'covers',
    'ebooks', 
    'payment-proofs',
    'blog'
  ];
  
  console.log(`📂 Base upload directory: ${baseUploadDir}`);
  
  // Ensure base upload directory exists
  if (!fs.existsSync(baseUploadDir)) {
    console.log(`📁 Creating base upload directory: ${baseUploadDir}`);
    fs.mkdirSync(baseUploadDir, { recursive: true });
  }
  
  // Create each subdirectory
  directories.forEach(dir => {
    const fullPath = path.join(baseUploadDir, dir);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`📁 Creating directory: ${fullPath}`);
      fs.mkdirSync(fullPath, { recursive: true });
    } else {
      console.log(`✅ Directory exists: ${fullPath}`);
    }
    
    // Set proper permissions
    try {
      fs.chmodSync(fullPath, 0o755);
      console.log(`🔐 Set permissions (755) for: ${fullPath}`);
    } catch (error) {
      console.log(`⚠️  Could not set permissions for: ${fullPath} - ${error.message}`);
    }
  });
  
  // Verify all directories exist and are writable
  console.log('\n🔍 Verifying Directory Access:');
  console.log('-'.repeat(40));
  
  directories.forEach(dir => {
    const fullPath = path.join(baseUploadDir, dir);
    
    try {
      // Test write access by creating a temporary file
      const testFile = path.join(fullPath, '.test-write-access');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      console.log(`✅ ${dir}/ - Directory is writable`);
    } catch (error) {
      console.log(`❌ ${dir}/ - Directory is NOT writable: ${error.message}`);
    }
  });
  
  // List all upload directories
  console.log('\n📋 Current Upload Directory Structure:');
  console.log('-'.repeat(40));
  
  try {
    const items = fs.readdirSync(baseUploadDir);
    items.forEach(item => {
      const itemPath = path.join(baseUploadDir, item);
      const stats = fs.statSync(itemPath);
      const permissions = (stats.mode & parseInt('777', 8)).toString(8);
      console.log(`  📁 ${item}/ - ${stats.isDirectory() ? 'Directory' : 'File'} (${permissions})`);
    });
  } catch (error) {
    console.log(`❌ Error reading upload directory: ${error.message}`);
  }
  
  console.log('\n📝 Upload Directory Summary:');
  console.log('-'.repeat(40));
  console.log('✅ covers/ - Book cover images');
  console.log('✅ ebooks/ - Ebook files (PDF, EPUB, MOBI)');
  console.log('✅ payment-proofs/ - Bank transfer proof images');
  console.log('✅ blog/ - Blog post images');
  
  console.log('\n🔧 Directory Creation Complete!');
  console.log('All upload directories are now ready for file uploads.');
}

ensureUploadDirectories(); 