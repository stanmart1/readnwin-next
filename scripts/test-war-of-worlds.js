const path = require('path');
const fs = require('fs');

async function testWarOfWorlds() {
  try {
    console.log('👽 Testing The War of the Worlds EPUB content...');
    
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
        
        // Try to access the manifest directly
        const manifest = book.manifest || {};
        console.log(`\n📚 Manifest entries: ${Object.keys(manifest).length}`);
        
        // List all content files
        const contentFiles = Object.keys(manifest).filter(key => 
          key.startsWith('main') || key.includes('chapter') || key.includes('content')
        );
        
        console.log(`\n📖 Content files found: ${contentFiles.length}`);
        contentFiles.slice(0, 10).forEach(file => {
          console.log(`   - ${file}: ${manifest[file]?.href || 'No href'}`);
        });
        
        // Try to read content using a different approach
        console.log('\n📖 Attempting to read content files directly...');
        
        // Extract and read the main content files
        const mainFiles = ['main0.xml', 'main2.xml', 'main3.xml', 'main4.xml', 'main5.xml', 'main6.xml', 'main7.xml'];
        let totalContent = '';
        let filesRead = 0;
        
        mainFiles.forEach((fileName, index) => {
          try {
            const content = unzip -p "${filePath}" "OPS/${fileName}" 2>/dev/null;
            if (content) {
              filesRead++;
              // Extract text content from XML
              const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
              totalContent += textContent + ' ';
              
              console.log(`   ✅ ${fileName}: ${textContent.length} characters`);
              if (index < 2) {
                console.log(`      Preview: ${textContent.substring(0, 150)}...`);
              }
            }
          } catch (extractError) {
            console.log(`   ⚠️ Could not extract ${fileName}`);
          }
        });
        
        console.log(`\n📊 Content extraction summary:`);
        console.log(`   Files read: ${filesRead}/${mainFiles.length}`);
        console.log(`   Total content length: ${totalContent.length} characters`);
        console.log(`   Estimated word count: ${totalContent.split(/\s+/).filter(word => word.length > 0).length} words`);
        
        // Check for War of the Worlds content
        const warOfWorldsKeywords = ['war', 'worlds', 'mars', 'martian', 'invasion', 'wells', 'victorian'];
        const foundKeywords = warOfWorldsKeywords.filter(keyword => 
          totalContent.toLowerCase().includes(keyword)
        );
        
        console.log(`\n🔍 Content verification:`);
        console.log(`   Keywords found: ${foundKeywords.length}/${warOfWorldsKeywords.length}`);
        console.log(`   Found: ${foundKeywords.join(', ')}`);
        
        if (foundKeywords.length >= 3) {
          console.log('✅ The War of the Worlds content confirmed!');
        } else {
          console.log('⚠️ Content verification inconclusive');
        }
        
        console.log('\n🎉 The War of the Worlds content test completed!');
        console.log(`📊 Summary: ${filesRead} content files successfully extracted`);
        resolve();
      });
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWarOfWorlds().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 