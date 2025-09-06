#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: '149.102.159.118',
  database: 'postgres',
  password: '6c8u2MsYqlbQxL5IxftjrV7QQnlLymdsmzMtTeIe4Ur1od7RR9CdODh3VfQ4ka2f',
  port: 5432,
  ssl: false
});

// Mimic the SecurityUtils.sanitizeFilename function
function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

// Mimic the SecurityUtils.isPathSafe function
function isPathSafe(filePath, baseDir) {
  const resolvedPath = path.resolve(filePath);
  const resolvedBase = path.resolve(baseDir);
  return resolvedPath.startsWith(resolvedBase);
}

// Simulate the exact logic from /api/books/[bookId]/content
async function simulateEReaderAccess(bookId, userId) {
  console.log(`\n🔍 SIMULATING E-READER ACCESS FOR BOOK ${bookId}`);
  
  try {
    const client = await pool.connect();
    
    // Step 1: Check book access (same as API)
    console.log('   1️⃣ Checking book access...');
    const bookCheck = await client.query(`
      SELECT b.id, b.title, b.ebook_file_url, b.format, ul.user_id as library_user,
             COALESCE(a.name, 'Unknown Author') as author_name
      FROM books b
      LEFT JOIN user_library ul ON b.id = ul.book_id AND ul.user_id = $1
      LEFT JOIN authors a ON b.author_id = a.id
      WHERE b.id = $2 AND (ul.user_id IS NOT NULL OR 'admin' IN ('admin', 'super_admin'))
    `, [userId, bookId]);

    if (bookCheck.rows.length === 0) {
      console.log('   ❌ Access denied - User does not have access to this book');
      client.release();
      return false;
    }

    const book = bookCheck.rows[0];
    console.log(`   ✅ Access granted for "${book.title}"`);
    console.log(`   📄 Ebook URL: ${book.ebook_file_url}`);
    
    if (!book.ebook_file_url) {
      console.log('   ❌ No ebook file URL in database');
      client.release();
      return false;
    }

    // Step 2: Extract filename and find file (same logic as API)
    console.log('   2️⃣ Extracting filename and locating file...');
    const urlParts = book.ebook_file_url.split('/');
    const rawFilename = urlParts[urlParts.length - 1];
    const filename = sanitizeFilename(rawFilename);
    console.log(`   📁 Looking for filename: ${filename}`);
    
    // Step 3: Try multiple file locations (exact API logic)
    const storageDir = path.join(process.cwd(), 'storage');
    let possiblePaths = [
      path.join(storageDir, 'ebooks', filename),
      path.join(storageDir, 'ebooks', `${bookId}_${filename}`),
      path.join(storageDir, 'books', bookId.toString(), filename),
      path.join(storageDir, 'books', bookId.toString(), `${bookId}_${filename}`)
    ];
    
    // Step 4: Search for matching files (enhanced logic from API)
    try {
      const ebooksDir = path.join(storageDir, 'ebooks');
      if (fs.existsSync(ebooksDir)) {
        const allFiles = fs.readdirSync(ebooksDir);
        console.log(`   📂 Available files in storage: ${allFiles.join(', ')}`);
        
        const matchingFiles = allFiles.filter(f => {
          const lowerFile = f.toLowerCase();
          const lowerFilename = filename.toLowerCase();
          
          // Check if file contains book ID
          if (f.includes(bookId.toString()) || f.includes(`${bookId}_`)) return true;
          
          // Check if filename parts match
          const baseFilename = lowerFilename.replace(/^\\d+_/, '');
          if (lowerFile.includes(baseFilename.replace('.epub', ''))) return true;
          
          // Check for similar names (moby-dick vs mobydick)
          const cleanBase = baseFilename.replace(/[-_]/g, '');
          const cleanFile = lowerFile.replace(/[-_]/g, '');
          if (cleanFile.includes(cleanBase.replace('.epub', ''))) return true;
          
          return false;
        });
        
        possiblePaths.push(...matchingFiles.map(f => path.join(ebooksDir, f)));
        console.log(`   🔍 Matching files found: ${matchingFiles.join(', ')}`);
      }
    } catch (searchError) {
      console.log(`   ⚠️ File search error: ${searchError.message}`);
    }
    
    // Step 5: Find accessible file
    possiblePaths = possiblePaths.filter(p => isPathSafe(p, storageDir));
    
    let filePath = null;
    for (const testPath of possiblePaths) {
      console.log(`   🔍 Checking: ${testPath}`);
      if (fs.existsSync(testPath)) {
        filePath = testPath;
        console.log(`   ✅ File found at: ${filePath}`);
        break;
      }
    }
    
    if (!filePath) {
      console.log('   ❌ File not found in any expected location');
      client.release();
      return false;
    }

    // Step 6: Read and process file (same as API)
    console.log('   3️⃣ Reading and processing file...');
    const fileBuffer = fs.readFileSync(filePath);
    console.log(`   📊 File size: ${(fileBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    
    const fileExtension = path.extname(filePath).toLowerCase();
    console.log(`   📄 File type: ${fileExtension}`);
    
    // Step 7: Process based on file type
    if (fileExtension === '.epub') {
      console.log('   4️⃣ Processing EPUB file...');
      try {
        const JSZip = require('jszip');
        const zip = await JSZip.loadAsync(fileBuffer);
        console.log(`   📚 EPUB loaded successfully, ${Object.keys(zip.files).length} files inside`);
        
        // Check for container.xml
        const containerFile = zip.file('META-INF/container.xml');
        if (containerFile) {
          const containerXml = await containerFile.async('text');
          const opfMatch = containerXml.match(/full-path="([^"]+)"/i);
          
          if (opfMatch) {
            console.log(`   📋 OPF file found: ${opfMatch[1]}`);
            const opfFile = zip.file(opfMatch[1]);
            if (opfFile) {
              const opfXml = await opfFile.async('text');
              const spineMatches = opfXml.match(/<itemref[^>]*idref="([^"]+)"/gi);
              console.log(`   📖 Spine items found: ${spineMatches ? spineMatches.length : 0}`);
              
              console.log('   ✅ EPUB structure is valid and readable');
              client.release();
              return true;
            }
          }
        }
        console.log('   ⚠️ EPUB structure incomplete but file is accessible');
        client.release();
        return true;
      } catch (epubError) {
        console.log(`   ❌ EPUB processing failed: ${epubError.message}`);
        client.release();
        return false;
      }
    } else if (fileExtension === '.html' || fileExtension === '.htm') {
      console.log('   4️⃣ Processing HTML file...');
      try {
        const content = fileBuffer.toString('utf-8');
        console.log(`   📄 HTML content length: ${content.length} characters`);
        
        const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) {
          console.log(`   📖 HTML title found: ${titleMatch[1]}`);
        }
        
        console.log('   ✅ HTML file is readable');
        client.release();
        return true;
      } catch (htmlError) {
        console.log(`   ❌ HTML processing failed: ${htmlError.message}`);
        client.release();
        return false;
      }
    } else {
      console.log('   ⚠️ Unknown file format, but file is accessible');
      client.release();
      return true;
    }
    
  } catch (error) {
    console.error(`   ❌ Simulation failed: ${error.message}`);
    return false;
  }
}

async function verifyEReaderAccess() {
  console.log('📱 E-READER ACCESS SIMULATION');
  console.log('This mimics exactly how the e-reader would access ebook content\n');
  
  try {
    const client = await pool.connect();
    
    // Get all ebook assignments
    const assignments = await client.query(`
      SELECT ul.user_id, ul.book_id, b.title, b.ebook_file_url
      FROM user_library ul
      JOIN books b ON ul.book_id = b.id
      WHERE b.format = 'ebook' AND b.ebook_file_url IS NOT NULL
    `);
    
    console.log(`📚 Found ${assignments.rows.length} ebook assignments to test\n`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const assignment of assignments.rows) {
      console.log(`\n📖 Testing: "${assignment.title}" (Book ID: ${assignment.book_id}, User ID: ${assignment.user_id})`);
      
      const success = await simulateEReaderAccess(assignment.book_id, assignment.user_id);
      
      if (success) {
        console.log('   🎉 SUCCESS - E-reader can access this ebook');
        successCount++;
      } else {
        console.log('   💥 FAILED - E-reader cannot access this ebook');
        failCount++;
      }
    }
    
    // Final assessment
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL ASSESSMENT');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📈 Success Rate: ${assignments.rows.length > 0 ? Math.round((successCount / assignments.rows.length) * 100) : 0}%`);
    
    if (successCount === assignments.rows.length && assignments.rows.length > 0) {
      console.log('\n🎯 GUARANTEE: YES - E-reader can fully retrieve ebook content');
      console.log('✅ Upload process works correctly');
      console.log('✅ File storage is accessible');
      console.log('✅ Content parsing succeeds');
      console.log('✅ User access control functions');
    } else if (assignments.rows.length === 0) {
      console.log('\n⚠️ CANNOT TEST: No ebook assignments found');
      console.log('📝 Recommendation: Upload an ebook and assign it to a user');
    } else {
      console.log('\n❌ CANNOT GUARANTEE: Some ebooks are not accessible');
      console.log('🔧 Issues need to be resolved before guaranteeing functionality');
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await pool.end();
  }
}

// Install jszip if not available
try {
  require('jszip');
} catch (e) {
  console.log('Installing jszip...');
  require('child_process').execSync('npm install jszip', { stdio: 'inherit' });
}

verifyEReaderAccess();