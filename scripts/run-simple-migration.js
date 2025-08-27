#!/usr/bin/env node

const { Pool } = require('pg');

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
    console.log('🚀 Running simple migration for ebook upload...');
    
    // Add metadata_extracted_at column to books table if it doesn't exist
    await client.query(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'books' AND column_name = 'metadata_extracted_at'
          ) THEN
              ALTER TABLE books ADD COLUMN metadata_extracted_at TIMESTAMP WITH TIME ZONE;
          END IF;
      END $$;
    `);
    
    console.log('✅ Added metadata_extracted_at column to books table');
    
    // Verify the book_files table exists (should be created by previous migration)
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'book_files'
    `);
    
    if (tableCheck.rows.length > 0) {
      console.log('✅ book_files table exists');
    } else {
      console.log('⚠️ book_files table does not exist - running book files migration first');
      
      // Run the book files migration SQL directly
      const bookFilesMigration = `
        CREATE TABLE IF NOT EXISTS book_files (
            id SERIAL PRIMARY KEY,
            book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
            file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('cover', 'ebook', 'sample', 'audio')),
            original_filename VARCHAR(255) NOT NULL,
            stored_filename VARCHAR(255) NOT NULL,
            file_path TEXT NOT NULL,
            file_size BIGINT NOT NULL,
            mime_type VARCHAR(100) NOT NULL,
            file_hash VARCHAR(64) NOT NULL,
            file_format VARCHAR(20) NOT NULL CHECK (file_format IN ('epub', 'html', 'pdf', 'image', 'audio')),
            processing_status VARCHAR(20) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
            processing_error TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_book_files_book_id ON book_files(book_id);
        CREATE INDEX IF NOT EXISTS idx_book_files_type ON book_files(file_type);
        CREATE INDEX IF NOT EXISTS idx_book_files_hash ON book_files(file_hash);
        CREATE INDEX IF NOT EXISTS idx_book_files_status ON book_files(processing_status);
      `;
      
      await client.query(bookFilesMigration);
      console.log('✅ Created book_files table');
    }
    
    // Verify secure_file_access_logs table exists
    const logsCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'secure_file_access_logs'
    `);
    
    if (logsCheck.rows.length === 0) {
      console.log('⚠️ secure_file_access_logs table does not exist - creating it');
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS secure_file_access_logs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
            file_path TEXT,
            access_status VARCHAR(20) NOT NULL CHECK (access_status IN ('success', 'error', 'denied')),
            error_message TEXT,
            ip_address INET,
            user_agent TEXT,
            accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_secure_file_access_user_id ON secure_file_access_logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_secure_file_access_book_id ON secure_file_access_logs(book_id);
        CREATE INDEX IF NOT EXISTS idx_secure_file_access_status ON secure_file_access_logs(access_status);
        CREATE INDEX IF NOT EXISTS idx_secure_file_access_accessed_at ON secure_file_access_logs(accessed_at);
      `);
      
      console.log('✅ Created secure_file_access_logs table');
    } else {
      console.log('✅ secure_file_access_logs table exists');
    }
    
    console.log('🎉 Simple migration completed successfully!');
    
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