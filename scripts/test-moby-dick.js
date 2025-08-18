const path = require('path');
const fs = require('fs');

async function testMobyDick() {
  try {
    console.log('🐋 Testing Moby Dick EPUB parsing...');
    
    const epub = require('epub-parser');
    const filePath = path.join(__dirname, '../book-files/1755350242624_tkpbc9el3se_moby-dick.epub');
    
    console.log(`📖 Parsing file: ${filePath}`);
    console.log(`📊 File size: ${(fs.statSync(filePath).size / 1024 / 1024).toFixed(2)} MB`);
    
    return new Promise((resolve, reject) => {
      epub.open(filePath, (err, book) => {
        if (err) {
          console.error('❌ Error opening EPUB:', err);
          reject(err);
          return;
        }

        console.log('✅ EPUB opened successfully!');
        console.log('\n📚 Book Metadata:');
        console.log(`   Title: ${book.metadata.title || 'Unknown'}`);
        console.log(`   Author: ${book.metadata.creator || 'Unknown'}`);
        console.log(`   Language: ${book.metadata.language || 'Unknown'}`);
        console.log(`   Publisher: ${book.metadata.publisher || 'Unknown'}`);
        console.log(`   Total chapters: ${book.flow.length}`);
        
        console.log('\n📖 Chapter List:');
        book.flow.forEach((chapter, index) => {
          console.log(`   ${index + 1}. ${chapter.id} (${chapter.href})`);
        });
        
        // Test reading the first few chapters
        console.log('\n📖 Testing chapter content extraction...');
        let chaptersRead = 0;
        const maxChapters = Math.min(3, book.flow.length); // Test first 3 chapters
        
        book.flow.slice(0, maxChapters).forEach((chapter, index) => {
          book.getChapterRaw(chapter.id, (err, content) => {
            if (err) {
              console.error(`❌ Error reading chapter ${chapter.id}:`, err);
            } else {
              chaptersRead++;
              const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
              console.log(`   ✅ Chapter ${index + 1} (${chapter.id}): ${wordCount} words`);
              console.log(`      Preview: ${content.substring(0, 200).replace(/\n/g, ' ')}...`);
            }
            
            if (chaptersRead === maxChapters) {
              console.log('\n🎉 Moby Dick EPUB parsing test completed successfully!');
              console.log(`📊 Summary: ${book.flow.length} total chapters available for reading`);
              resolve();
            }
          });
        });
        
        if (book.flow.length === 0) {
          console.log('⚠️ No chapters found in the EPUB file');
          resolve();
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMobyDick().then(() => {
  console.log('\n✅ Moby Dick test completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 