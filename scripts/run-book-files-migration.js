#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || '149.102.159.118',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || '6c8u2MsYqlbQxL5IxftjrV7QQnlLymdsmzMtTeIe4Ur1od7RR9CdODh3VfQ4ka2f',
  port: process.env.DB_PORT || 5432,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting book files migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '006_book_files_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await client.query(migrationSQL);
    
    console.log('✅ Book files migration completed successfully!');
    
    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('book_files', 'book_parsing_queue')
      ORDER BY table_name
    `);
    
    console.log('📋 Created tables:', result.rows.map(row => row.table_name));
    
    // Check if columns were added to books table
    const bookColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'books' 
      AND column_name IN ('file_format', 'file_size', 'file_hash', 'parsing_status', 'processing_status', 'word_count', 'estimated_reading_time', 'chapters', 'created_by')
      ORDER BY column_name
    `);
    
    console.log('📋 Added columns to books table:', bookColumns.rows.map(row => row.column_name));
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });