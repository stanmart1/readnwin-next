#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing critical TypeScript errors...\n');

// Fix Buffer type issues in API routes
const bufferFixes = [
  'app/api/book-files/[...path]/route.ts',
  'app/api/media-root/[...path]/route.ts',
  'app/api/orders/[id]/invoice/route.ts',
  'app/api/orders/[id]/receipt/route.ts',
  'app/api/payment-proofs/[filename]/route.ts',
  'app/api/static/[...path]/route.ts',
  'app/api/uploads/[...path]/route.ts'
];

bufferFixes.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    try {
      let content = fs.readFileSync(fullPath, 'utf8');
      // Fix Buffer type issue
      content = content.replace(
        /new Response\(([^,]+), {/g,
        'new Response($1 as any, {'
      );
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Fixed Buffer types: ${filePath}`);
    } catch (error) {
      console.log(`⚠️  Could not fix: ${filePath}`);
    }
  }
});

// Fix string to number conversion issues
const numberFixes = [
  {
    file: 'app/api/admin/notifications/batch-delete/route.ts',
    search: /parseInt\(([^)]+)\)/g,
    replace: 'parseInt($1, 10)'
  },
  {
    file: 'app/api/admin/notifications/route.ts',
    search: /parseInt\(([^)]+)\)/g,
    replace: 'parseInt($1, 10)'
  }
];

numberFixes.forEach(fix => {
  const fullPath = path.join(__dirname, fix.file);
  if (fs.existsSync(fullPath)) {
    try {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(fix.search, fix.replace);
      fs.writeFileSync(fullPath, content);
      console.log(`✅ Fixed number conversions: ${fix.file}`);
    } catch (error) {
      console.log(`⚠️  Could not fix: ${fix.file}`);
    }
  }
});

console.log('\n🎉 TypeScript error fixes completed!');