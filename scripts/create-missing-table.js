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

async function createMissingTable() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Creating missing secure_file_access_logs table...');
    
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
    `);
    
    console.log('✅ Created secure_file_access_logs table');
    
    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_secure_file_access_user_id ON secure_file_access_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_secure_file_access_book_id ON secure_file_access_logs(book_id);
      CREATE INDEX IF NOT EXISTS idx_secure_file_access_status ON secure_file_access_logs(access_status);
      CREATE INDEX IF NOT EXISTS idx_secure_file_access_accessed_at ON secure_file_access_logs(accessed_at);
    `);
    
    console.log('✅ Created indexes for secure_file_access_logs');
    
    // Verify table was created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'secure_file_access_logs'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Table verification successful');
    } else {
      console.log('❌ Table verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error creating table:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createMissingTable()
  .then(() => {
    console.log('🎉 Table creation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Table creation failed:', error);
    process.exit(1);
  });