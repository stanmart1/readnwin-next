const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: '149.102.159.118',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '6c8u2MsYqlbQxL5IxftjrV7QQnlLymdsmzMtTeIe4Ur1od7RR9CdODh3VfQ4ka2f'
});

async function verifyImplementation() {
  console.log('🔍 Verifying EPUB/HTML Structure Preservation Implementation...\n');
  
  const results = {
    database: { passed: 0, total: 0 },
    storage: { passed: 0, total: 0 },
    apis: { passed: 0, total: 0 },
    ereader: { passed: 0, total: 0 }
  };

  try {
    // 1. Database Schema Verification
    console.log('📊 Database Schema:');
    
    // Check book_files columns
    results.database.total++;
    const bookFilesColumns = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'book_files' AND column_name IN ('preserve_structure', 'original_structure', 'extraction_path')
    `);
    if (bookFilesColumns.rows.length === 3) {
      console.log('✅ book_files structure preservation columns exist');
      results.database.passed++;
    } else {
      console.log('❌ Missing book_files columns:', 3 - bookFilesColumns.rows.length);
    }
    
    // Check epub_structure table
    results.database.total++;
    const epubTable = await pool.query(`
      SELECT table_name FROM information_schema.tables WHERE table_name = 'epub_structure'
    `);
    if (epubTable.rows.length > 0) {
      console.log('✅ epub_structure table exists');
      results.database.passed++;
    } else {
      console.log('❌ epub_structure table missing');
    }
    
    // Check html_structure table
    results.database.total++;
    const htmlTable = await pool.query(`
      SELECT table_name FROM information_schema.tables WHERE table_name = 'html_structure'
    `);
    if (htmlTable.rows.length > 0) {
      console.log('✅ html_structure table exists');
      results.database.passed++;
    } else {
      console.log('❌ html_structure table missing');
    }

    // 2. Storage System Verification
    console.log('\n📁 Storage System:');
    
    // Check BookStorage functions
    results.storage.total++;
    const bookStoragePath = './utils/book-storage.ts';
    if (fs.existsSync(bookStoragePath)) {
      const content = fs.readFileSync(bookStoragePath, 'utf8');
      if (content.includes('preserveEpubStructure') && content.includes('preserveHtmlStructure')) {
        console.log('✅ Structure preservation functions exist');
        results.storage.passed++;
      } else {
        console.log('❌ Structure preservation functions missing');
      }
    } else {
      console.log('❌ book-storage.ts not found');
    }
    
    // Check storage directory structure
    results.storage.total++;
    const storageDir = './storage/books';
    if (fs.existsSync(storageDir)) {
      console.log('✅ Storage directory exists');
      results.storage.passed++;
    } else {
      console.log('❌ Storage directory missing');
    }

    // 3. API Endpoints Verification
    console.log('\n🔌 API Endpoints:');
    
    // Check upload API
    results.apis.total++;
    const uploadApiPath = './app/api/admin/books/route.ts';
    if (fs.existsSync(uploadApiPath)) {
      const content = fs.readFileSync(uploadApiPath, 'utf8');
      if (content.includes('preserveEpubStructure') && content.includes('preserveHtmlStructure')) {
        console.log('✅ Upload API uses structure preservation');
        results.apis.passed++;
      } else {
        console.log('❌ Upload API missing structure preservation');
      }
    } else {
      console.log('❌ Upload API not found');
    }
    
    // Check content API
    results.apis.total++;
    const contentApiPath = './app/api/books/[bookId]/content/route.ts';
    if (fs.existsSync(contentApiPath)) {
      const content = fs.readFileSync(contentApiPath, 'utf8');
      if (content.includes('epub_structure') && content.includes('html_structure')) {
        console.log('✅ Content API serves preserved structure');
        results.apis.passed++;
      } else {
        console.log('❌ Content API missing structure serving');
      }
    } else {
      console.log('❌ Content API not found');
    }
    
    // Check EPUB asset serving API
    results.apis.total++;
    const assetApiPath = './app/api/ebooks/[bookId]/[...path]/route.ts';
    if (fs.existsSync(assetApiPath)) {
      console.log('✅ EPUB asset serving API exists');
      results.apis.passed++;
    } else {
      console.log('❌ EPUB asset serving API missing');
    }

    // 4. E-Reader Verification
    console.log('\n📖 E-Reader Components:');
    
    // Check ModernEReader
    results.ereader.total++;
    const ereaderPath = './app/reading/components/ModernEReader.tsx';
    if (fs.existsSync(ereaderPath)) {
      const content = fs.readFileSync(ereaderPath, 'utf8');
      if (content.includes('loadEpubChapters') && content.includes('preservedFormat')) {
        console.log('✅ E-Reader supports structure-preserved books');
        results.ereader.passed++;
      } else {
        console.log('❌ E-Reader missing structure preservation support');
      }
    } else {
      console.log('❌ ModernEReader not found');
    }
    
    // Check EReader Store
    results.ereader.total++;
    const storePath = './stores/modernEReaderStore.ts';
    if (fs.existsSync(storePath)) {
      const content = fs.readFileSync(storePath, 'utf8');
      if (content.includes('preservedFormat') && content.includes('structure')) {
        console.log('✅ E-Reader store supports preserved structure');
        results.ereader.passed++;
      } else {
        console.log('❌ E-Reader store missing structure support');
      }
    } else {
      console.log('❌ ModernEReaderStore not found');
    }

    // Summary
    console.log('\n📋 Implementation Summary:');
    const totalPassed = results.database.passed + results.storage.passed + results.apis.passed + results.ereader.passed;
    const totalTests = results.database.total + results.storage.total + results.apis.total + results.ereader.total;
    
    console.log(`Database: ${results.database.passed}/${results.database.total}`);
    console.log(`Storage: ${results.storage.passed}/${results.storage.total}`);
    console.log(`APIs: ${results.apis.passed}/${results.apis.total}`);
    console.log(`E-Reader: ${results.ereader.passed}/${results.ereader.total}`);
    console.log(`\nOverall: ${totalPassed}/${totalTests} (${Math.round(totalPassed/totalTests*100)}%)`);
    
    if (totalPassed === totalTests) {
      console.log('\n🎉 All components fully implemented!');
    } else {
      console.log(`\n⚠️  ${totalTests - totalPassed} components need attention`);
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await pool.end();
  }
}

verifyImplementation();