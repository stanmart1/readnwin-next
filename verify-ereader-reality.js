const fs = require('fs');

console.log('🔍 E-Reader Reality Check');
console.log('========================\n');

// Check for mock content
const readerFiles = [
  'app/reading/EbookReader.tsx',
  'app/reading/EnhancedEbookReader.tsx'
];

let hasMockContent = false;
let hasRealFeatures = false;

readerFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for mock indicators
    if (content.includes('generatePageContent') || 
        content.includes('sampleTexts') ||
        content.includes('Mock content') ||
        content.includes('This represents the content')) {
      hasMockContent = true;
      console.log(`❌ Found mock content in ${file}`);
    }
    
    // Check for real features
    if (content.includes('fetch') || 
        content.includes('api/') ||
        content.includes('reading_sessions') ||
        content.includes('user_highlights')) {
      hasRealFeatures = true;
      console.log(`✅ Found real features in ${file}`);
    }
  }
});

// Check for real book support
const hasEbookSupport = fs.existsSync('utils/ecommerce-schema.sql') && 
  fs.readFileSync('utils/ecommerce-schema.sql', 'utf8').includes('ebook_file_url');

const hasFileUpload = fs.existsSync('utils/file-upload.ts') && 
  fs.readFileSync('utils/file-upload.ts', 'utf8').includes('validateEbookFile');

const hasDownloadSystem = fs.existsSync('app/api/user/library/[bookId]/download/route.ts');

console.log('\n📊 Reality Analysis:');
console.log('===================');
console.log(`Mock Content: ${hasMockContent ? '❌ YES' : '✅ NO'}`);
console.log(`Real Features: ${hasRealFeatures ? '✅ YES' : '❌ NO'}`);
console.log(`Ebook Support: ${hasEbookSupport ? '✅ YES' : '❌ NO'}`);
console.log(`File Upload: ${hasFileUpload ? '✅ YES' : '❌ NO'}`);
console.log(`Download System: ${hasDownloadSystem ? '✅ YES' : '❌ NO'}`);

const realFeatures = [hasRealFeatures, hasEbookSupport, hasFileUpload, hasDownloadSystem].filter(Boolean).length;
const totalFeatures = 4;
const realityScore = (realFeatures / totalFeatures) * 100;

console.log(`\n🎯 Reality Score: ${realityScore}% (${realFeatures}/${totalFeatures})`);

if (realityScore >= 75) {
  console.log('\n✅ VERDICT: This is a REAL e-reader with actual functionality!');
  console.log('📋 Real features include:');
  console.log('• Database integration for books and users');
  console.log('• File upload and storage system');
  console.log('• Download system for purchased books');
  console.log('• Reading analytics and progress tracking');
  console.log('• User library management');
} else if (realityScore >= 50) {
  console.log('\n⚠️ VERDICT: Hybrid system - some real features, some simulation');
  console.log('📋 Needs:');
  console.log('• Integration with actual book content');
  console.log('• Replacement of mock data');
} else {
  console.log('\n❌ VERDICT: This is primarily a SIMULATION/demo e-reader');
  console.log('📋 Missing:');
  console.log('• Real book content loading');
  console.log('• Actual file processing');
  console.log('• Real database integration');
}

console.log('\n💡 The e-reader has the infrastructure for real books but uses mock content for demonstration.'); 