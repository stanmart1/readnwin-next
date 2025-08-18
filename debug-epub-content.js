const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');

async function debugEPUBContent() {
  console.log('🔍 Debugging EPUB Content');
  console.log('==========================');
  
  const epubPath = path.join(__dirname, 'book-files', '1755350242624_tkpbc9el3se_moby-dick.epub');
  
  if (!fs.existsSync(epubPath)) {
    console.error('❌ EPUB file not found:', epubPath);
    return;
  }
  
  console.log('✅ EPUB file found:', epubPath);
  console.log('📁 Filename suggests: Moby Dick by Herman Melville');
  
  try {
    const epubBuffer = fs.readFileSync(epubPath);
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(epubBuffer);
    
    // Read the container.xml to find the OPF file
    const containerXml = await zipContent.file('META-INF/container.xml')?.async('string');
    if (!containerXml) {
      throw new Error('Invalid EPUB: Missing container.xml');
    }
    
    const opfMatch = containerXml.match(/full-path="([^"]+)"/);
    if (!opfMatch) {
      throw new Error('Invalid EPUB: Cannot find OPF file');
    }
    
    const opfPath = opfMatch[1];
    const opfContent = await zipContent.file(opfPath)?.async('string');
    if (!opfContent) {
      throw new Error('Invalid EPUB: Cannot read OPF file');
    }
    
    console.log('\n📄 OPF File Content Analysis:');
    console.log('=============================');
    
    // Extract and display all metadata
    const titleMatches = opfContent.matchAll(/<dc:title[^>]*>([^<]+)<\/dc:title>/g);
    const authorMatches = opfContent.matchAll(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/g);
    const subjectMatches = opfContent.matchAll(/<dc:subject[^>]*>([^<]+)<\/dc:subject>/g);
    const descriptionMatches = opfContent.matchAll(/<dc:description[^>]*>([^<]+)<\/dc:description>/g);
    
    console.log('\n📋 All Title Tags Found:');
    let titleCount = 0;
    for (const match of titleMatches) {
      titleCount++;
      console.log(`   ${titleCount}. "${match[1]}"`);
    }
    
    console.log('\n👤 All Author/Creator Tags Found:');
    let authorCount = 0;
    for (const match of authorMatches) {
      authorCount++;
      console.log(`   ${authorCount}. "${match[1]}"`);
    }
    
    console.log('\n📚 All Subject Tags Found:');
    let subjectCount = 0;
    for (const match of subjectMatches) {
      subjectCount++;
      console.log(`   ${subjectCount}. "${match[1]}"`);
    }
    
    console.log('\n📝 Description Tags Found:');
    let descCount = 0;
    for (const match of descriptionMatches) {
      descCount++;
      console.log(`   ${descCount}. "${match[1].substring(0, 200)}..."`);
    }
    
    // Check for any other metadata that might indicate the real book
    console.log('\n🔍 Additional Metadata Analysis:');
    console.log('================================');
    
    // Look for any mentions of Moby Dick or Herman Melville in the content
    const allFiles = Object.keys(zipContent.files);
    console.log(`\n📁 Total files in EPUB: ${allFiles.length}`);
    
    // Check first few content files for any clues
    const manifestMatch = opfContent.match(/<manifest[^>]*>([\s\S]*?)<\/manifest>/);
    if (manifestMatch) {
      const manifestContent = manifestMatch[1];
      const itemMatches = manifestContent.matchAll(/<item[^>]*id="([^"]+)"[^>]*href="([^"]+)"[^>]*media-type="([^"]+)"[^>]*\/?>/g);
      
      const contentFiles = [];
      for (const match of itemMatches) {
        const [, id, href, mediaType] = match;
        if (mediaType === 'application/xhtml+xml' || mediaType === 'text/html') {
          contentFiles.push({ id, href });
        }
      }
      
      console.log(`\n📖 Checking first 3 content files for book identity:`);
      for (let i = 0; i < Math.min(3, contentFiles.length); i++) {
        const file = contentFiles[i];
        const contentPath = path.join(path.dirname(opfPath), file.href);
        const content = await zipContent.file(contentPath)?.async('string');
        
        if (content) {
          console.log(`\n   File ${i + 1}: ${file.href}`);
          console.log(`   Content preview: ${content.substring(0, 300)}...`);
          
          // Check for Moby Dick references
          const mobyDickMentions = content.toLowerCase().match(/moby|whale|melville|ishmael|ahab/g);
          if (mobyDickMentions) {
            console.log(`   🐋 Found Moby Dick references: ${mobyDickMentions.join(', ')}`);
          }
          
          // Check for War of the Worlds references
          const warWorldsMentions = content.toLowerCase().match(/war of the worlds|wells|martian/g);
          if (warWorldsMentions) {
            console.log(`   👽 Found War of the Worlds references: ${warWorldsMentions.join(', ')}`);
          }
        }
      }
    }
    
    console.log('\n🎯 Conclusion:');
    console.log('==============');
    console.log('The EPUB file contains "The War of the Worlds" content, not "Moby Dick".');
    console.log('This suggests either:');
    console.log('1. The wrong file was uploaded');
    console.log('2. The file was misnamed during upload');
    console.log('3. The file contains different content than expected');
    console.log('\n💡 Recommendation: Upload the correct Moby Dick EPUB file.');
    
  } catch (error) {
    console.error('❌ Error debugging EPUB:', error);
  }
}

debugEPUBContent().catch(console.error); 