const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function debugFileUpload() {
  console.log('🔍 Debugging File Upload System');
  console.log('================================');
  
  // Check environment
  console.log('\n1. Environment Check:');
  console.log('   NODE_ENV:', process.env.NODE_ENV);
  console.log('   Current working directory:', process.cwd());
  
  // Check book-files directory
  const bookFilesDir = path.join(process.cwd(), 'book-files');
  console.log('\n2. Book Files Directory Check:');
  console.log('   Path:', bookFilesDir);
  console.log('   Exists:', fs.existsSync(bookFilesDir));
  
  if (fs.existsSync(bookFilesDir)) {
    console.log('   Is directory:', fs.statSync(bookFilesDir).isDirectory());
    console.log('   Permissions:', fs.statSync(bookFilesDir).mode.toString(8));
    
    const files = fs.readdirSync(bookFilesDir);
    console.log('   Files in directory:', files.length);
    files.forEach(file => {
      const filePath = path.join(bookFilesDir, file);
      const stats = fs.statSync(filePath);
      console.log(`     - ${file} (${stats.size} bytes, ${stats.mtime})`);
    });
  } else {
    console.log('   ❌ Directory does not exist - creating it...');
    try {
      fs.mkdirSync(bookFilesDir, { recursive: true });
      console.log('   ✅ Directory created successfully');
    } catch (error) {
      console.error('   ❌ Failed to create directory:', error.message);
    }
  }
  
  // Check uploads directory
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  console.log('\n3. Uploads Directory Check:');
  console.log('   Path:', uploadsDir);
  console.log('   Exists:', fs.existsSync(uploadsDir));
  
  if (fs.existsSync(uploadsDir)) {
    console.log('   Is directory:', fs.statSync(uploadsDir).isDirectory());
    console.log('   Permissions:', fs.statSync(uploadsDir).mode.toString(8));
    
    const subdirs = fs.readdirSync(uploadsDir);
    console.log('   Subdirectories:', subdirs);
    
    subdirs.forEach(subdir => {
      const subdirPath = path.join(uploadsDir, subdir);
      if (fs.statSync(subdirPath).isDirectory()) {
        const files = fs.readdirSync(subdirPath);
        console.log(`     ${subdir}/: ${files.length} files`);
      }
    });
  }
  
  // Check file permissions
  console.log('\n4. File System Permissions:');
  try {
    // Test write permission to book-files directory
    const testFile = path.join(bookFilesDir, 'test-write-permission.txt');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('   ✅ Write permission to book-files directory: OK');
  } catch (error) {
    console.error('   ❌ Write permission to book-files directory: FAILED');
    console.error('      Error:', error.message);
  }
  
  // Check database for recent uploads
  console.log('\n5. Database Upload Records:');
  try {
    const { query } = require('./utils/database');
    
    const recentBooks = await query(`
      SELECT id, title, ebook_file_url, created_at, updated_at
      FROM books 
      WHERE created_at >= NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
    `);
    
    console.log(`   Recent books in database: ${recentBooks.rows.length}`);
    
    recentBooks.rows.forEach((book, index) => {
      console.log(`   ${index + 1}. ID: ${book.id}, Title: ${book.title}`);
      console.log(`      File URL: ${book.ebook_file_url || 'none'}`);
      console.log(`      Created: ${book.created_at}`);
      console.log(`      Updated: ${book.updated_at}`);
      
      // Check if file exists on disk
      if (book.ebook_file_url) {
        let filePath;
        if (book.ebook_file_url.startsWith('/book-files/')) {
          const relativePath = book.ebook_file_url.replace('/book-files/', '');
          filePath = path.join(bookFilesDir, relativePath);
        } else {
          filePath = book.ebook_file_url;
        }
        
        const fileExists = fs.existsSync(filePath);
        console.log(`      File exists on disk: ${fileExists ? '✅' : '❌'}`);
        if (!fileExists) {
          console.log(`      Expected path: ${filePath}`);
        }
      }
    });
    
  } catch (error) {
    console.error('   ❌ Database query failed:', error.message);
  }
  
  // Check file upload service configuration
  console.log('\n6. File Upload Service Configuration:');
  try {
    const { fileUploadService } = require('./utils/file-upload');
    console.log('   Service loaded successfully');
    
    // Test the service methods
    console.log('   Testing service methods...');
    
    // Check if uploadEbookFile method exists
    if (typeof fileUploadService.uploadEbookFile === 'function') {
      console.log('   ✅ uploadEbookFile method exists');
    } else {
      console.log('   ❌ uploadEbookFile method missing');
    }
    
    // Check if validateEbookFile method exists
    if (typeof fileUploadService.validateEbookFile === 'function') {
      console.log('   ✅ validateEbookFile method exists');
    } else {
      console.log('   ❌ validateEbookFile method missing');
    }
    
  } catch (error) {
    console.error('   ❌ File upload service error:', error.message);
  }
  
  // Recommendations
  console.log('\n7. Recommendations:');
  console.log('   Based on the analysis, here are the likely issues:');
  console.log('   1. File upload service may have permission issues');
  console.log('   2. Directory structure may not be properly initialized');
  console.log('   3. File paths may be incorrectly resolved');
  console.log('   4. Database records may not match actual files');
  
  console.log('\n   Next steps:');
  console.log('   1. Fix directory permissions if needed');
  console.log('   2. Update file upload service error handling');
  console.log('   3. Implement file verification after upload');
  console.log('   4. Add better logging to track upload process');
}

debugFileUpload().catch(console.error); 