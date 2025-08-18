const fs = require('fs');

// Read the email utility file
const emailUtilPath = './utils/email.ts';
let content = fs.readFileSync(emailUtilPath, 'utf8');

// Replace all instances of the old SMTP transporter creation with the helper function
const oldPattern = /const transporter = nodemailer\.createTransport\(\{\s*host: gatewayConfig\.smtpHost,\s*port: gatewayConfig\.smtpPort,\s*secure: gatewayConfig\.smtpSecure,\s*auth: \{\s*user: gatewayConfig\.smtpUsername,\s*pass: gatewayConfig\.smtpPassword,\s*\},\s*\}\);/g;

const newPattern = 'const transporter = createSMTPTransporter(gatewayConfig);';

content = content.replace(oldPattern, newPattern);

// Write the updated content back
fs.writeFileSync(emailUtilPath, content);

console.log('✅ Updated all SMTP transporter creation calls to use the helper function'); 