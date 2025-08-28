#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function setupProductionStorage() {
  console.log('🚀 Setting up production storage...');
  
  // Only run in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('ℹ️ Not in production, skipping setup');
    return;
  }
  
  // Required directories in persistent storage
  const requiredDirs = [
    '/app/storage',
    '/app/storage/uploads',
    '/app/storage/uploads/covers',
    '/app/storage/uploads/books',
    '/app/storage/uploads/works',
    '/app/storage/books',
    '/app/storage/temp'
  ];
  
  // Create all required directories
  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      } catch (error) {
        console.error(`❌ Failed to create directory ${dir}:`, error.message);
      }
    } else {
      console.log(`✅ Directory exists: ${dir}`);
    }
  }
  
  // Set proper permissions (if running as root)
  try {
    const { execSync } = require('child_process');
    execSync('chown -R pptruser:pptruser /app/storage', { stdio: 'inherit' });
    console.log('🔒 Set proper permissions on storage directory');
  } catch (error) {
    console.log('⚠️ Could not set permissions (may not be running as root)');
  }
  
  console.log('✅ Production storage setup complete!');
}

// Run setup
setupProductionStorage().catch(console.error);