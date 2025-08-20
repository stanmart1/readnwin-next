#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get all component files
function getAllComponents() {
  const components = [];
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        // Get relative path from components directory
        const relativePath = path.relative('components', fullPath);
        const componentName = relativePath.replace(/\.(tsx|ts)$/, '');
        components.push({
          name: componentName,
          fullPath: fullPath,
          fileName: file.replace(/\.(tsx|ts)$/, '')
        });
      }
    }
  }
  
  scanDirectory('components');
  return components;
}

// Get all files that might import components
function getAllSourceFiles() {
  const sourceFiles = [];
  
  function scanDirectory(dir) {
    if (dir.includes('node_modules') || dir.includes('.next')) return;
    
    try {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDirectory(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
          sourceFiles.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  scanDirectory('app');
  scanDirectory('components');
  scanDirectory('lib');
  scanDirectory('utils');
  scanDirectory('hooks');
  scanDirectory('contexts');
  
  return sourceFiles;
}

// Check if a component is imported in any file
function isComponentUsed(componentName, sourceFiles) {
  const usages = [];
  
  for (const file of sourceFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for various import patterns
      const importPatterns = [
        new RegExp(`import\\s+${componentName.split('/').pop()}\\s+from\\s+['"]@?/?components/${componentName}['"]`, 'g'),
        new RegExp(`import\\s+{[^}]*${componentName.split('/').pop()}[^}]*}\\s+from\\s+['"]@?/?components`, 'g'),
        new RegExp(`from\\s+['"]@?/?components/${componentName}['"]`, 'g'),
        new RegExp(`'@?/?components/${componentName}'`, 'g'),
        new RegExp(`"@?/?components/${componentName}"`, 'g'),
        // Check for lazy imports
        new RegExp(`import\\s*\\(\\s*['"]@?/?components/${componentName}['"]\\s*\\)`, 'g'),
        // Check for dynamic imports
        new RegExp(`lazy\\s*\\(\\s*\\(\\s*\\)\\s*=>\\s*import\\s*\\(\\s*['"].*${componentName}['"]\\s*\\)`, 'g')
      ];
      
      for (const pattern of importPatterns) {
        if (pattern.test(content)) {
          usages.push({
            file: file,
            pattern: pattern.source
          });
        }
      }
    } catch (error) {
      // Skip files we can't read
    }
  }
  
  return usages;
}

// Main analysis
console.log('🔍 Analyzing component usage...\n');

const components = getAllComponents();
const sourceFiles = getAllSourceFiles();

console.log(`Found ${components.length} components`);
console.log(`Scanning ${sourceFiles.length} source files\n`);

const unusedComponents = [];
const usedComponents = [];

for (const component of components) {
  const usages = isComponentUsed(component.name, sourceFiles);
  
  if (usages.length === 0) {
    unusedComponents.push(component);
  } else {
    usedComponents.push({
      ...component,
      usages: usages
    });
  }
}

console.log('📊 ANALYSIS RESULTS\n');
console.log(`✅ Used components: ${usedComponents.length}`);
console.log(`❌ Unused components: ${unusedComponents.length}\n`);

if (unusedComponents.length > 0) {
  console.log('🗑️  UNUSED COMPONENTS (Safe to remove):\n');
  
  unusedComponents.forEach((component, index) => {
    console.log(`${index + 1}. ${component.name}`);
    console.log(`   Path: ${component.fullPath}`);
    console.log('');
  });
}

if (usedComponents.length > 0) {
  console.log('✅ USED COMPONENTS:\n');
  
  usedComponents.forEach((component, index) => {
    console.log(`${index + 1}. ${component.name} (${component.usages.length} usage${component.usages.length > 1 ? 's' : ''})`);
  });
}

// Generate removal script
if (unusedComponents.length > 0) {
  const removalScript = `#!/bin/bash
# Auto-generated script to remove unused components
# Review before running!

echo "🗑️  Removing unused components..."

${unusedComponents.map(comp => `echo "Removing ${comp.name}..."
rm "${comp.fullPath}"`).join('\n')}

echo "✅ Cleanup complete!"
`;

  fs.writeFileSync('remove-unused-components.sh', removalScript);
  console.log('\n📝 Generated removal script: remove-unused-components.sh');
  console.log('   Review the script before running: chmod +x remove-unused-components.sh && ./remove-unused-components.sh');
}