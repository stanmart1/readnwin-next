#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Common unused variable patterns to fix
const fixes = [
  // Remove unused imports
  { pattern: /import\s+{\s*([^}]*,\s*)?(\w+)(\s*,\s*[^}]*)?\s*}\s+from\s+['"][^'"]+['"];?\s*\n/g, replacement: (match, before, unused, after, offset, string) => {
    // This is a simplified approach - in practice, you'd need more sophisticated parsing
    return '';
  }},
  
  // Remove unused const declarations
  { pattern: /^\s*const\s+(\w+)\s*=\s*[^;]+;?\s*$/gm, replacement: '' },
  
  // Remove unused let declarations
  { pattern: /^\s*let\s+(\w+)\s*=\s*[^;]+;?\s*$/gm, replacement: '' },
  
  // Remove unused function parameters (simplified)
  { pattern: /\(\s*(\w+)\s*:\s*[^,)]+\s*,?\s*\)/g, replacement: '()' }
];

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Apply specific fixes based on the build output
    const specificFixes = [
      // Remove unused session variables
      { from: /const\s+{\s*data:\s*session\s*}\s*=\s*useSession\(\);?\s*\n/g, to: '' },
      { from: /const\s+session\s*=\s*[^;]+;?\s*\n/g, to: '' },
      
      // Remove unused error variables in catch blocks
      { from: /catch\s*\(\s*error\s*\)\s*{/g, to: 'catch {' },
      
      // Remove unused imports
      { from: /import\s+{\s*[^}]*useState[^}]*}\s+from\s+['"]react['"];?\s*\n/g, to: (match) => {
        if (content.includes('useState(')) return match;
        return match.replace('useState', '').replace(/,\s*,/g, ',').replace(/{\s*,/g, '{').replace(/,\s*}/g, '}');
      }},
      
      { from: /import\s+{\s*[^}]*useEffect[^}]*}\s+from\s+['"]react['"];?\s*\n/g, to: (match) => {
        if (content.includes('useEffect(')) return match;
        return match.replace('useEffect', '').replace(/,\s*,/g, ',').replace(/{\s*,/g, '{').replace(/,\s*}/g, '}');
      }},
      
      // Remove unused variables from destructuring
      { from: /const\s*{\s*([^}]*),\s*(\w+)\s*}\s*=/g, to: (match, before, unused) => {
        if (content.includes(unused)) return match;
        return `const { ${before} } =`;
      }}
    ];
    
    specificFixes.forEach(fix => {
      const newContent = content.replace(fix.from, fix.to);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDirectory(filePath);
    } else if (stat.isFile()) {
      processFile(filePath);
    }
  });
}

// Start processing from app directory
const appDir = path.join(__dirname, 'app');
const componentsDir = path.join(__dirname, 'components');
const hooksDir = path.join(__dirname, 'hooks');
const libDir = path.join(__dirname, 'lib');

console.log('Fixing unused variables...');

if (fs.existsSync(appDir)) walkDirectory(appDir);
if (fs.existsSync(componentsDir)) walkDirectory(componentsDir);
if (fs.existsSync(hooksDir)) walkDirectory(hooksDir);
if (fs.existsSync(libDir)) walkDirectory(libDir);

console.log('Done!');