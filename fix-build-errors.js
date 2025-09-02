#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Only fix specific unused variables that are safe to remove
function fixFile(filePath, content) {
  let modified = false;
  let newContent = content;

  // Safe fixes that won't break functionality
  const safeFixes = [
    // Remove unused error variables in catch blocks where error is not used
    {
      pattern: /catch\s*\(\s*error\s*\)\s*{\s*console\.error/g,
      replacement: 'catch (error) {\n        console.error'
    },
    
    // Remove unused destructured variables that are clearly not used
    {
      pattern: /const\s*{\s*([^}]*),\s*setIsLoading\s*}\s*=\s*useState/g,
      replacement: (match, before) => {
        if (!content.includes('setIsLoading(')) {
          return `const { ${before} } = useState`;
        }
        return match;
      }
    },
    
    // Remove unused imports only if they're definitely not used
    {
      pattern: /,\s*useState\s*(?=})/g,
      replacement: (match) => {
        if (!content.includes('useState(')) {
          return '';
        }
        return match;
      }
    },
    
    {
      pattern: /,\s*useEffect\s*(?=})/g,
      replacement: (match) => {
        if (!content.includes('useEffect(')) {
          return '';
        }
        return match;
      }
    }
  ];

  safeFixes.forEach(fix => {
    const result = newContent.replace(fix.pattern, fix.replacement);
    if (result !== newContent) {
      newContent = result;
      modified = true;
    }
  });

  return { content: newContent, modified };
}

// Process only the file that's causing the build error
const problemFile = path.join(__dirname, 'app/admin/BookManagementEnhanced.tsx');

if (fs.existsSync(problemFile)) {
  const content = fs.readFileSync(problemFile, 'utf8');
  const result = fixFile(problemFile, content);
  
  if (result.modified) {
    fs.writeFileSync(problemFile, result.content);
    console.log(`Fixed: ${problemFile}`);
  }
}

console.log('Build error fix complete');