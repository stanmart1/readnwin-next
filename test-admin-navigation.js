// Simple test to verify admin navigation components are properly structured
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Admin Navigation Components...\n');

// Check if key files exist
const files = [
  'app/admin/page.tsx',
  'app/admin/AdminSidebar.tsx',
  'app/hooks/usePermissions.ts',
  'utils/permission-mapping.ts'
];

let allFilesExist = true;

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('\n✅ All required files exist');
  
  // Check for key patterns in AdminSidebar
  const sidebarContent = fs.readFileSync(path.join(__dirname, 'app/admin/AdminSidebar.tsx'), 'utf8');
  
  const checks = [
    { pattern: 'onTabChange\\(tab\\.id\\)', description: 'Tab change handler' },
    { pattern: 'isAdmin.*=.*session\\?\\.user\\?\\.role', description: 'Admin role check' },
    { pattern: 'ADMIN_TAB_PERMISSIONS', description: 'Tab permissions import' },
    { pattern: 'visibleTabs', description: 'Visible tabs logic' }
  ];
  
  console.log('\n🔍 Checking AdminSidebar patterns:');
  checks.forEach(check => {
    const regex = new RegExp(check.pattern);
    if (regex.test(sidebarContent)) {
      console.log(`✅ ${check.description} found`);
    } else {
      console.log(`❌ ${check.description} missing`);
    }
  });
  
  // Check admin page patterns
  const pageContent = fs.readFileSync(path.join(__dirname, 'app/admin/page.tsx'), 'utf8');
  
  const pageChecks = [
    { pattern: 'handleTabChange.*=.*\\(tab:', description: 'Tab change function' },
    { pattern: 'router\\.push.*tab=', description: 'Router navigation' },
    { pattern: 'switch.*activeTab', description: 'Content switching logic' },
    { pattern: 'tabParam.*!==.*activeTab', description: 'Tab comparison logic' }
  ];
  
  console.log('\n🔍 Checking Admin Page patterns:');
  pageChecks.forEach(check => {
    const regex = new RegExp(check.pattern);
    if (regex.test(pageContent)) {
      console.log(`✅ ${check.description} found`);
    } else {
      console.log(`❌ ${check.description} missing`);
    }
  });
  
  console.log('\n✅ Navigation structure verification complete');
} else {
  console.log('\n❌ Missing required files');
}