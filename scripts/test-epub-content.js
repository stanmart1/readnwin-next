const path = require('path');
const fs = require('fs');

async function testEPUBContent() {
  try {
    console.log('🐋 Testing EPUB content extraction...');
    
    const epub = require('epub-parser');
    const filePath = path.join(__dirname, '../book-files/1755350242624_tkpbc9el3se_moby-dick.epub');
    
    console.log(`📖 File: ${filePath}`);
    console.log(`📊 Size: ${(fs.statSync(filePath).size / 1024 / 1024).toFixed(2)} MB`);
    
    return new Promise((resolve, reject) => {
      epub.open(filePath, (err, book) => {
        if (err) {
          console.error('❌ Error opening EPUB:', err.message);
          reject(err);
          return;
        }

        console.log('✅ EPUB opened successfully!');
        
        // Safely access metadata
        const metadata = book.metadata || {};
        console.log('\n📚 Metadata:');
        console.log(`   Title: ${metadata.title || 'Unknown'}`);
        console.log(`   Creator: ${metadata.creator || 'Unknown'}`);
        console.log(`   Language: ${metadata.language || 'Unknown'}`);
        console.log(`   Publisher: ${metadata.publisher || 'Unknown'}`);
        
        // Check flow (chapters)
        const flow = book.flow || [];
        console.log(`\n📖 Total chapters: ${flow.length}`);
        
        if (flow.length === 0) {
          console.log('⚠️ No chapters found');
          resolve();
          return;
        }
        
        // List first few chapters
        console.log('\n📖 Chapter list (first 5):');
        flow.slice(0, 5).forEach((chapter, index) => {
          console.log(`   ${index + 1}. ${chapter.id || 'Unknown'} (${chapter.href || 'No href'})`);
        });
        
        // Test reading first chapter
        console.log('\n📖 Testing first chapter...');
        const firstChapter = flow[0];
        
        book.getChapterRaw(firstChapter.id, (err, content) => {
          if (err) {
            console.error(`❌ Error reading chapter: ${err.message}`);
            resolve();
            return;
          }
          
          const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
          console.log(`✅ First chapter read successfully!`);
          console.log(`   Chapter ID: ${firstChapter.id}`);
          console.log(`   Word count: ${wordCount}`);
          console.log(`   Content preview: ${content.substring(0, 200).replace(/\n/g, ' ')}...`);
          
          // Check for Moby Dick content
          if (content.toLowerCase().includes('moby') || content.toLowerCase().includes('whale') || content.toLowerCase().includes('ishmael')) {
            console.log('✅ Moby Dick content detected!');
          } else {
            console.log('⚠️ Moby Dick content not clearly detected');
          }
          
          console.log('\n🎉 EPUB content test completed successfully!');
          console.log(`📊 Summary: ${flow.length} chapters available for reading`);
          resolve();
        });
      });
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEPUBContent().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 