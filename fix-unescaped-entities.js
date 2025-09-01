const fs = require('fs');
const path = require('path');

// Files that need fixing based on build output
const filesToFix = [
  'app/faq/page.tsx',
  'app/payment/bank-transfer/success/page.tsx', 
  'app/privacy/page.tsx',
  'app/terms/page.tsx',
  'components/ui/DashboardErrorBoundary.tsx'
];

function fixUnescapedEntities(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Fix common contractions in JSX text content
    const fixes = [
      // Apostrophes in contractions
      { pattern: /Can't/g, replacement: "Can&apos;t" },
      { pattern: /don't/g, replacement: "don&apos;t" },
      { pattern: /won't/g, replacement: "won&apos;t" },
      { pattern: /isn't/g, replacement: "isn&apos;t" },
      { pattern: /aren't/g, replacement: "aren&apos;t" },
      { pattern: /wasn't/g, replacement: "wasn&apos;t" },
      { pattern: /weren't/g, replacement: "weren&apos;t" },
      { pattern: /haven't/g, replacement: "haven&apos;t" },
      { pattern: /hasn't/g, replacement: "hasn&apos;t" },
      { pattern: /hadn't/g, replacement: "hadn&apos;t" },
      { pattern: /shouldn't/g, replacement: "shouldn&apos;t" },
      { pattern: /wouldn't/g, replacement: "wouldn&apos;t" },
      { pattern: /couldn't/g, replacement: "couldn&apos;t" },
      { pattern: /mustn't/g, replacement: "mustn&apos;t" },
      { pattern: /needn't/g, replacement: "needn&apos;t" },
      { pattern: /daren't/g, replacement: "daren&apos;t" },
      { pattern: /you're/g, replacement: "you&apos;re" },
      { pattern: /we're/g, replacement: "we&apos;re" },
      { pattern: /they're/g, replacement: "they&apos;re" },
      { pattern: /I'm/g, replacement: "I&apos;m" },
      { pattern: /you'll/g, replacement: "you&apos;ll" },
      { pattern: /we'll/g, replacement: "we&apos;ll" },
      { pattern: /they'll/g, replacement: "they&apos;ll" },
      { pattern: /I'll/g, replacement: "I&apos;ll" },
      { pattern: /you've/g, replacement: "you&apos;ve" },
      { pattern: /we've/g, replacement: "we&apos;ve" },
      { pattern: /they've/g, replacement: "they&apos;ve" },
      { pattern: /I've/g, replacement: "I&apos;ve" },
      
      // Quotes in JSX content (be careful not to break JavaScript strings)
      { pattern: /"we,"/g, replacement: "&quot;we,&quot;" },
      { pattern: /"our,"/g, replacement: "&quot;our,&quot;" },
      { pattern: /"us"/g, replacement: "&quot;us&quot;" },
    ];
    
    fixes.forEach(fix => {
      if (fix.pattern.test(content)) {
        content = content.replace(fix.pattern, fix.replacement);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed unescaped entities in: ${filePath}`);
    } else {
      console.log(`ℹ️  No changes needed in: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Process each file
filesToFix.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    fixUnescapedEntities(fullPath);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('\n🎉 Unescaped entities fix completed!');