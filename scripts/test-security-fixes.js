const { SecurityUtils } = require('../utils/security-utils');

console.log('Testing security fixes...');

// Test filename sanitization
console.log('Filename sanitization:');
console.log('  ../../../etc/passwd ->', SecurityUtils.sanitizeFilename('../../../etc/passwd'));
console.log('  normal-file.txt ->', SecurityUtils.sanitizeFilename('normal-file.txt'));

// Test path sanitization
console.log('\nPath sanitization:');
console.log('  ../../../etc ->', SecurityUtils.sanitizePath('../../../etc'));
console.log('  normal/path ->', SecurityUtils.sanitizePath('normal/path'));

// Test log sanitization
console.log('\nLog sanitization:');
console.log('  Line\\nbreak\\ttab ->', SecurityUtils.sanitizeForLog('Line\nbreak\ttab'));

// Test HTML sanitization
console.log('\nHTML sanitization:');
console.log('  <script>alert("xss")</script> ->', SecurityUtils.sanitizeHtml('<script>alert("xss")</script>'));

// Test path safety
console.log('\nPath safety:');
const safePath = '/tmp/safe/file.txt';
const unsafePath = '/tmp/../../../etc/passwd';
console.log('  Safe path:', SecurityUtils.isPathSafe(safePath, '/tmp'));
console.log('  Unsafe path:', SecurityUtils.isPathSafe(unsafePath, '/tmp'));

console.log('\nAll security tests completed!');