const fs = require('fs');

// Read the email utility file
const emailUtilPath = './utils/email.ts';
let content = fs.readFileSync(emailUtilPath, 'utf8');

// Replace all instances of createTransporter with createTransport
content = content.replace(/createTransporter/g, 'createTransport');

// Write the fixed content back
fs.writeFileSync(emailUtilPath, content);

console.log('✅ Fixed all instances of createTransporter to createTransport in utils/email.ts'); 