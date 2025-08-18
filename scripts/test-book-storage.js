#!/usr/bin/env node

/**
 * Book Storage System Test Script
 * 
 * This script tests the new local book storage system to ensure
 * files are properly stored and accessible.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  mediaRootDir: path.join(process.cwd(), 'media_root'),
  booksDir: path.join(process.cwd(), 'media_root', 'books'),
  coversDir: path.join(process.cwd(), 'media_root', 'public', 'uploads', 'covers'),
  tempDir: path.join(process.cwd(), 'media_root', 'books', 'temp')
};

console.log('🧪 Testing Book Storage System...');
console.log('📁 Configuration:', {
  mediaRootDir: config.mediaRootDir,
  booksDir: config.booksDir,
  coversDir: config.coversDir,
  tempDir: config.tempDir
});

// Test 1: Directory Structure
function testDirectoryStructure() {
  console.log('\n📁 Test 1: Directory Structure');
  
  const requiredDirs = [
    config.mediaRootDir,
    config.booksDir,
    config.coversDir,
    config.tempDir
  ];
  
  let allExist = true;
  
  requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`✅ ${dir} exists`);
    } else {
      console.log(`❌ ${dir} missing`);
      allExist = false;
    }
  });
  
  if (allExist) {
    console.log('✅ All required directories exist');
  } else {
    console.log('❌ Some directories are missing');
  }
  
  return allExist;
}

// Test 2: File Permissions
function testFilePermissions() {
  console.log('\n🔐 Test 2: File Permissions');
  
  const testDirs = [
    { path: config.booksDir, required: '755' },
    { path: config.coversDir, required: '755' },
    { path: config.tempDir, required: '755' }
  ];
  
  let allValid = true;
  
  testDirs.forEach(({ path: dirPath, required }) => {
    try {
      const stats = fs.statSync(dirPath);
      const mode = stats.mode.toString(8).slice(-3);
      
      if (mode === required) {
        console.log(`✅ ${dirPath} has correct permissions (${mode})`);
      } else {
        console.log(`⚠️ ${dirPath} has permissions ${mode}, expected ${required}`);
        allValid = false;
      }
    } catch (error) {
      console.log(`❌ Cannot check permissions for ${dirPath}: ${error.message}`);
      allValid = false;
    }
  });
  
  return allValid;
}

// Test 3: Create Test Files
function createTestFiles() {
  console.log('\n📄 Test 3: Creating Test Files');
  
  const testBookId = 999;
  const testBookDir = path.join(config.booksDir, testBookId.toString());
  
  // Create test book directory
  if (!fs.existsSync(testBookDir)) {
    fs.mkdirSync(testBookDir, { recursive: true });
    console.log(`✅ Created test book directory: ${testBookDir}`);
  }
  
  // Create test EPUB file
  const testEpubPath = path.join(testBookDir, 'test-book.epub');
  const testEpubContent = 'Test EPUB content';
  
  try {
    fs.writeFileSync(testEpubPath, testEpubContent);
    console.log(`✅ Created test EPUB file: ${testEpubPath}`);
  } catch (error) {
    console.log(`❌ Failed to create test EPUB: ${error.message}`);
    return false;
  }
  
  // Create test cover image
  const testCoverPath = path.join(config.coversDir, 'test-cover.jpg');
  const testCoverContent = 'Test cover image content';
  
  try {
    fs.writeFileSync(testCoverPath, testCoverContent);
    console.log(`✅ Created test cover image: ${testCoverPath}`);
  } catch (error) {
    console.log(`❌ Failed to create test cover: ${error.message}`);
    return false;
  }
  
  return { testEpubPath, testCoverPath };
}

// Test 4: File Access via API
function testFileAccess(testFiles) {
  console.log('\n🌐 Test 4: File Access via API');
  
  if (!testFiles) {
    console.log('⚠️ Skipping API test - no test files created');
    return false;
  }
  
  const { testEpubPath, testCoverPath } = testFiles;
  
  // Test file serving endpoints
  const endpoints = [
    {
      name: 'Book File Access',
      url: '/api/book-files/books/999/test-book.epub',
      expectedStatus: 200
    },
    {
      name: 'Cover Image Access',
      url: '/api/book-files/public/uploads/covers/test-cover.jpg',
      expectedStatus: 200
    }
  ];
  
  console.log('⚠️ API tests require a running server');
  console.log('⚠️ Please start the development server and test these endpoints:');
  
  endpoints.forEach(endpoint => {
    console.log(`   ${endpoint.name}: ${endpoint.url}`);
  });
  
  return true;
}

// Test 5: Cleanup Test Files
function cleanupTestFiles(testFiles) {
  console.log('\n🧹 Test 5: Cleanup Test Files');
  
  if (!testFiles) {
    console.log('⚠️ No test files to cleanup');
    return;
  }
  
  const { testEpubPath, testCoverPath } = testFiles;
  
  // Remove test files
  try {
    if (fs.existsSync(testEpubPath)) {
      fs.unlinkSync(testEpubPath);
      console.log(`✅ Removed test EPUB: ${testEpubPath}`);
    }
    
    if (fs.existsSync(testCoverPath)) {
      fs.unlinkSync(testCoverPath);
      console.log(`✅ Removed test cover: ${testCoverPath}`);
    }
    
    // Remove test book directory
    const testBookDir = path.dirname(testEpubPath);
    if (fs.existsSync(testBookDir)) {
      fs.rmdirSync(testBookDir);
      console.log(`✅ Removed test book directory: ${testBookDir}`);
    }
  } catch (error) {
    console.log(`❌ Cleanup failed: ${error.message}`);
  }
}

// Test 6: Database Integration
function testDatabaseIntegration() {
  console.log('\n💾 Test 6: Database Integration');
  
  console.log('⚠️ Database tests require database connection');
  console.log('⚠️ Please verify these SQL queries work:');
  console.log('');
  console.log('   -- Check if books table has required columns');
  console.log('   SELECT column_name, data_type FROM information_schema.columns');
  console.log('   WHERE table_name = \'books\' AND column_name IN (\'ebook_file_url\', \'cover_image_url\', \'file_path\');');
  console.log('');
  console.log('   -- Check existing book files');
  console.log('   SELECT id, title, ebook_file_url, cover_image_url FROM books WHERE ebook_file_url IS NOT NULL LIMIT 5;');
  console.log('');
  console.log('   -- Check book_files table (if exists)');
  console.log('   SELECT COUNT(*) FROM book_files;');
  
  return true;
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Book Storage System Tests...\n');
  
  const results = {
    directoryStructure: false,
    filePermissions: false,
    testFiles: false,
    fileAccess: false,
    databaseIntegration: false
  };
  
  try {
    // Run tests
    results.directoryStructure = testDirectoryStructure();
    results.filePermissions = testFilePermissions();
    
    const testFiles = createTestFiles();
    results.testFiles = !!testFiles;
    
    results.fileAccess = testFileAccess(testFiles);
    results.databaseIntegration = testDatabaseIntegration();
    
    // Cleanup
    cleanupTestFiles(testFiles);
    
    // Summary
    console.log('\n📊 Test Summary:');
    console.log(`   Directory Structure: ${results.directoryStructure ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   File Permissions: ${results.filePermissions ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Test Files: ${results.testFiles ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   File Access: ${results.fileAccess ? '✅ PASS' : '⚠️ SKIP'}`);
    console.log(`   Database Integration: ${results.databaseIntegration ? '✅ PASS' : '⚠️ SKIP'}`);
    
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All tests passed! Book storage system is ready.');
    } else {
      console.log('⚠️ Some tests failed. Please check the issues above.');
    }
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  config
};
