#!/usr/bin/env node

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || '149.102.159.118',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || '6c8u2MsYqlbQxL5IxftjrV7QQnlLymdsmzMtTeIe4Ur1od7RR9CdODh3VfQ4ka2f',
  port: process.env.DB_PORT || 5432,
});

async function testEbookFormats() {
  const client = await pool.connect();
  
  try {
    console.log('🧪 Testing EPUB and HTML format support...');
    
    // Check file format constraints
    const result = await client.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'book_files' AND column_name = 'file_format'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ file_format column exists:', result.rows[0]);
    } else {
      console.log('❌ file_format column not found');
    }
    
    // Test EPUB format validation
    try {
      await client.query(`
        INSERT INTO book_files (book_id, file_type, original_filename, stored_filename, file_path, file_size, mime_type, file_hash, file_format)
        VALUES (1, 'ebook', 'test.epub', 'test_123.epub', '/test/path', 1000, 'application/epub+zip', 'testhash', 'epub')
      `);
      console.log('✅ EPUB format accepted');
      
      await client.query(`DELETE FROM book_files WHERE file_hash = 'testhash'`);
    } catch (error) {
      console.log('❌ EPUB format test failed:', error.message);
    }
    
    // Test HTML format validation
    try {
      await client.query(`
        INSERT INTO book_files (book_id, file_type, original_filename, stored_filename, file_path, file_size, mime_type, file_hash, file_format)
        VALUES (1, 'ebook', 'test.html', 'test_456.html', '/test/path', 1000, 'text/html', 'testhash2', 'html')
      `);
      console.log('✅ HTML format accepted');
      
      await client.query(`DELETE FROM book_files WHERE file_hash = 'testhash2'`);
    } catch (error) {
      console.log('❌ HTML format test failed:', error.message);
    }
    
    console.log('🎉 Format testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testEbookFormats();