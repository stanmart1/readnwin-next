#!/usr/bin/env node
// Fix dynamic rendering for all admin API routes

const fs = require('fs');
const path = require('path');

const ADMIN_API_DIR = path.join(__dirname, '..', 'app', 'api', 'admin');

function addDynamicExport(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has dynamic export
    if (content.includes('export const dynamic')) {
      return false;
    }
    
    // Find the first import statement
    const lines = content.split('\n');
    let insertIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        insertIndex = i;
        break;
      }
    }
    
    // Find the end of imports
    for (let i = insertIndex; i < lines.length; i++) {
      if (!lines[i].startsWith('import ') && !lines[i].startsWith('//') && lines[i].trim() !== '') {
        insertIndex = i;
        break;
      }
    }
    
    // Insert dynamic export
    lines.splice(insertIndex, 0, '', '// Force dynamic rendering', 'export const dynamic = \'force-dynamic\';');
    
    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let processed = 0;
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      processed += processDirectory(fullPath);
    } else if (file.name === 'route.ts' || file.name === 'route.js') {
      if (addDynamicExport(fullPath)) {
        console.log(`✅ Fixed: ${fullPath}`);
        processed++;
      } else {
        console.log(`⏭️ Skipped: ${fullPath}`);
      }
    }
  }
  
  return processed;
}

console.log('🔧 Fixing dynamic rendering for admin API routes...');
const processed = processDirectory(ADMIN_API_DIR);
console.log(`✅ Processed ${processed} files`);