#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix critical TypeScript errors
const fixes = [
  // Fix undefined response variable
  {
    file: 'app/admin/BookManagementEnhanced.tsx',
    search: /response\.ok/g,
    replace: 'authorsResponse.ok'
  },
  // Fix duplicate function declarations in EmailGatewayManagement
  {
    file: 'app/admin/EmailGatewayManagement.tsx',
    search: /const getGatewayIcon = \(gateway: string\) => {[\s\S]*?};/g,
    replace: ''
  },
  // Fix missing accessToken property
  {
    file: 'app/admin/ShippingManagement.tsx',
    search: /session\.accessToken/g,
    replace: 'session.user?.accessToken'
  },
  // Fix string to number conversions
  {
    file: 'app/api/admin/notifications/batch-delete/route.ts',
    search: /parseInt\(([^)]+)\)/g,
    replace: 'parseInt($1, 10)'
  }
];

console.log('🔧 Fixing critical TypeScript build errors...\n');

fixes.forEach(fix => {
  const filePath = path.join(__dirname, fix.file);
  
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      content = content.replace(fix.search, fix.replace);
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed: ${fix.file}`);
      } else {
        console.log(`⚠️  No changes needed: ${fix.file}`);
      }
    } catch (error) {
      console.error(`❌ Error fixing ${fix.file}:`, error.message);
    }
  } else {
    console.log(`⚠️  File not found: ${fix.file}`);
  }
});

console.log('\n🎉 Build error fixes completed!');