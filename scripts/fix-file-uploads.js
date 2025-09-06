#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const uploadEndpoints = [
  'app/api/admin/upload-cover/route.ts',
  'app/api/admin/upload-image/route.ts', 
  'app/api/admin/upload-team-image/route.ts'
];

const secureUploadCode = `
import { validateFilePath, sanitizeInput } from '@/lib/security';
import { requireAdmin } from '@/middleware/auth';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function validateFile(file, filename) {
  if (!file || file.size > MAX_FILE_SIZE) {
    throw new Error('File too large');
  }
  
  const ext = path.extname(filename).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error('Invalid file type');
  }
  
  return true;
}`;

uploadEndpoints.forEach(endpoint => {
  const filePath = path.join(__dirname, '..', endpoint);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add security imports and validation
    if (!content.includes('validateFilePath')) {
      content = secureUploadCode + '\n' + content;
      
      // Add file validation before processing
      content = content.replace(
        /const formData = await request\.formData\(\);/g,
        `const formData = await request.formData();
        const file = formData.get('file');
        const filename = sanitizeInput(formData.get('filename') || file.name);
        validateFile(file, filename);
        const safePath = validateFilePath(filename, 'public/uploads');`
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`Secured: ${endpoint}`);
    }
  }
});

console.log('File upload security patches applied!');