#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Define storage directories
const directories = [
  'storage',
  'storage/books',
  'storage/books/temp',
  'public/uploads',
  'public/uploads/covers'
];

function createDirectories() {
  console.log('🚀 Setting up storage directories...');
  
  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    } else {
      console.log(`📁 Directory already exists: ${dir}`);
    }
  });
  
  // Create .gitkeep files to ensure directories are tracked
  const gitkeepDirs = ['storage/books', 'storage/books/temp'];
  gitkeepDirs.forEach(dir => {
    const gitkeepPath = path.join(process.cwd(), dir, '.gitkeep');
    if (!fs.existsSync(gitkeepPath)) {
      fs.writeFileSync(gitkeepPath, '');
      console.log(`📝 Created .gitkeep in: ${dir}`);
    }
  });
  
  console.log('🎉 Storage directories setup completed!');
}

createDirectories();