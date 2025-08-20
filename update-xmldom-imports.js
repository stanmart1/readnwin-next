const fs = require('fs');
const path = require('path');

// Files that need xmldom import updates
const filesToUpdate = [
  'lib/services/EpubProcessingService.ts',
  'lib/services/HtmlProcessingService.ts'
];

function updateXmldomImports() {
  console.log('🔄 Updating xmldom imports to @xmldom/xmldom...');
  
  filesToUpdate.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace xmldom imports with @xmldom/xmldom
      content = content.replace(
        /import\s+.*\s+from\s+['"]xmldom['"];?/g,
        "import { DOMParser } from '@xmldom/xmldom';"
      );
      
      // Replace require statements if any
      content = content.replace(
        /require\(['"]xmldom['"]\)/g,
        "require('@xmldom/xmldom')"
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated ${filePath}`);
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  });
  
  console.log('✅ xmldom import updates complete');
}

updateXmldomImports();