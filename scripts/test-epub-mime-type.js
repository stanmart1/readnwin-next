console.log('🧪 Testing EPUB MIME Type Detection');
console.log('=' .repeat(60));

// Common MIME types for EPUB files
const epubMimeTypes = [
  'application/epub+zip',
  'application/epub',
  'application/x-epub',
  'application/octet-stream', // Some browsers use this for EPUB
  'application/zip', // EPUB is essentially a ZIP file
  'application/x-zip-compressed'
];

console.log('📋 Known EPUB MIME Types:');
epubMimeTypes.forEach(type => {
  console.log(`  - ${type}`);
});

// Test if our validation would accept these
const allowedTypes = ['application/epub+zip', 'application/pdf', 'application/x-mobipocket-ebook'];

console.log('\n📋 Current Allowed Types in Validation:');
allowedTypes.forEach(type => {
  console.log(`  - ${type}`);
});

console.log('\n🔍 MIME Type Compatibility Check:');
epubMimeTypes.forEach(type => {
  const isAllowed = allowedTypes.includes(type);
  console.log(`  ${isAllowed ? '✅' : '❌'} ${type} - ${isAllowed ? 'Allowed' : 'NOT Allowed'}`);
});

console.log('\n💡 Potential Issue:');
console.log('Some browsers may not correctly identify EPUB files as "application/epub+zip"');
console.log('They might use "application/octet-stream" or "application/zip" instead.');
console.log('This could cause the file validation to fail even for valid EPUB files.');

console.log('\n🔧 Recommended Fix:');
console.log('Add additional MIME types to the validation to handle browser inconsistencies:');
console.log('- application/epub');
console.log('- application/x-epub');
console.log('- application/octet-stream (with file extension check)');
console.log('- application/zip (with file extension check)'); 