const fs = require('fs');
const path = require('path');

// Files and their specific unused variables to fix
const fixes = [
  {
    file: 'app/admin/AdminSidebar.tsx',
    fixes: [
      { pattern: /const isAdmin = [^;]+;/, replacement: '' }
    ]
  },
  {
    file: 'app/admin/AuditLog.tsx', 
    fixes: [
      { pattern: /const \{ data: session \} = useSession\(\);/, replacement: '' },
      { pattern: /const formatAuditDetails = \([^}]+\} => \{[^}]+\};/, replacement: '' }
    ]
  },
  {
    file: 'app/admin/BlogManagement.tsx',
    fixes: [
      { pattern: /const quillModules = \{[^}]+\};/, replacement: '' },
      { pattern: /const quillFormats = \[[^\]]+\];/, replacement: '' }
    ]
  },
  {
    file: 'app/admin/BookManagementEnhanced.tsx',
    fixes: [
      { pattern: /const \{ isLoading: loadingStateActive \} = useLoadingState\(\);/, replacement: '' },
      { pattern: /const loadUsers = async \(\) => \{[^}]+\};/, replacement: '' }
    ]
  },
  {
    file: 'app/admin/BulkLibraryManagement.tsx',
    fixes: [
      { pattern: /onClose[,)]/, replacement: '' },
      { pattern: /const \{ data: session \} = useSession\(\);/, replacement: '' }
    ]
  }
];

function fixFile(filePath, fileFixes) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    fileFixes.forEach(fix => {
      if (fix.pattern.test(content)) {
        content = content.replace(fix.pattern, fix.replacement);
        modified = true;
      }
    });

    // Clean up empty lines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed unused variables in: ${filePath}`);
    } else {
      console.log(`ℹ️  No changes needed in: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Process each file
fixes.forEach(({ file, fixes: fileFixes }) => {
  const fullPath = path.join(__dirname, file);
  fixFile(fullPath, fileFixes);
});

console.log('\n🎉 Unused variables fix completed!');