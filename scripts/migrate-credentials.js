#!/usr/bin/env node
// Safe migration script to remove hardcoded credentials

const fs = require('fs');
const path = require('path');

const HARDCODED_PATTERNS = [
  /password:\s*process\.env\.[^|]*\|\|\s*['"][^'"]*['"]/g,
  /user:\s*process\.env\.[^|]*\|\|\s*['"][^'"]*['"]/g,
  /host:\s*process\.env\.[^|]*\|\|\s*['"][^'"]*['"]/g,
  /rejectUnauthorized:\s*false/g
];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    HARDCODED_PATTERNS.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          pattern: index,
          matches: matches.length,
          file: filePath
        });
      }
    });
    
    return issues;
  } catch (error) {
    return [];
  }
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let allIssues = [];
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      allIssues = allIssues.concat(scanDirectory(fullPath));
    } else if (file.name.endsWith('.js') || file.name.endsWith('.ts')) {
      const issues = scanFile(fullPath);
      allIssues = allIssues.concat(issues);
    }
  }
  
  return allIssues;
}

console.log('🔍 Scanning for hardcoded credentials...');
const issues = scanDirectory(path.join(__dirname, '..'));

if (issues.length > 0) {
  console.log(`⚠️ Found ${issues.length} potential credential issues:`);
  issues.forEach(issue => {
    console.log(`  - ${issue.file}: ${issue.matches} matches`);
  });
  console.log('\n📋 Next steps:');
  console.log('1. Set proper environment variables');
  console.log('2. Update database configuration');
  console.log('3. Test with development environment');
} else {
  console.log('✅ No hardcoded credentials found');
}