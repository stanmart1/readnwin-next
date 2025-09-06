#!/usr/bin/env node

const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '149.102.159.118',
  database: 'postgres',
  password: '6c8u2MsYqlbQxL5IxftjrV7QQnlLymdsmzMtTeIe4Ur1od7RR9CdODh3VfQ4ka2f',
  port: 5432,
  ssl: false
});

async function fixEbookUrl() {
  try {
    const client = await pool.connect();
    
    // Update the ebook URL to match existing file
    await client.query(`
      UPDATE books 
      SET ebook_file_url = '/api/ebooks/197/164_mobydick.epub'
      WHERE id = 197
    `);
    
    console.log('✅ Updated ebook URL to match existing file');
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixEbookUrl();