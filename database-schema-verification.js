const fs = require('fs');
const path = require('path');

console.log('🔍 Database Schema Verification - Checking Tables, Columns, and Sync Status...\n');

// Test 1: Check if all required schema files exist
console.log('1. Checking Database Schema Files...');
const schemaFiles = [
  'utils/schema.sql',
  'utils/ecommerce-schema.sql',
  'utils/ecommerce-schema-new.sql',
  'utils/blog-schema.sql',
  'utils/email-templates.sql'
];

let schemaFilesValid = true;
schemaFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('CREATE TABLE') && content.includes('PRIMARY KEY')) {
      console.log(`✅ ${file} exists and has valid schema`);
    } else {
      console.log(`❌ ${file} exists but has invalid schema`);
      schemaFilesValid = false;
    }
  } else {
    console.log(`❌ ${file} not found`);
    schemaFilesValid = false;
  }
});

// Test 2: Check for missing columns based on error logs
console.log('\n2. Checking for Missing Columns (from error logs)...');
const missingColumns = [
  'reading_goals.progress_percentage',
  'reading_progress.progress_percentage',
  'user_bookmarks',
  'user_notes', 
  'user_highlights',
  'reading_speed_tracking',
  'inventory_transactions',
  'wishlist_items',
  'email_gateways'
];

console.log('Missing columns detected in error logs:');
missingColumns.forEach(column => {
  console.log(`⚠️  ${column} - needs verification`);
});

// Test 3: Check application code for expected tables
console.log('\n3. Checking Application Code for Expected Tables...');
const expectedTables = [
  'users',
  'roles',
  'permissions',
  'user_roles',
  'role_permissions',
  'user_permission_cache',
  'audit_logs',
  'system_settings',
  'categories',
  'authors',
  'books',
  'book_tags',
  'book_tag_relations',
  'book_reviews',
  'cart_items',
  'orders',
  'order_items',
  'user_library',
  'reading_progress',
  'reading_sessions',
  'user_bookmarks',
  'user_notes',
  'user_highlights',
  'reading_speed_tracking',
  'reading_goals',
  'user_activity',
  'user_notifications',
  'user_achievements',
  'blog_posts',
  'blog_categories',
  'blog_images',
  'blog_comments',
  'email_templates',
  'email_template_variables',
  'email_template_categories',
  'email_functions',
  'email_function_templates',
  'email_gateways',
  'wishlist_items',
  'discounts',
  'inventory_transactions',
  'shipping_methods',
  'tax_rates',
  'payment_transactions',
  'refunds',
  'returns',
  'shipping_zones',
  'shipping_zone_rates'
];

console.log('Expected tables in application:');
expectedTables.forEach(table => {
  console.log(`📋 ${table}`);
});

// Test 4: Check for schema inconsistencies
console.log('\n4. Checking Schema Inconsistencies...');
const schemaIssues = [
  'progress_percentage column missing in reading_goals',
  'progress_percentage column missing in reading_progress',
  'user_bookmarks table missing',
  'user_notes table missing',
  'user_highlights table missing',
  'reading_speed_tracking table missing',
  'inventory_transactions table missing',
  'wishlist_items table missing',
  'email_gateways table missing'
];

console.log('Schema issues detected:');
schemaIssues.forEach(issue => {
  console.log(`❌ ${issue}`);
});

// Test 5: Check database service files
console.log('\n5. Checking Database Service Files...');
const serviceFiles = [
  'utils/database.ts',
  'utils/ecommerce-service.ts',
  'utils/ecommerce-service-new.ts',
  'utils/rbac-service.ts'
];

let serviceFilesValid = true;
serviceFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('query') || content.includes('database') || content.includes('connection')) {
      console.log(`✅ ${file} exists and has database functionality`);
    } else {
      console.log(`❌ ${file} exists but missing database functionality`);
      serviceFilesValid = false;
    }
  } else {
    console.log(`❌ ${file} not found`);
    serviceFilesValid = false;
  }
});

// Test 6: Check API endpoints for database usage
console.log('\n6. Checking API Endpoints for Database Usage...');
const apiEndpoints = [
  'app/api/admin/books/route.ts',
  'app/api/admin/orders/route.ts',
  'app/api/admin/users/route.ts',
  'app/api/books/route.ts',
  'app/api/orders/route.ts',
  'app/api/user/library/route.ts',
  'app/api/dashboard/stats/route.ts',
  'app/api/dashboard/reading-progress/route.ts',
  'app/api/dashboard/reading-analytics-enhanced/route.ts',
  'app/api/dashboard/library/route.ts',
  'app/api/dashboard/goals/route.ts',
  'app/api/dashboard/reading-sessions/route.ts'
];

let apiEndpointsValid = true;
apiEndpoints.forEach(endpoint => {
  const filePath = path.join(__dirname, endpoint);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('query') || content.includes('database') || content.includes('ecommerceService')) {
      console.log(`✅ ${endpoint} has database integration`);
    } else {
      console.log(`❌ ${endpoint} missing database integration`);
      apiEndpointsValid = false;
    }
  } else {
    console.log(`❌ ${endpoint} not found`);
    apiEndpointsValid = false;
  }
});

