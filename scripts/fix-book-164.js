// Quick fix for book 164 file path issue
const fs = require('fs');
const path = require('path');

console.log('🔧 Checking Book 164 File Issue...\n');

// Check what Moby Dick files exist
const storageDir = path.join(process.cwd(), 'storage', 'ebooks');
console.log('📁 Available ebook files:');
if (fs.existsSync(storageDir)) {
  const files = fs.readdirSync(storageDir);
  files.forEach(file => {
    console.log(`  - ${file}`);
  });
  
  // Find Moby Dick files
  const mobyFiles = files.filter(f => f.toLowerCase().includes('moby'));
  console.log('\n📚 Moby Dick files found:');
  mobyFiles.forEach(file => {
    console.log(`  - ${file}`);
  });
  
  if (mobyFiles.length > 0) {
    console.log('\n💡 Suggested fix:');
    console.log('Update the database record for book 164 to point to one of these files:');
    mobyFiles.forEach(file => {
      console.log(`  UPDATE books SET ebook_file_url = '/api/ebooks/164/${file}' WHERE id = 164;`);
    });
  }
} else {
  console.log('❌ Storage/ebooks directory not found');
}

console.log('\n🔍 To fix this issue:');
console.log('1. Check which Moby Dick file should be used for book 164');
console.log('2. Update the database ebook_file_url field');
console.log('3. Or copy/rename the file to match book 164');