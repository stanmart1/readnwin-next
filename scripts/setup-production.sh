#!/bin/bash

# Production Setup Script for Book Upload System
echo "🚀 Setting up production environment for book upload system..."

# Create media_root directory structure
echo "📁 Creating media_root directory structure..."
mkdir -p /app/media_root/books/html
mkdir -p /app/media_root/books/originals
mkdir -p /app/media_root/books/assets/images
mkdir -p /app/media_root/books/assets/fonts
mkdir -p /app/media_root/temp

# Set proper permissions
echo "🔐 Setting proper permissions..."
chown -R node:node /app/media_root
chmod -R 755 /app/media_root
chmod -R 775 /app/media_root/temp

# Create book-files directory if it doesn't exist
echo "📚 Creating book-files directory..."
mkdir -p /app/book-files
chown -R node:node /app/book-files
chmod -R 755 /app/book-files

# Verify database connection
echo "🗄️ Testing database connection..."
node -e "
require('dotenv').config({ path: '.env.production' });
const { query } = require('../utils/database');
query('SELECT NOW() as current_time')
  .then(result => {
    console.log('✅ Database connection successful:', result.rows[0]);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  });
"

# Run database migrations
echo "🔄 Running database migrations..."
node -e "
require('dotenv').config({ path: '.env.production' });
const { query } = require('../utils/database');

async function runMigrations() {
  try {
    // Add html_file_path column
    await query('ALTER TABLE books ADD COLUMN IF NOT EXISTS html_file_path TEXT');
    console.log('✅ Added html_file_path column');
    
    // Add processing_status column
    await query('ALTER TABLE books ADD COLUMN IF NOT EXISTS processing_status VARCHAR(20) DEFAULT \'pending\'');
    console.log('✅ Added processing_status column');
    
    // Create indexes
    await query('CREATE INDEX IF NOT EXISTS idx_books_html_file_path ON books(html_file_path)');
    console.log('✅ Created html_file_path index');
    
    await query('CREATE INDEX IF NOT EXISTS idx_books_processing_status ON books(processing_status)');
    console.log('✅ Created processing_status index');
    
    console.log('🎉 All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
"

echo "✅ Production setup completed successfully!" 