const fs = require('fs');
const path = require('path');

// Get all TypeScript React files
function getAllTsxFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files = files.concat(getAllTsxFiles(fullPath));
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Fix common unused variables
function fixUnusedVariables(content) {
  let modified = false;
  
  // Remove common unused variable patterns
  const unusedPatterns = [
    /const\s+quillStyles\s*=\s*{[^}]*};\s*/g,
    /const\s+quillModules\s*=\s*{[^}]*};\s*/g,
    /const\s+quillFormats\s*=\s*\[[^\]]*\];\s*/g,
    /const\s+\w+\s*=\s*useSession\(\);\s*\/\/\s*unused/g,
    /const\s+isAdmin\s*=\s*[^;]+;\s*\/\/\s*unused/g,
  ];
  
  unusedPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      content = content.replace(pattern, '');
      modified = true;
    }
  });
  
  return { content, modified };
}

// Fix unused imports
function fixUnusedImports(content) {
  let modified = false;
  
  // Remove unused imports (be careful with this)
  const lines = content.split('\n');
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip lines that import unused items (be very selective)
    if (line.includes('import') && 
        (line.includes('EnhancedErrorDisplay') || 
         line.includes('Play') || 
         line.includes('Pause'))) {
      // Check if the imported item is actually used in the file
      const importMatch = line.match(/import\s*{\s*([^}]+)\s*}/);
      if (importMatch) {
        const imports = importMatch[1].split(',').map(s => s.trim());
        const usedImports = imports.filter(imp => {
          const regex = new RegExp(`\\b${imp}\\b`, 'g');
          const matches = content.match(regex);
          return matches && matches.length > 1; // More than just the import
        });
        
        if (usedImports.length === 0) {
          modified = true;
          continue; // Skip this line
        } else if (usedImports.length < imports.length) {
          newLines.push(line.replace(importMatch[1], usedImports.join(', ')));
          modified = true;
          continue;
        }
      }
    }
    
    newLines.push(line);
  }
  
  return { content: newLines.join('\n'), modified };
}

// Process each file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let totalModified = false;
    
    // Fix unused variables
    const { content: content1, modified: mod1 } = fixUnusedVariables(content);
    content = content1;
    totalModified = totalModified || mod1;
    
    // Fix unused imports
    const { content: content2, modified: mod2 } = fixUnusedImports(content);
    content = content2;
    totalModified = totalModified || mod2;
    
    if (totalModified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed warnings in: ${path.relative(process.cwd(), filePath)}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Main execution
console.log('🔧 Starting ESLint warnings fix...\n');

const files = getAllTsxFiles('./app').concat(getAllTsxFiles('./components'));
let processedCount = 0;

files.forEach(file => {
  processFile(file);
  processedCount++;
});

console.log(`\n🎉 Processed ${processedCount} files!`);
console.log('✨ ESLint warnings fix completed!');