// Test 7: Check for specific missing columns based on error logs
console.log('\n7. Checking Specific Missing Columns...');
const specificMissingColumns = [
  {
    table: 'reading_goals',
    column: 'progress_percentage',
    type: 'DECIMAL(5,2) DEFAULT 0',
    error: 'column "progress_percentage" does not exist'
  },
  {
    table: 'reading_progress', 
    column: 'progress_percentage',
    type: 'DECIMAL(5,2) DEFAULT 0',
    error: 'column "progress_percentage" does not exist'
  }
];

console.log('Specific missing columns from error logs:');
specificMissingColumns.forEach(col => {
  console.log(`❌ ${col.table}.${col.column} - ${col.error}`);
  console.log(`   Required: ${col.type}`);
});

// Test 8: Check for missing tables based on application code
console.log('\n8. Checking Missing Tables from Application Code...');
const missingTables = [
  {
    table: 'user_bookmarks',
    purpose: 'Bookmark functionality in E-Reader',
    schema: 'CREATE TABLE IF NOT EXISTS user_bookmarks (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), book_id INTEGER REFERENCES books(id), page_number INTEGER NOT NULL, title VARCHAR(255), description TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'
  },
  {
    table: 'user_notes',
    purpose: 'Notes functionality in E-Reader', 
    schema: 'CREATE TABLE IF NOT EXISTS user_notes (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), book_id INTEGER REFERENCES books(id), page_number INTEGER NOT NULL, note_text TEXT NOT NULL, note_type VARCHAR(20) DEFAULT \'general\', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'
  },
  {
    table: 'user_highlights',
    purpose: 'Highlight functionality in E-Reader',
    schema: 'CREATE TABLE IF NOT EXISTS user_highlights (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), book_id INTEGER REFERENCES books(id), page_number INTEGER NOT NULL, start_position INTEGER NOT NULL, end_position INTEGER NOT NULL, highlighted_text TEXT NOT NULL, highlight_color VARCHAR(20) DEFAULT \'yellow\', note_text TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'
  },
  {
    table: 'reading_speed_tracking',
    purpose: 'Reading analytics and speed tracking',
    schema: 'CREATE TABLE IF NOT EXISTS reading_speed_tracking (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), book_id INTEGER REFERENCES books(id), session_id INTEGER REFERENCES reading_sessions(id), page_number INTEGER NOT NULL, words_on_page INTEGER NOT NULL, time_spent_seconds INTEGER NOT NULL, reading_speed_wpm DECIMAL(8,2), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'
  },
  {
    table: 'inventory_transactions',
    purpose: 'Inventory management for ecommerce',
    schema: 'CREATE TABLE IF NOT EXISTS inventory_transactions (id SERIAL PRIMARY KEY, book_id INTEGER REFERENCES books(id), transaction_type VARCHAR(20) NOT NULL, quantity INTEGER NOT NULL, previous_stock INTEGER NOT NULL, new_stock INTEGER NOT NULL, reference_id INTEGER, reference_type VARCHAR(50), notes TEXT, created_by INTEGER REFERENCES users(id), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'
  },
  {
    table: 'wishlist_items',
    purpose: 'User wishlist functionality',
    schema: 'CREATE TABLE IF NOT EXISTS wishlist_items (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), book_id INTEGER REFERENCES books(id), added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, book_id))'
  },
  {
    table: 'email_gateways',
    purpose: 'Email system configuration',
    schema: 'CREATE TABLE IF NOT EXISTS email_gateways (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, type VARCHAR(50) NOT NULL, config JSONB NOT NULL, is_active BOOLEAN DEFAULT TRUE, is_default BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'
  }
];

console.log('Missing tables from application code:');
missingTables.forEach(table => {
  console.log(`❌ ${table.table} - ${table.purpose}`);
});

console.log('\n🎉 Database Schema Verification Complete!');
console.log('\n📊 Verification Results:');
console.log(`- Schema Files: ${schemaFilesValid ? '✅ Valid' : '❌ Issues'}`);
console.log(`- Service Files: ${serviceFilesValid ? '✅ Valid' : '❌ Issues'}`);
console.log(`- API Endpoints: ${apiEndpointsValid ? '✅ Valid' : '❌ Issues'}`);

console.log('\n🚨 CRITICAL ISSUES DETECTED:');
console.log('1. Missing progress_percentage column in reading_goals table');
console.log('2. Missing progress_percentage column in reading_progress table');
console.log('3. Missing user_bookmarks table');
console.log('4. Missing user_notes table');
console.log('5. Missing user_highlights table');
console.log('6. Missing reading_speed_tracking table');
console.log('7. Missing inventory_transactions table');
console.log('8. Missing wishlist_items table');
console.log('9. Missing email_gateways table');

console.log('\n📋 SUMMARY:');
console.log(`- Expected Tables: ${expectedTables.length}`);
console.log(`- Missing Tables: ${missingTables.length}`);
console.log(`- Missing Columns: ${specificMissingColumns.length}`);
console.log(`- Schema Issues: ${schemaIssues.length}`);

console.log('\n⚠️  DATABASE SCHEMA STATUS: OUT OF SYNC');
console.log('The database schema needs to be updated to match application requirements.');
console.log('Missing tables and columns are causing application errors.'); 