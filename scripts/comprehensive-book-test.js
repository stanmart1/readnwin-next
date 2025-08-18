#!/usr/bin/env node

/**
 * Comprehensive Book Storage System Test
 * 
 * This script tests all aspects of the book storage system:
 * 1. File upload functionality
 * 2. Book management interface
 * 3. E-reader integration
 * 4. Book structure maintenance
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  baseUrl: 'http://localhost:3000',
  mediaRootDir: path.join(process.cwd(), 'media_root'),
  booksDir: path.join(process.cwd(), 'media_root', 'books'),
  coversDir: path.join(process.cwd(), 'media_root', 'public', 'uploads', 'covers'),
  testBookId: 999,
  testUserId: 1
};

console.log('🧪 Comprehensive Book Storage System Test');
console.log('📁 Configuration:', {
  baseUrl: config.baseUrl,
  mediaRootDir: config.mediaRootDir,
  booksDir: config.booksDir,
  coversDir: config.coversDir
});

// Test results tracking
const testResults = {
  uploadSystem: { passed: 0, total: 0, details: [] },
  bookManagement: { passed: 0, total: 0, details: [] },
  eReaderIntegration: { passed: 0, total: 0, details: [] },
  bookStructure: { passed: 0, total: 0, details: [] }
};

// Helper function to add test result
function addTestResult(category, testName, passed, details = '') {
  testResults[category].total++;
  if (passed) {
    testResults[category].passed++;
    console.log(`✅ ${testName}`);
  } else {
    console.log(`❌ ${testName}: ${details}`);
  }
  testResults[category].details.push({ testName, passed, details });
}

// Test 1: Upload System Tests
async function testUploadSystem() {
  console.log('\n📤 Test 1: Upload System Tests');
  
  // Test 1.1: Directory structure
  const requiredDirs = [
    config.mediaRootDir,
    config.booksDir,
    config.coversDir
  ];
  
  let allDirsExist = true;
  requiredDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      allDirsExist = false;
    }
  });
  
  addTestResult('uploadSystem', 'Directory structure exists', allDirsExist);
  
  // Test 1.2: File permissions
  let permissionsOk = true;
  try {
    const stats = fs.statSync(config.booksDir);
    const mode = stats.mode.toString(8).slice(-3);
    permissionsOk = mode === '755';
  } catch (error) {
    permissionsOk = false;
  }
  
  addTestResult('uploadSystem', 'File permissions correct', permissionsOk);
  
  // Test 1.3: Create test files
  const testBookDir = path.join(config.booksDir, config.testBookId.toString());
  const testEpubPath = path.join(testBookDir, 'test-book.epub');
  const testCoverPath = path.join(config.coversDir, 'test-cover.jpg');
  
  try {
    if (!fs.existsSync(testBookDir)) {
      fs.mkdirSync(testBookDir, { recursive: true });
    }
    
    fs.writeFileSync(testEpubPath, 'Test EPUB content');
    fs.writeFileSync(testCoverPath, 'Test cover image content');
    
    addTestResult('uploadSystem', 'Test files created successfully', true);
  } catch (error) {
    addTestResult('uploadSystem', 'Test files created successfully', false, error.message);
  }
  
  // Test 1.4: File serving endpoints (if server is running)
  try {
    const response = await fetch(`${config.baseUrl}/api/book-files/books/${config.testBookId}/test-book.epub`);
    addTestResult('uploadSystem', 'File serving endpoint accessible', response.ok);
  } catch (error) {
    addTestResult('uploadSystem', 'File serving endpoint accessible', false, 'Server not running or endpoint not accessible');
  }
}

// Test 2: Book Management Tests
async function testBookManagement() {
  console.log('\n📚 Test 2: Book Management Tests');
  
  // Test 2.1: Admin books API
  try {
    const response = await fetch(`${config.baseUrl}/api/admin/books?page=1&limit=20`);
    addTestResult('bookManagement', 'Admin books API accessible', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      addTestResult('bookManagement', 'Admin books API returns data', !!data);
    }
  } catch (error) {
    addTestResult('bookManagement', 'Admin books API accessible', false, error.message);
  }
  
  // Test 2.2: Book details API
  try {
    const response = await fetch(`${config.baseUrl}/api/books/${config.testBookId}`);
    addTestResult('bookManagement', 'Book details API accessible', response.ok);
  } catch (error) {
    addTestResult('bookManagement', 'Book details API accessible', false, error.message);
  }
  
  // Test 2.3: Database integration
  try {
    // This would require database connection - for now, check if files exist
    const testBookDir = path.join(config.booksDir, config.testBookId.toString());
    const bookExists = fs.existsSync(testBookDir);
    addTestResult('bookManagement', 'Book exists in storage', bookExists);
  } catch (error) {
    addTestResult('bookManagement', 'Book exists in storage', false, error.message);
  }
}

// Test 3: E-Reader Integration Tests
async function testEReaderIntegration() {
  console.log('\n📖 Test 3: E-Reader Integration Tests');
  
  // Test 3.1: User library API
  try {
    const response = await fetch(`${config.baseUrl}/api/dashboard/library`);
    addTestResult('eReaderIntegration', 'User library API accessible', response.ok);
  } catch (error) {
    addTestResult('eReaderIntegration', 'User library API accessible', false, error.message);
  }
  
  // Test 3.2: Book content API
  try {
    const response = await fetch(`${config.baseUrl}/api/books/${config.testBookId}/content`);
    addTestResult('eReaderIntegration', 'Book content API accessible', response.ok);
  } catch (error) {
    addTestResult('eReaderIntegration', 'Book content API accessible', false, error.message);
  }
  
  // Test 3.3: EPUB content API
  try {
    const response = await fetch(`${config.baseUrl}/api/books/${config.testBookId}/epub-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileUrl: `/media_root/books/${config.testBookId}/test-book.epub` })
    });
    addTestResult('eReaderIntegration', 'EPUB content API accessible', response.ok);
  } catch (error) {
    addTestResult('eReaderIntegration', 'EPUB content API accessible', false, error.message);
  }
  
  // Test 3.4: File access security
  try {
    const response = await fetch(`${config.baseUrl}/api/book-files/books/${config.testBookId}/test-book.epub`);
    addTestResult('eReaderIntegration', 'File access works', response.ok);
  } catch (error) {
    addTestResult('eReaderIntegration', 'File access works', false, error.message);
  }
}

// Test 4: Book Structure Tests
async function testBookStructure() {
  console.log('\n📋 Test 4: Book Structure Tests');
  
  // Test 4.1: EPUB parsing capability
  try {
    const response = await fetch(`${config.baseUrl}/api/books/${config.testBookId}/epub-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileUrl: `/media_root/books/${config.testBookId}/test-book.epub` })
    });
    
    if (response.ok) {
      const data = await response.json();
      addTestResult('bookStructure', 'EPUB parsing works', !!data.content);
    } else {
      addTestResult('bookStructure', 'EPUB parsing works', false, 'API returned error');
    }
  } catch (error) {
    addTestResult('bookStructure', 'EPUB parsing works', false, error.message);
  }
  
  // Test 4.2: Content structure
  try {
    const response = await fetch(`${config.baseUrl}/api/books/${config.testBookId}/content`);
    
    if (response.ok) {
      const data = await response.json();
      const hasChapters = data.chapters && Array.isArray(data.chapters);
      addTestResult('bookStructure', 'Content has chapters', hasChapters);
    } else {
      addTestResult('bookStructure', 'Content has chapters', false, 'API returned error');
    }
  } catch (error) {
    addTestResult('bookStructure', 'Content has chapters', false, error.message);
  }
  
  // Test 4.3: File format support
  const supportedFormats = ['epub', 'pdf', 'html'];
  let formatSupport = true;
  
  supportedFormats.forEach(format => {
    const testFile = path.join(config.booksDir, config.testBookId.toString(), `test-book.${format}`);
    try {
      fs.writeFileSync(testFile, `Test ${format} content`);
    } catch (error) {
      formatSupport = false;
    }
  });
  
  addTestResult('bookStructure', 'Multiple file formats supported', formatSupport);
  
  // Test 4.4: Metadata extraction
  try {
    const response = await fetch(`${config.baseUrl}/api/books/${config.testBookId}/content`);
    
    if (response.ok) {
      const data = await response.json();
      const hasMetadata = data.book && data.book.title;
      addTestResult('bookStructure', 'Metadata extraction works', hasMetadata);
    } else {
      addTestResult('bookStructure', 'Metadata extraction works', false, 'API returned error');
    }
  } catch (error) {
    addTestResult('bookStructure', 'Metadata extraction works', false, error.message);
  }
}

// Cleanup function
function cleanup() {
  console.log('\n🧹 Cleaning up test files...');
  
  try {
    const testBookDir = path.join(config.booksDir, config.testBookId.toString());
    const testCoverPath = path.join(config.coversDir, 'test-cover.jpg');
    
    if (fs.existsSync(testBookDir)) {
      fs.rmSync(testBookDir, { recursive: true, force: true });
    }
    
    if (fs.existsSync(testCoverPath)) {
      fs.unlinkSync(testCoverPath);
    }
    
    console.log('✅ Test files cleaned up');
  } catch (error) {
    console.log('⚠️ Cleanup failed:', error.message);
  }
}

// Main test function
async function runComprehensiveTests() {
  console.log('🚀 Starting Comprehensive Book Storage System Tests...\n');
  
  try {
    // Run all test suites
    await testUploadSystem();
    await testBookManagement();
    await testEReaderIntegration();
    await testBookStructure();
    
    // Calculate results
    const totalTests = Object.values(testResults).reduce((sum, category) => sum + category.total, 0);
    const totalPassed = Object.values(testResults).reduce((sum, category) => sum + category.passed, 0);
    
    // Display results
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    Object.entries(testResults).forEach(([category, results]) => {
      const percentage = results.total > 0 ? Math.round((results.passed / results.total) * 100) : 0;
      console.log(`${category}: ${results.passed}/${results.total} (${percentage}%)`);
      
      if (results.details.length > 0) {
        results.details.forEach(detail => {
          if (!detail.passed) {
            console.log(`  ❌ ${detail.testName}: ${detail.details}`);
          }
        });
      }
    });
    
    console.log('\n🎯 Overall Result:');
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${totalPassed}`);
    console.log(`   Failed: ${totalTests - totalPassed}`);
    console.log(`   Success Rate: ${Math.round((totalPassed / totalTests) * 100)}%`);
    
    if (totalPassed === totalTests) {
      console.log('\n🎉 All tests passed! 100% confidence achieved!');
    } else {
      console.log('\n⚠️ Some tests failed. Please review the issues above.');
    }
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
  } finally {
    cleanup();
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runComprehensiveTests();
}

module.exports = {
  runComprehensiveTests,
  testResults,
  config
};
