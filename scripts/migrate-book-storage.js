#!/usr/bin/env node

/**
 * Book Storage Migration Script
 * 
 * This script migrates existing book files from the old storage structure
 * to the new /app/media_root/books/[bookId]/ structure.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  oldBookFilesDir: path.join(process.cwd(), 'book-files'),
  newMediaRootDir: path.join(process.cwd(), 'media_root'),
  newBooksDir: path.join(process.cwd(), 'media_root', 'books'),
  oldCoversDir: path.join(process.cwd(), 'public', 'uploads', 'covers'),
  newCoversDir: path.join(process.cwd(), 'media_root', 'public', 'uploads', 'covers')
};

console.log('🚀 Starting Book Storage Migration...');
console.log('📁 Configuration:', {
  oldBookFilesDir: config.oldBookFilesDir,
  newMediaRootDir: config.newMediaRootDir,
  newBooksDir: config.newBooksDir,
  oldCoversDir: config.oldCoversDir,
  newCoversDir: config.newCoversDir
});

// Create new directory structure
function createDirectories() {
  console.log('\n📁 Creating new directory structure...');
  
  const directories = [
    config.newMediaRootDir,
    config.newBooksDir,
    config.newCoversDir,
    path.join(config.newMediaRootDir, 'public', 'uploads'),
    path.join(config.newBooksDir, 'temp')
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created: ${dir}`);
    } else {
      console.log(`📁 Exists: ${dir}`);
    }
  });
}

// Get database connection (you'll need to implement this based on your setup)
async function getDatabaseConnection() {
  // This is a placeholder - implement based on your database setup
  // You might want to use the same connection logic as your main app
  console.log('⚠️ Database connection not implemented in migration script');
  console.log('⚠️ Please implement database queries manually or use your app\'s database utilities');
  return null;
}

// Get books from database
async function getBooksFromDatabase() {
  console.log('\n📚 Fetching books from database...');
  
  // This is a placeholder - you'll need to implement the actual database query
  // Example query:
  // SELECT id, title, ebook_file_url, cover_image_url FROM books WHERE ebook_file_url IS NOT NULL
  
  console.log('⚠️ Database query not implemented in migration script');
  console.log('⚠️ Please run this query manually:');
  console.log('   SELECT id, title, ebook_file_url, cover_image_url FROM books WHERE ebook_file_url IS NOT NULL');
  
  // Return sample data for demonstration
  return [
    {
      id: 111,
      title: 'Sample Book',
      ebook_file_url: '/book-files/1755466131000_a2y9wzz1bht_moby-dick.epub',
      cover_image_url: '/uploads/covers/sample-cover.jpg'
    }
  ];
}

// Migrate a single book
function migrateBook(book) {
  console.log(`\n📖 Migrating book: ${book.title} (ID: ${book.id})`);
  
  // Create book-specific directory
  const bookDir = path.join(config.newBooksDir, book.id.toString());
  if (!fs.existsSync(bookDir)) {
    fs.mkdirSync(bookDir, { recursive: true });
    console.log(`✅ Created book directory: ${bookDir}`);
  }
  
  // Migrate ebook file
  if (book.ebook_file_url) {
    const oldEbookPath = path.join(process.cwd(), book.ebook_file_url.replace('/book-files/', ''));
    const filename = path.basename(oldEbookPath);
    const newEbookPath = path.join(bookDir, filename);
    
    console.log(`📄 Ebook file: ${oldEbookPath} -> ${newEbookPath}`);
    
    if (fs.existsSync(oldEbookPath)) {
      try {
        fs.copyFileSync(oldEbookPath, newEbookPath);
        console.log(`✅ Ebook file migrated successfully`);
        
        // Update the file URL for database update
        book.new_ebook_file_url = `/media_root/books/${book.id}/${filename}`;
      } catch (error) {
        console.error(`❌ Failed to migrate ebook file: ${error.message}`);
      }
    } else {
      console.log(`⚠️ Ebook file not found: ${oldEbookPath}`);
    }
  }
  
  // Migrate cover image
  if (book.cover_image_url) {
    const oldCoverPath = path.join(process.cwd(), book.cover_image_url.replace('/uploads/', ''));
    const filename = path.basename(oldCoverPath);
    const newCoverPath = path.join(config.newCoversDir, filename);
    
    console.log(`🖼️ Cover image: ${oldCoverPath} -> ${newCoverPath}`);
    
    if (fs.existsSync(oldCoverPath)) {
      try {
        fs.copyFileSync(oldCoverPath, newCoverPath);
        console.log(`✅ Cover image migrated successfully`);
        
        // Update the cover URL for database update
        book.new_cover_image_url = `/media_root/public/uploads/covers/${filename}`;
      } catch (error) {
        console.error(`❌ Failed to migrate cover image: ${error.message}`);
      }
    } else {
      console.log(`⚠️ Cover image not found: ${oldCoverPath}`);
    }
  }
  
  return book;
}

// Update database records
async function updateDatabaseRecords(migratedBooks) {
  console.log('\n💾 Updating database records...');
  
  // This is a placeholder - you'll need to implement the actual database updates
  console.log('⚠️ Database updates not implemented in migration script');
  console.log('⚠️ Please run these SQL updates manually:');
  
  migratedBooks.forEach(book => {
    if (book.new_ebook_file_url) {
      console.log(`   UPDATE books SET ebook_file_url = '${book.new_ebook_file_url}' WHERE id = ${book.id};`);
    }
    if (book.new_cover_image_url) {
      console.log(`   UPDATE books SET cover_image_url = '${book.new_cover_image_url}' WHERE id = ${book.id};`);
    }
  });
}

// Clean up old files (optional)
function cleanupOldFiles(migratedBooks) {
  console.log('\n🧹 Cleaning up old files...');
  
  const cleanup = process.argv.includes('--cleanup');
  if (!cleanup) {
    console.log('⚠️ Skipping cleanup (use --cleanup flag to remove old files)');
    return;
  }
  
  console.log('🗑️ Removing old files...');
  
  migratedBooks.forEach(book => {
    if (book.ebook_file_url) {
      const oldEbookPath = path.join(process.cwd(), book.ebook_file_url.replace('/book-files/', ''));
      if (fs.existsSync(oldEbookPath)) {
        try {
          fs.unlinkSync(oldEbookPath);
          console.log(`✅ Removed old ebook: ${oldEbookPath}`);
        } catch (error) {
          console.error(`❌ Failed to remove old ebook: ${error.message}`);
        }
      }
    }
    
    if (book.cover_image_url) {
      const oldCoverPath = path.join(process.cwd(), book.cover_image_url.replace('/uploads/', ''));
      if (fs.existsSync(oldCoverPath)) {
        try {
          fs.unlinkSync(oldCoverPath);
          console.log(`✅ Removed old cover: ${oldCoverPath}`);
        } catch (error) {
          console.error(`❌ Failed to remove old cover: ${error.message}`);
        }
      }
    }
  });
}

// Main migration function
async function runMigration() {
  try {
    // Step 1: Create new directory structure
    createDirectories();
    
    // Step 2: Get books from database
    const books = await getBooksFromDatabase();
    console.log(`📚 Found ${books.length} books to migrate`);
    
    // Step 3: Migrate each book
    const migratedBooks = [];
    for (const book of books) {
      const migratedBook = migrateBook(book);
      migratedBooks.push(migratedBook);
    }
    
    // Step 4: Update database records
    await updateDatabaseRecords(migratedBooks);
    
    // Step 5: Clean up old files (optional)
    cleanupOldFiles(migratedBooks);
    
    console.log('\n🎉 Migration completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Books processed: ${books.length}`);
    console.log(`   - New storage location: ${config.newBooksDir}`);
    console.log(`   - New covers location: ${config.newCoversDir}`);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = {
  runMigration,
  config
};
