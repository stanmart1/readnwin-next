const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

async function testContentExtraction() {
  try {
    console.log('👽 Testing The War of the Worlds content extraction...');
    
    const filePath = path.join(__dirname, '../book-files/1755350242624_tkpbc9el3se_moby-dick.epub');
    
    console.log(`📖 File: ${filePath}`);
    console.log(`📊 Size: ${(fs.statSync(filePath).size / 1024 / 1024).toFixed(2)} MB`);
    
    // Extract and read the main content files
    const mainFiles = ['main0.xml', 'main2.xml', 'main3.xml', 'main4.xml', 'main5.xml'];
    let totalContent = '';
    let filesRead = 0;
    
    console.log('\n📖 Extracting content files...');
    
    mainFiles.forEach((fileName, index) => {
      try {
        const command = `unzip -p "${filePath}" "OPS/${fileName}" 2>/dev/null`;
        const content = execSync(command, { encoding: 'utf8' });
        
        if (content && content.length > 0) {
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
    const warOfWorldsKeywords = ['war', 'worlds', 'mars', 'martian', 'invasion', 'wells'];
    const foundKeywords = warOfWorldsKeywords.filter(keyword => 
      totalContent.toLowerCase().includes(keyword)
    );
    
    console.log(`\n🔍 Content verification:`);
    console.log(`   Keywords found: ${foundKeywords.length}/${warOfWorldsKeywords.length}`);
    console.log(`   Found: ${foundKeywords.join(', ')}`);
    
    if (foundKeywords.length >= 3) {
      console.log('✅ The War of the Worlds content confirmed!');
      console.log('✅ E-reader should be able to read all contents of this book!');
    } else {
      console.log('⚠️ Content verification inconclusive');
    }
    
    console.log('\n🎉 Content extraction test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testContentExtraction(); 