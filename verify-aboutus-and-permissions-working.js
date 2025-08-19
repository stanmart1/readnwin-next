#!/usr/bin/env node

/**
 * About Us Management and Permissions System Verification Script (Working Version)
 *
 * This script verifies:
 * 1. About Us management system sync between admin and public pages
 * 2. All available permissions in the roles management system
 * 3. Permission-to-tab mapping accuracy
 */

const { Pool } = require('pg');

// Working database configuration with fallback values
const pool = new Pool({
  user: process.env.DB_USER || 'avnadmin',
  host: process.env.DB_HOST || 'readnwin-nextjs-book-nextjs.b.aivencloud.com',
  database: process.env.DB_NAME || 'defaultdb',
  password: process.env.DB_PASSWORD || 'AVNS_Xv38UAMF77xN--vUfeX',
  port: parseInt(process.env.DB_PORT || '28428'),
  ssl: {
    rejectUnauthorized: false,
  },
});

// Query helper function
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('✅ Executed query', { text: text.substring(0, 50) + '...', duration, rows: res.rowCount });
    return res;
  } catch (error) {
    const duration = Date.now() - start;
    console.error('❌ Query failed', { text: text.substring(0, 50) + '...', duration, error: error.message });
    throw error;
  }
}

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Expected permissions based on application functionality
const EXPECTED_PERMISSIONS = [
  // User Management
  'users:create', 'users:read', 'users:update', 'users:delete',
  'users:list', 'users:view_profile', 'users:edit_profile',

  // Role & Permission Management
  'roles:create', 'roles:read', 'roles:update', 'roles:delete',
  'roles:list', 'roles:assign', 'roles:view_permissions',
  'permissions:create', 'permissions:read', 'permissions:update', 'permissions:delete',
  'permissions:list', 'permissions:assign',

  // Book Management
  'books:create', 'books:read', 'books:update', 'books:delete',
  'books:list', 'books:publish', 'books:unpublish', 'books:feature',
  'books:upload', 'books:download', 'books:view_analytics',

  // Category Management
  'categories:create', 'categories:read', 'categories:update', 'categories:delete',
  'categories:list', 'categories:manage_hierarchy',

  // Author Management
  'authors:create', 'authors:read', 'authors:update', 'authors:delete',
  'authors:list', 'authors:manage_profile',

  // Order Management
  'orders:create', 'orders:read', 'orders:update', 'orders:delete',
  'orders:list', 'orders:process', 'orders:cancel', 'orders:refund',
  'orders:view_analytics', 'orders:manage_status',

  // Payment Management
  'payments:read', 'payments:update', 'payments:process',
  'payments:refund', 'payments:view_analytics', 'payments:manage_gateways',

  // Content Management
  'content:create', 'content:read', 'content:update', 'content:delete',
  'content:publish', 'content:manage_pages', 'content:manage_blog',
  'content:manage_faq', 'content:manage_aboutus',

  // Email Management
  'emails:send', 'emails:read', 'emails:create_template',
  'emails:update_template', 'emails:delete_template', 'emails:manage_gateway',

  // Analytics & Reports
  'analytics:view_dashboard', 'analytics:view_sales', 'analytics:view_users',
  'analytics:view_books', 'analytics:export_reports',

  // System Management
  'system:manage_settings', 'system:view_logs', 'system:backup',
  'system:restore', 'system:manage_maintenance',

  // File Management
  'files:upload', 'files:download', 'files:delete', 'files:manage',

  // Library Management
  'library:view', 'library:manage_user_books', 'library:download_books'
];

// Admin tab permissions mapping
const ADMIN_TAB_PERMISSIONS = {
  'dashboard': ['analytics:view_dashboard'],
  'users': ['users:list', 'users:read', 'users:create', 'users:update', 'users:delete'],
  'roles': ['roles:list', 'roles:read', 'roles:create', 'roles:update', 'roles:delete', 'permissions:list'],
  'books': ['books:list', 'books:read', 'books:create', 'books:update', 'books:delete'],
  'authors': ['authors:list', 'authors:read', 'authors:create', 'authors:update', 'authors:delete'],
  'categories': ['categories:list', 'categories:read', 'categories:create', 'categories:update', 'categories:delete'],
  'orders': ['orders:list', 'orders:read', 'orders:update', 'orders:process'],
  'payments': ['payments:read', 'payments:view_analytics', 'payments:manage_gateways'],
  'content': ['content:read', 'content:update', 'content:manage_pages', 'content:manage_aboutus'],
  'email': ['emails:read', 'emails:create_template', 'emails:update_template', 'emails:manage_gateway'],
  'analytics': ['analytics:view_dashboard', 'analytics:view_sales', 'analytics:view_users', 'analytics:view_books'],
  'settings': ['system:manage_settings'],
  'faq': ['content:manage_faq']
};

