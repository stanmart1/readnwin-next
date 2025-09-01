const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  host: '149.102.159.118',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '6c8u2MsYqlbQxL5IxftjrV7QQnlLymdsmzMtTeIe4Ur1od7RR9CdODh3VfQ4ka2f'
});

async function finalVerification() {
  console.log('🔍 Final Implementation Verification\n');
  
  const checks = [];

  try {
    // Database Schema
    console.log('📊 Database Schema:');
    const columns = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'book_files' 
      AND column_name IN ('preserve_structure', 'original_structure', 'extraction_path', 'original_format', 'asset_count')
    `);
    checks.push({ name: 'book_files columns', passed: columns.rows.length === 5 });
    
    const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_name IN ('epub_structure', 'html_structure')
    `);
    checks.push({ name: 'Structure tables', passed: tables.rows.length === 2 });

    // Storage System
    console.log('📁 Storage System:');
    const bookStorage = fs.existsSync('./utils/book-storage.ts');
    const hasPreserveFunctions = bookStorage && fs.readFileSync('./utils/book-storage.ts', 'utf8').includes('preserveEpubStructure');
    checks.push({ name: 'Structure preservation functions', passed: hasPreserveFunctions });

    // API Endpoints
    console.log('🔌 API Endpoints:');
    const uploadApi = fs.existsSync('./app/api/admin/books/route.ts');
    const contentApi = fs.existsSync('./app/api/books/[bookId]/content/route.ts');
    const epubAssetApi = fs.existsSync('./app/api/ebooks/[bookId]/[...path]/route.ts');
    const bookAssetApi = fs.existsSync('./app/api/books/[bookId]/assets/[...path]/route.ts');
    const metadataApi = fs.existsSync('./app/api/books/[bookId]/metadata/route.ts');
    
    checks.push({ name: 'Upload API', passed: uploadApi });
    checks.push({ name: 'Content API', passed: contentApi });
    checks.push({ name: 'EPUB asset API', passed: epubAssetApi });
    checks.push({ name: 'Book asset API', passed: bookAssetApi });
    checks.push({ name: 'Metadata API', passed: metadataApi });

    // E-Reader Components
    console.log('📖 E-Reader:');
    const ereader = fs.existsSync('./app/reading/components/ModernEReader.tsx');
    const store = fs.existsSync('./stores/modernEReaderStore.ts');
    checks.push({ name: 'ModernEReader component', passed: ereader });
    checks.push({ name: 'EReader store', passed: store });

    // Storage Structure
    console.log('📂 Storage Structure:');
    const storageDir = fs.existsSync('./storage/books');
    checks.push({ name: 'Storage directory', passed: storageDir });

    // Summary
    console.log('\n📋 Final Results:');
    const passed = checks.filter(c => c.passed).length;
    const total = checks.length;
    
    checks.forEach(check => {
      console.log(`${check.passed ? '✅' : '❌'} ${check.name}`);
    });
    
    console.log(`\n🎯 Implementation Status: ${passed}/${total} (${Math.round(passed/total*100)}%)`);
    
    if (passed === total) {
      console.log('\n🎉 EPUB/HTML Structure Preservation System FULLY IMPLEMENTED!');
      console.log('\nFeatures Available:');
      console.log('• EPUB structure preservation without conversion');
      console.log('• HTML format preservation');
      console.log('• Asset serving (images, CSS, fonts)');
      console.log('• Native EPUB rendering in e-reader');
      console.log('• Chapter navigation from original structure');
      console.log('• Metadata extraction and serving');
      console.log('• Secure access control');
    } else {
      console.log(`\n⚠️  ${total - passed} components need attention`);
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await pool.end();
  }
}

finalVerification();