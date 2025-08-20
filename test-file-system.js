#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function testFileSystem() {
  console.log('🔍 Testing file system for book covers...\n');
  
  // 1. Check upload directories
  console.log('1. Checking upload directory structure...');
  const uploadDirs = [
    { path: path.join(process.cwd(), 'public', 'uploads'), name: 'public/uploads' },
    { path: path.join(process.cwd(), 'public', 'uploads', 'covers'), name: 'public/uploads/covers' },
    { path: path.join(process.cwd(), 'uploads'), name: 'uploads' },
    { path: path.join(process.cwd(), 'uploads', 'covers'), name: 'uploads/covers' },
    { path: path.join(process.cwd(), 'storage', 'covers'), name: 'storage/covers' }
  ];
  
  uploadDirs.forEach(dir => {
    if (fs.existsSync(dir.path)) {
      const files = fs.readdirSync(dir.path);
      console.log(`✅ ${dir.name} exists (${files.length} files)`);
      if (files.length > 0) {
        console.log(`   Files: ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}`);
      }
    } else {
      console.log(`❌ ${dir.name} does not exist`);
      // Try to create it
      try {
        fs.mkdirSync(dir.path, { recursive: true });
        console.log(`✅ Created ${dir.name}`);
      } catch (error) {
        console.log(`❌ Failed to create ${dir.name}: ${error.message}`);
      }
    }
  });
  console.log('');
  
  // 2. Check for placeholder image
  console.log('2. Checking placeholder image...');
  const placeholderPath = path.join(process.cwd(), 'public', 'placeholder-book.jpg');
  if (fs.existsSync(placeholderPath)) {
    const stats = fs.statSync(placeholderPath);
    console.log(`✅ Placeholder image exists (${Math.round(stats.size / 1024)}KB)`);
  } else {
    console.log('❌ Placeholder image missing - creating one...');
    // Create a simple placeholder
    const placeholderContent = `<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="400" fill="#f3f4f6"/>
  <text x="150" y="200" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">Book Cover</text>
</svg>`;
    try {
      fs.writeFileSync(placeholderPath.replace('.jpg', '.svg'), placeholderContent);
      console.log('✅ Created placeholder SVG');
    } catch (error) {
      console.log(`❌ Failed to create placeholder: ${error.message}`);
    }
  }
  console.log('');
  
  // 3. Test creating a sample cover image
  console.log('3. Testing cover image creation...');
  const testCoverPath = path.join(process.cwd(), 'public', 'uploads', 'covers', 'test-cover.jpg');
  const testCoverDir = path.dirname(testCoverPath);
  
  if (!fs.existsSync(testCoverDir)) {
    fs.mkdirSync(testCoverDir, { recursive: true });
    console.log(`✅ Created covers directory: ${testCoverDir}`);
  }
  
  // Create a simple test image (SVG)
  const testImageContent = `<svg width="200" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="300" fill="#3b82f6"/>
  <text x="100" y="150" text-anchor="middle" font-family="Arial" font-size="14" fill="white">Test Cover</text>
</svg>`;
  
  try {
    fs.writeFileSync(testCoverPath.replace('.jpg', '.svg'), testImageContent);
    console.log(`✅ Created test cover: ${testCoverPath.replace('.jpg', '.svg')}`);
  } catch (error) {
    console.log(`❌ Failed to create test cover: ${error.message}`);
  }
  console.log('');
  
  // 4. Check Next.js configuration
  console.log('4. Checking Next.js configuration...');
  try {
    const nextConfig = require('./next.config.js');
    if (nextConfig.async && typeof nextConfig.async.rewrites === 'function') {
      console.log('✅ Next.js rewrites function found');
    } else {
      console.log('⚠️  Next.js rewrites may not be configured properly');
    }
    
    if (nextConfig.images && nextConfig.images.remotePatterns) {
      console.log(`✅ Image optimization configured with ${nextConfig.images.remotePatterns.length} patterns`);
    } else {
      console.log('⚠️  Image optimization may not be configured');
    }
  } catch (error) {
    console.log(`❌ Error reading Next.js config: ${error.message}`);
  }
  console.log('');
  
  console.log('🎉 File system test completed!');
  console.log('\n📋 Summary:');
  console.log('- Ensure upload directories exist');
  console.log('- Verify placeholder image is available');
  console.log('- Check Next.js rewrites for /uploads/* paths');
  console.log('- Test actual file upload through the admin interface');
}

testFileSystem();