async function verifyAboutUsSystem() {
  log('\n🔍 Verifying About Us Management System...', 'cyan');

  try {
    // Check if about_us table exists
    const aboutUsTableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'about_us'
      );
    `);

    if (!aboutUsTableExists.rows[0].exists) {
      log('❌ About Us table does not exist', 'red');
      return false;
    }

    log('✅ About Us table exists', 'green');

    // Check table structure
    const aboutUsColumns = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'about_us'
      ORDER BY ordinal_position
    `);

    log('\n📋 About Us table structure:', 'blue');
    aboutUsColumns.rows.forEach(col => {
      log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`, 'yellow');
    });

    // Check current content
    const aboutUsContent = await query('SELECT * FROM about_us ORDER BY id');

    if (aboutUsContent.rows.length === 0) {
      log('⚠️ No About Us content found', 'yellow');

      // Create default content
      await query(`
        INSERT INTO about_us (section, title, content, created_at, updated_at)
        VALUES
        ('mission', 'Our Mission', 'To provide quality books and promote reading culture.', NOW(), NOW()),
        ('vision', 'Our Vision', 'To become the leading book platform in our region.', NOW(), NOW()),
        ('team', 'Our Team', 'We are a dedicated team of book lovers and technology enthusiasts.', NOW(), NOW())
      `);

      log('✅ Created default About Us content', 'green');
    } else {
      log(`\n📚 Found ${aboutUsContent.rows.length} About Us sections:`, 'blue');
      aboutUsContent.rows.forEach(section => {
        log(`   ${section.section}: ${section.title}`, 'yellow');
      });
    }

    // Check API endpoints exist
    const fs = require('fs');
    const path = require('path');

    const apiPaths = [
      'app/api/admin/about-us/route.js',
      'app/api/about-us/route.js'
    ];

    for (const apiPath of apiPaths) {
      if (fs.existsSync(path.join(process.cwd(), apiPath))) {
        log(`✅ API endpoint exists: ${apiPath}`, 'green');
      } else {
        log(`❌ API endpoint missing: ${apiPath}`, 'red');
      }
    }

    return true;

  } catch (error) {
    log(`❌ Error verifying About Us system: ${error.message}`, 'red');
    return false;
  }
}

async function verifyPermissionsSystem() {
  log('\n🔍 Verifying Permissions System...', 'cyan');

  try {
    // Check if permissions table exists
    const permissionsTableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'permissions'
      );
    `);

    if (!permissionsTableExists.rows[0].exists) {
      log('❌ Permissions table does not exist', 'red');
      return false;
    }

    log('✅ Permissions table exists', 'green');

    // Check current permissions
    const currentPermissions = await query('SELECT name, resource, action, display_name FROM permissions ORDER BY name');

    log(`\n📋 Found ${currentPermissions.rows.length} permissions in database:`, 'blue');
    const dbPermissions = currentPermissions.rows.map(p => p.name);

    // Show first 10 permissions as sample
    currentPermissions.rows.slice(0, 10).forEach(perm => {
      log(`   ${perm.name} (${perm.resource}:${perm.action})`, 'yellow');
    });

    if (currentPermissions.rows.length > 10) {
      log(`   ... and ${currentPermissions.rows.length - 10} more`, 'yellow');
    }

    // Check for missing permissions
    const missingPermissions = EXPECTED_PERMISSIONS.filter(perm => !dbPermissions.includes(perm));

    if (missingPermissions.length > 0) {
      log(`\n⚠️ Found ${missingPermissions.length} missing permissions:`, 'yellow');
      missingPermissions.slice(0, 10).forEach(perm => {
        log(`   ${perm}`, 'red');
      });

      if (missingPermissions.length > 10) {
        log(`   ... and ${missingPermissions.length - 10} more`, 'red');
      }
    } else {
      log('\n✅ All expected permissions exist', 'green');
    }

    // Check roles table
    const rolesTableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'roles'
      );
    `);

    if (rolesTableExists.rows[0].exists) {
      const roles = await query('SELECT name, display_name FROM roles ORDER BY name');
      log(`\n📋 Found ${roles.rows.length} roles:`, 'blue');
      roles.rows.forEach(role => {
        log(`   ${role.name} (${role.display_name})`, 'yellow');
      });
    } else {
      log('❌ Roles table does not exist', 'red');
    }

    return true;

  } catch (error) {
    log(`❌ Error verifying permissions system: ${error.message}`, 'red');
    return false;
  }
}

async function verifyTabPermissionMapping() {
  log('\n🔍 Verifying Admin Tab Permission Mapping...', 'cyan');

  try {
    // Get all permissions from database
    const dbPermissions = await query('SELECT name FROM permissions ORDER BY name');
    const availablePermissions = dbPermissions.rows.map(p => p.name);

    let mappingIssues = 0;

    for (const [tab, requiredPerms] of Object.entries(ADMIN_TAB_PERMISSIONS)) {
      log(`\n📋 Checking ${tab} tab permissions:`, 'blue');

      const missingPerms = requiredPerms.filter(perm => !availablePermissions.includes(perm));

      if (missingPerms.length === 0) {
        log(`   ✅ All permissions exist (${requiredPerms.length} permissions)`, 'green');
      } else {
        log(`   ❌ Missing ${missingPerms.length} permissions:`, 'red');
        missingPerms.forEach(perm => {
          log(`      ${perm}`, 'red');
        });
        mappingIssues++;
      }
    }

    if (mappingIssues === 0) {
      log('\n✅ All tab permission mappings are valid', 'green');
      return true;
    } else {
      log(`\n⚠️ Found issues with ${mappingIssues} tabs`, 'yellow');
      return false;
    }

  } catch (error) {
    log(`❌ Error verifying tab permission mapping: ${error.message}`, 'red');
    return false;
  }
}

async function createMissingPermissions() {
  log('\n🔧 Creating Missing Permissions...', 'cyan');

  try {
    const currentPermissions = await query('SELECT name FROM permissions');
    const existingPermissions = currentPermissions.rows.map(p => p.name);

    const missingPermissions = EXPECTED_PERMISSIONS.filter(perm => !existingPermissions.includes(perm));

    if (missingPermissions.length === 0) {
      log('✅ No missing permissions to create', 'green');
      return true;
    }

    log(`📋 Creating ${missingPermissions.length} missing permissions...`, 'blue');

    for (const permission of missingPermissions) {
      const [resource, action] = permission.split(':');
      const displayName = permission.replace(/[_:]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      await query(`
        INSERT INTO permissions (name, resource, action, display_name, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (name) DO NOTHING
      `, [permission, resource, action, displayName]);

      log(`   ✅ Created: ${permission}`, 'green');
    }

    log(`\n✅ Successfully created ${missingPermissions.length} permissions`, 'green');
    return true;

  } catch (error) {
    log(`❌ Error creating missing permissions: ${error.message}`, 'red');
    return false;
  }
}

async function generatePermissionsSummary() {
  log('\n📋 Generating Permissions Summary...', 'cyan');

  try {
    const permissions = await query(`
      SELECT resource, action, name, display_name, created_at
      FROM permissions
      ORDER BY resource, action
    `);

    const summary = {};

    permissions.rows.forEach(perm => {
      if (!summary[perm.resource]) {
        summary[perm.resource] = [];
      }
      summary[perm.resource].push({
        name: perm.name,
        action: perm.action,
        display_name: perm.display_name
      });
    });

    log(`\n📊 Permissions Summary (${permissions.rows.length} total):`, 'blue');

    for (const [resource, perms] of Object.entries(summary)) {
      log(`\n   ${resource.toUpperCase()} (${perms.length} permissions):`, 'yellow');
      perms.forEach(perm => {
        log(`      ${perm.name} - ${perm.display_name}`, 'cyan');
      });
    }

    // Generate tab coverage report
    log('\n📋 Tab Permission Coverage:', 'blue');
    for (const [tab, requiredPerms] of Object.entries(ADMIN_TAB_PERMISSIONS)) {
      const availablePerms = requiredPerms.filter(perm =>
        permissions.rows.some(p => p.name === perm)
      );
      const coverage = Math.round((availablePerms.length / requiredPerms.length) * 100);

      if (coverage === 100) {
        log(`   ${tab}: ${coverage}% (${availablePerms.length}/${requiredPerms.length}) ✅`, 'green');
      } else {
        log(`   ${tab}: ${coverage}% (${availablePerms.length}/${requiredPerms.length}) ⚠️`, 'yellow');
      }
    }

    return true;

  } catch (error) {
    log(`❌ Error generating permissions summary: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('🚀 Starting About Us and Permissions System Verification', 'bold');
  console.log(new Date().toISOString());

  const results = {
    aboutUs: false,
    permissions: false,
    tabMapping: false
  };

  try {
    // Test database connection first
    await query('SELECT 1');
    log('✅ Database connection successful', 'green');

    // Verify About Us system
    results.aboutUs = await verifyAboutUsSystem();

    // Verify permissions system
    results.permissions = await verifyPermissionsSystem();

    // Create missing permissions if needed
    if (!results.permissions) {
      await createMissingPermissions();
      results.permissions = await verifyPermissionsSystem();
    }

    // Verify tab permission mapping
    results.tabMapping = await verifyTabPermissionMapping();

    // Generate permissions summary
    await generatePermissionsSummary();

  } catch (error) {
    log(`❌ Critical error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await pool.end();
  }

  console.log(new Date().toISOString());
  log('\n📋 Final Verification Report:', 'bold');
  log(`   About Us System: ${results.aboutUs ? '✅ Working' : '❌ Issues Found'}`, results.aboutUs ? 'green' : 'red');
  log(`   Permissions System: ${results.permissions ? '✅ Working' : '❌ Issues Found'}`, results.permissions ? 'green' : 'red');
  log(`   Tab Mapping: ${results.tabMapping ? '✅ Working' : '❌ Issues Found'}`, results.tabMapping ? 'green' : 'red');

  log('\n🏁 Verification completed!', 'bold');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  verifyAboutUsSystem,
  verifyPermissionsSystem,
  verifyTabPermissionMapping,
  createMissingPermissions,
  generatePermissionsSummary
};
