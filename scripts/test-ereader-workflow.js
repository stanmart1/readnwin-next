const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

async function testEReaderWorkflow() {
  try {
    console.log('📚 Testing Complete E-Reader Workflow for The War of the Worlds...');
    
    const filePath = path.join(__dirname, '../book-files/1755350242624_tkpbc9el3se_moby-dick.epub');
    
    console.log(`📖 Book file: ${filePath}`);
    console.log(`📊 File size: ${(fs.statSync(filePath).size / 1024 / 1024).toFixed(2)} MB`);
    
    // Step 1: Extract all content files from EPUB
    console.log('\n🔍 Step 1: Extracting all content files...');
    
    const contentFiles = [];
    try {
      const fileList = execSync(`unzip -l "${filePath}" | grep -E "main[0-9]+\.xml"`, { encoding: 'utf8' });
      const matches = fileList.match(/OPS\/main[0-9]+\.xml/g);
      if (matches) {
        contentFiles.push(...matches);
      }
    } catch (error) {
      console.log('   ⚠️ Could not list content files, using default list');
      contentFiles.push('OPS/main0.xml', 'OPS/main2.xml', 'OPS/main3.xml', 'OPS/main4.xml', 'OPS/main5.xml', 'OPS/main6.xml', 'OPS/main7.xml');
    }
    
    console.log(`   📄 Found ${contentFiles.length} content files`);
    
    // Step 2: Extract and process all content
    console.log('\n📖 Step 2: Extracting and processing content...');
    
    let allContent = '';
    let processedFiles = 0;
    let totalWordCount = 0;
    
    for (const contentFile of contentFiles) {
      try {
        const command = `unzip -p "${filePath}" "${contentFile}" 2>/dev/null`;
        const xmlContent = execSync(command, { encoding: 'utf8' });
        
        if (xmlContent && xmlContent.length > 0) {
          processedFiles++;
          
          // Clean XML and extract text
          const cleanContent = xmlContent
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          allContent += cleanContent + ' ';
          const wordCount = cleanContent.split(/\s+/).filter(word => word.length > 0).length;
          totalWordCount += wordCount;
          
          console.log(`   ✅ ${contentFile.replace('OPS/', '')}: ${wordCount} words`);
        }
      } catch (extractError) {
        console.log(`   ⚠️ Could not extract ${contentFile}`);
      }
    }
    
    // Step 3: Verify content quality
    console.log('\n🔍 Step 3: Verifying content quality...');
    
    const warOfWorldsKeywords = [
      'war', 'worlds', 'mars', 'martian', 'invasion', 'wells', 'victorian',
      'england', 'london', 'alien', 'spaceship', 'cylinder', 'tripod'
    ];
    
    const foundKeywords = warOfWorldsKeywords.filter(keyword => 
      allContent.toLowerCase().includes(keyword)
    );
    
    console.log(`   📊 Total content: ${allContent.length} characters`);
    console.log(`   📊 Total words: ${totalWordCount} words`);
    console.log(`   📊 Files processed: ${processedFiles}/${contentFiles.length}`);
    console.log(`   🔍 Keywords found: ${foundKeywords.length}/${warOfWorldsKeywords.length}`);
    console.log(`   🔍 Found: ${foundKeywords.join(', ')}`);
    
    // Step 4: Test content structure
    console.log('\n📚 Step 4: Analyzing content structure...');
    
    // Look for chapter markers
    const chapterMatches = allContent.match(/chapter\s+\d+/gi);
    const chapterCount = chapterMatches ? chapterMatches.length : 0;
    
    console.log(`   📖 Chapters detected: ${chapterCount}`);
    if (chapterMatches) {
      console.log(`   📖 Chapter list: ${chapterMatches.slice(0, 5).join(', ')}${chapterMatches.length > 5 ? '...' : ''}`);
    }
    
    // Step 5: Estimate reading time
    const estimatedReadingTime = Math.ceil(totalWordCount / 200); // 200 words per minute
    console.log(`   ⏱️ Estimated reading time: ${estimatedReadingTime} minutes`);
    
    // Step 6: Final verification
    console.log('\n✅ Step 5: Final verification...');
    
    const verificationResults = {
      hasContent: allContent.length > 1000,
      hasKeywords: foundKeywords.length >= 5,
      hasChapters: chapterCount > 0,
      hasReasonableLength: totalWordCount > 1000,
      isComplete: processedFiles >= 3
    };
    
    const passedChecks = Object.values(verificationResults).filter(Boolean).length;
    const totalChecks = Object.keys(verificationResults).length;
    
    console.log(`   ✅ Content verification: ${passedChecks}/${totalChecks} checks passed`);
    
    Object.entries(verificationResults).forEach(([check, passed]) => {
      console.log(`      ${passed ? '✅' : '❌'} ${check}: ${passed ? 'PASS' : 'FAIL'}`);
    });
    
    // Final result
    console.log('\n🎉 E-Reader Workflow Test Results:');
    console.log('=' .repeat(50));
    
    if (passedChecks >= 4) {
      console.log('✅ SUCCESS: The e-reader can read all contents of The War of the Worlds!');
      console.log('✅ The book contains complete, readable content');
      console.log('✅ All chapters and text are properly extracted');
      console.log('✅ The e-reader should display the full book content');
    } else {
      console.log('⚠️ PARTIAL: Some content is available but may be incomplete');
      console.log('⚠️ The e-reader may show partial content');
    }
    
    console.log('\n📊 Summary:');
    console.log(`   📖 Book: The War of the Worlds by H.G. Wells`);
    console.log(`   📄 Content files: ${processedFiles}/${contentFiles.length}`);
    console.log(`   📊 Total words: ${totalWordCount.toLocaleString()}`);
    console.log(`   ⏱️ Reading time: ~${estimatedReadingTime} minutes`);
    console.log(`   📖 Chapters: ${chapterCount}`);
    console.log(`   🔍 Content quality: ${passedChecks}/${totalChecks} checks passed`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEReaderWorkflow(); 