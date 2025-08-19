#!/usr/bin/env node

/**
 * About Us Management and Permissions System Verification Script
 *
 * This script verifies:
 * 1. About Us management system sync between admin and public pages
 * 2. All available permissions in the roles management system
 * 3. Permission-to-tab mapping accuracy
 */

const { query } = require('./utils/database');

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
  { name: 'users.read', resource: 'users', action: 'read', description: 'View Users' },
  { name: 'users.create', resource: 'users', action: 'create', description: 'Create Users' },
  { name: 'users.update', resource: 'users', action: 'update', description: 'Update Users' },
  { name: 'users.delete', resource: 'users', action: 'delete', description: 'Delete Users' },
  { name: 'users.manage_roles', resource: 'users', action: 'manage_roles', description: 'Manage User Roles' },

  // Role Management
  { name: 'roles.read', resource: 'roles', action: 'read', description: 'View Roles' },
  { name: 'roles.create', resource: 'roles', action: 'create', description: 'Create Roles' },
  { name: 'roles.update', resource: 'roles', action: 'update', description: 'Update Roles' },
  { name: 'roles.delete', resource: 'roles', action: 'delete', description: 'Delete Roles' },
  { name: 'roles.manage_permissions', resource: 'roles', action: 'manage_permissions', description: 'Manage Role Permissions' },

  // Permission Management
  { name: 'permissions.read', resource: 'permissions', action: 'read', description: 'View Permissions' },
  { name: 'permissions.create', resource: 'permissions', action: 'create', description: 'Create Permissions' },
  { name: 'permissions.update', resource: 'permissions', action: 'update', description: 'Update Permissions' },
  { name: 'permissions.delete', resource: 'permissions', action: 'delete', description: 'Delete Permissions' },

  // Content Management
  { name: 'content.read', resource: 'content', action: 'read', description: 'View Content' },
  { name: 'content.create', resource: 'content', action: 'create', description: 'Create Content' },
  { name: 'content.update', resource: 'content', action: 'update', description: 'Update Content' },
  { name: 'content.delete', resource: 'content', action: 'delete', description: 'Delete Content' },
  { name: 'content.publish', resource: 'content', action: 'publish', description: 'Publish Content' },
  { name: 'content.moderate', resource: 'content', action: 'moderate', description: 'Moderate Content' },
  { name: 'content.manage', resource: 'content', action: 'manage', description: 'Manage Content' },

  // System Management
  { name: 'system.settings', resource: 'system', action: 'settings', description: 'Manage System Settings' },
  { name: 'system.analytics', resource: 'system', action: 'analytics', description: 'View Analytics' },
  { name: 'system.audit_logs', resource: 'system', action: 'audit_logs', description: 'View Audit Logs' },

  // Order Management
  { name: 'orders.read', resource: 'orders', action: 'read', description: 'View Orders' },
  { name: 'orders.create', resource: 'orders', action: 'create', description: 'Create Orders' },
  { name: 'orders.update', resource: 'orders', action: 'update', description: 'Update Orders' },
  { name: 'orders.delete', resource: 'orders', action: 'delete', description: 'Delete Orders' },
  { name: 'orders.cancel', resource: 'orders', action: 'cancel', description: 'Cancel Orders' },
  { name: 'orders.view', resource: 'orders', action: 'view', description: 'View Order Details' },

  // E-commerce
  { name: 'checkout.access', resource: 'checkout', action: 'access', description: 'Access Checkout' },
  { name: 'checkout.complete', resource: 'checkout', action: 'complete', description: 'Complete Checkout' },
  { name: 'checkout.guest', resource: 'checkout', action: 'guest', description: 'Guest Checkout' },
  { name: 'cart.access', resource: 'cart', action: 'access', description: 'Access Cart' },
  { name: 'cart.manage', resource: 'cart', action: 'manage', description: 'Manage Cart' },
  { name: 'payment.process', resource: 'payment', action: 'process', description: 'Process Payment' },
  { name: 'payment.verify', resource: 'payment', action: 'verify', description: 'Verify Payment' },

  // Library Management
  { name: 'library.access', resource: 'library', action: 'access', description: 'Access Library' },
  { name: 'library.manage', resource: 'library', action: 'manage', description: 'Manage Library' },

  // Profile Management
  { name: 'profile.read', resource: 'profile', action: 'read', description: 'View Own Profile' },
  { name: 'profile.update', resource: 'profile', action: 'update', description: 'Update Own Profile' },

  // Blog Management
  { name: 'blog.read', resource: 'blog', action: 'read', description: 'View Blog Posts' },
  { name: 'blog.create', resource: 'blog', action: 'create', description: 'Create Blog Posts' },
  { name: 'blog.update', resource: 'blog', action: 'update', description: 'Update Blog Posts' },
  { name: 'blog.delete', resource: 'blog', action: 'delete', description: 'Delete Blog Posts' },
  { name: 'blog.publish', resource: 'blog', action: 'publish', description: 'Publish Blog Posts' },

  // FAQ Management
  { name: 'faq.read', resource: 'faq', action: 'read', description: 'View FAQs' },
  { name: 'faq.create', resource: 'faq', action: 'create', description: 'Create FAQs' },
  { name: 'faq.update', resource: 'faq', action: 'update', description: 'Update FAQs' },
  { name: 'faq.delete', resource: 'faq', action: 'delete', description: 'Delete FAQs' },

  // Works Management
  { name: 'works.read', resource: 'works', action: 'read', description: 'View Works' },
  { name: 'works.create', resource: 'works', action: 'create', description: 'Create Works' },
  { name: 'works.update', resource: 'works', action: 'update', description: 'Update Works' },
  { name: 'works.delete', resource: 'works', action: 'delete', description: 'Delete Works' },

  // Email Management
  { name: 'email.read', resource: 'email', action: 'read', description: 'View Email Templates' },
  { name: 'email.create', resource: 'email', action: 'create', description: 'Create Email Templates' },
  { name: 'email.update', resource: 'email', action: 'update', description: 'Update Email Templates' },
  { name: 'email.delete', resource: 'email', action: 'delete', description: 'Delete Email Templates' },
  { name: 'email.send', resource: 'email', action: 'send', description: 'Send Emails' },

  // About Management
  { name: 'about.read', resource: 'about', action: 'read', description: 'View About Content' },
  { name: 'about.update', resource: 'about', action: 'update', description: 'Update About Content' },

  // Contact Management
  { name: 'contact.read', resource: 'contact', action: 'read', description: 'View Contact Info' },
  { name: 'contact.update', resource: 'contact', action: 'update', description: 'Update Contact Info' },

  // Reading Analytics
  { name: 'reading.analytics', resource: 'reading', action: 'analytics', description: 'View Reading Analytics' },
  { name: 'reading.reports', resource: 'reading', action: 'reports', description: 'Generate Reading Reports' },

  // Reviews Management
  { name: 'reviews.read', resource: 'reviews', action: 'read', description: 'View Reviews' },
  { name: 'reviews.moderate', resource: 'reviews', action: 'moderate', description: 'Moderate Reviews' },
  { name: 'reviews.delete', resource: 'reviews', action: 'delete', description: 'Delete Reviews' },

  // Shipping Management
  { name: 'shipping.read', resource: 'shipping', action: 'read', description: 'View Shipping' },
  { name: 'shipping.update', resource: 'shipping', action: 'update', description: 'Update Shipping' },

  // Notifications
  { name: 'notifications.read', resource: 'notifications', action: 'read', description: 'View Notifications' },
  { name: 'notifications.create', resource: 'notifications', action: 'create', description: 'Create Notifications' },
  { name: 'notifications.update', resource: 'notifications', action: 'update', description: 'Update Notifications' },
  { name: 'notifications.delete', resource: 'notifications', action: 'delete', description: 'Delete Notifications' }
];

// Admin tab to permission mapping
const ADMIN_TAB_PERMISSIONS = {
  overview: ['system.analytics'],
  users: ['users.read'],
  roles: ['roles.read'],
  audit: ['system.audit_logs'],
  content: ['content.read'],
  reviews: ['content.moderate', 'reviews.read'],
  notifications: ['system.settings', 'notifications.read'],
  orders: ['orders.read', 'orders.view'],
  shipping: ['shipping.read'],
  reading: ['system.analytics', 'reading.analytics'],
  reports: ['system.analytics', 'reading.reports'],
  'email-templates': ['system.settings', 'email.read'],
  blog: ['content.read', 'content.create', 'blog.read'],
  works: ['content.read', 'content.create', 'works.read'],
  about: ['content.read', 'content.update', 'about.read'],
  contact: ['content.read', 'content.update', 'contact.read'],
  'faq-management': ['content.read', 'content.create', 'content.update', 'faq.read'],
  settings: ['system.settings']
};

async function verifyAboutUsSystem() {
  log('\n🔍 Verifying About Us Management System...', 'blue');

  try {
    // Check system_settings table exists
    const settingsTableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'system_settings'
      );
    `);

    if (!settingsTableCheck.rows[0].exists) {
      log('❌ system_settings table does not exist', 'red');
      return false;
    }

    log('✅ system_settings table exists', 'green');

    // Check for about_page_content setting
    const aboutContentCheck = await query(`
      SELECT setting_value FROM system_settings
      WHERE setting_key = 'about_page_content'
    `);

    if (aboutContentCheck.rows.length === 0) {
      log('⚠️  about_page_content not found in system_settings', 'yellow');
      log('ℹ️  This will use default content', 'cyan');
    } else {
      log('✅ about_page_content found in system_settings', 'green');

      // Validate JSON structure
      try {
        const content = JSON.parse(aboutContentCheck.rows[0].setting_value);
        const requiredSections = ['hero', 'mission', 'team', 'story', 'values', 'stats', 'cta'];
        const missingSections = requiredSections.filter(section => !content[section]);

        if (missingSections.length > 0) {
          log(`⚠️  Missing sections in about content: ${missingSections.join(', ')}`, 'yellow');
        } else {
          log('✅ All required sections present in about content', 'green');
        }

        // Check team section specifically
        if (content.team && Array.isArray(content.team)) {
          log(`✅ Team section has ${content.team.length} members`, 'green');
        } else {
          log('⚠️  Team section missing or invalid', 'yellow');
        }

      } catch (parseError) {
        log('❌ Invalid JSON in about_page_content', 'red');
        return false;
      }
    }

    log('✅ About Us system verification completed', 'green');
    return true;

  } catch (error) {
    log(`❌ Error verifying About Us system: ${error.message}`, 'red');
    return false;
  }
}

async function verifyPermissionsSystem() {
  log('\n🔍 Verifying Permissions System...', 'blue');

  try {
    // Check permissions table exists
    const permissionsTableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'permissions'
      );
    `);

    if (!permissionsTableCheck.rows[0].exists) {
      log('❌ permissions table does not exist', 'red');
      return false;
    }

    log('✅ permissions table exists', 'green');

    // Get existing permissions
    const existingPermissions = await query(`
      SELECT name, resource, action, display_name, description
      FROM permissions
      ORDER BY resource, action
    `);

    log(`ℹ️  Found ${existingPermissions.rows.length} existing permissions`, 'cyan');

    // Check for missing permissions
    const existingPermissionNames = existingPermissions.rows.map(p => p.name);
    const missingPermissions = EXPECTED_PERMISSIONS.filter(
      expected => !existingPermissionNames.includes(expected.name)
    );

    if (missingPermissions.length > 0) {
      log(`⚠️  Found ${missingPermissions.length} missing permissions:`, 'yellow');
      missingPermissions.forEach(permission => {
        log(`   - ${permission.name} (${permission.description})`, 'yellow');
      });
    } else {
      log('✅ All expected permissions are present', 'green');
    }

    // Check for extra permissions
    const expectedPermissionNames = EXPECTED_PERMISSIONS.map(p => p.name);
    const extraPermissions = existingPermissions.rows.filter(
      existing => !expectedPermissionNames.includes(existing.name)
    );

    if (extraPermissions.length > 0) {
      log(`ℹ️  Found ${extraPermissions.length} additional permissions:`, 'cyan');
      extraPermissions.forEach(permission => {
        log(`   - ${permission.name} (${permission.display_name})`, 'cyan');
      });
    }

    // Group permissions by resource
    const permissionsByResource = {};
    existingPermissions.rows.forEach(permission => {
      if (!permissionsByResource[permission.resource]) {
        permissionsByResource[permission.resource] = [];
      }
      permissionsByResource[permission.resource].push(permission);
    });

    log('\n📊 Permissions by Resource:', 'blue');
    Object.keys(permissionsByResource).sort().forEach(resource => {
      const permissions = permissionsByResource[resource];
      log(`   ${resource}: ${permissions.length} permissions`, 'cyan');
      permissions.forEach(permission => {
        log(`     - ${permission.action} (${permission.display_name})`, 'cyan');
      });
    });

    return { missingPermissions, extraPermissions, existingPermissions: existingPermissions.rows };

  } catch (error) {
    log(`❌ Error verifying permissions system: ${error.message}`, 'red');
    return false;
  }
}

async function verifyTabPermissionMapping() {
  log('\n🔍 Verifying Admin Tab Permission Mapping...', 'blue');

  try {
    // Get existing permissions
    const existingPermissions = await query(`
      SELECT name FROM permissions ORDER BY name
    `);
    const existingPermissionNames = existingPermissions.rows.map(p => p.name);

    let allMappingsValid = true;

    Object.keys(ADMIN_TAB_PERMISSIONS).forEach(tabId => {
      const requiredPermissions = ADMIN_TAB_PERMISSIONS[tabId];
      const missingPermissions = requiredPermissions.filter(
        permission => !existingPermissionNames.includes(permission)
      );

      if (missingPermissions.length > 0) {
        log(`⚠️  Tab "${tabId}" requires missing permissions: ${missingPermissions.join(', ')}`, 'yellow');
        allMappingsValid = false;
      } else {
        log(`✅ Tab "${tabId}" has all required permissions`, 'green');
      }
    });

    if (allMappingsValid) {
      log('✅ All admin tab permission mappings are valid', 'green');
    } else {
      log('⚠️  Some admin tab permission mappings need attention', 'yellow');
    }

    return allMappingsValid;

  } catch (error) {
    log(`❌ Error verifying tab permission mapping: ${error.message}`, 'red');
    return false;
  }
}

async function createMissingPermissions(missingPermissions) {
  if (missingPermissions.length === 0) {
    return true;
  }

  log(`\n🔧 Creating ${missingPermissions.length} missing permissions...`, 'blue');

  try {
    for (const permission of missingPermissions) {
      await query(`
        INSERT INTO permissions (name, display_name, description, resource, action, scope)
        VALUES ($1, $2, $3, $4, $5, 'global')
        ON CONFLICT (name) DO NOTHING
      `, [
        permission.name,
        permission.description,
        permission.description,
        permission.resource,
        permission.action
      ]);

      log(`✅ Created permission: ${permission.name}`, 'green');
    }

    log('✅ All missing permissions created successfully', 'green');
    return true;

  } catch (error) {
    log(`❌ Error creating permissions: ${error.message}`, 'red');
    return false;
  }
}

async function generatePermissionsSummary() {
  log('\n📋 Generating Permissions Summary...', 'blue');

  try {
    const permissions = await query(`
      SELECT resource, action, name, display_name, description, scope
      FROM permissions
      ORDER BY resource, action
    `);

    const summary = {
      total: permissions.rows.length,
      byResource: {},
      byScope: {},
      adminTabMapping: ADMIN_TAB_PERMISSIONS
    };

    permissions.rows.forEach(permission => {
      // Group by resource
      if (!summary.byResource[permission.resource]) {
        summary.byResource[permission.resource] = [];
      }
      summary.byResource[permission.resource].push({
        name: permission.name,
        action: permission.action,
        display_name: permission.display_name
      });

      // Group by scope
      if (!summary.byScope[permission.scope]) {
        summary.byScope[permission.scope] = 0;
      }
      summary.byScope[permission.scope]++;
    });

    log(`\n📊 Permissions Summary:`, 'bold');
    log(`   Total Permissions: ${summary.total}`, 'cyan');
    log(`   Resources: ${Object.keys(summary.byResource).length}`, 'cyan');

    log(`\n📈 By Scope:`, 'bold');
    Object.keys(summary.byScope).forEach(scope => {
      log(`   ${scope}: ${summary.byScope[scope]} permissions`, 'cyan');
    });

    log(`\n📑 By Resource:`, 'bold');
    Object.keys(summary.byResource).sort().forEach(resource => {
      const resourcePermissions = summary.byResource[resource];
      log(`   ${resource} (${resourcePermissions.length}):`, 'cyan');
      resourcePermissions.forEach(permission => {
        log(`     - ${permission.action}: ${permission.display_name}`, 'cyan');
      });
    });

    return summary;

  } catch (error) {
    log(`❌ Error generating permissions summary: ${error.message}`, 'red');
    return null;
  }
}

async function main() {
  log('🚀 Starting About Us and Permissions System Verification', 'bold');
  log('=' * 60, 'cyan');

  // Verify About Us system
  const aboutUsValid = await verifyAboutUsSystem();

  // Verify Permissions system
  const permissionsResult = await verifyPermissionsSystem();

  if (permissionsResult && permissionsResult.missingPermissions) {
    // Offer to create missing permissions
    if (permissionsResult.missingPermissions.length > 0) {
      log(`\n❓ Would you like to create the ${permissionsResult.missingPermissions.length} missing permissions?`, 'yellow');
      log('   Run with --create-permissions flag to automatically create them', 'cyan');

      if (process.argv.includes('--create-permissions')) {
        await createMissingPermissions(permissionsResult.missingPermissions);
      }
    }
  }

  // Verify tab permission mapping
  const tabMappingValid = await verifyTabPermissionMapping();

  // Generate summary
  const summary = await generatePermissionsSummary();

  // Final report
  log('\n' + '=' * 60, 'cyan');
  log('📋 Final Verification Report:', 'bold');
  log(`   About Us System: ${aboutUsValid ? '✅ Valid' : '❌ Issues Found'}`, aboutUsValid ? 'green' : 'red');
  log(`   Permissions System: ${permissionsResult ? '✅ Valid' : '❌ Issues Found'}`, permissionsResult ? 'green' : 'red');
  log(`   Tab Mapping: ${tabMappingValid ? '✅ Valid' : '❌ Issues Found'}`, tabMappingValid ? 'green' : 'red');

  if (summary) {
    log(`   Total Permissions: ${summary.total}`, 'cyan');
    log(`   Resources Covered: ${Object.keys(summary.byResource).length}`, 'cyan');
  }

  log('\n🏁 Verification completed!', 'bold');

  if (!aboutUsValid || !permissionsResult || !tabMappingValid) {
    process.exit(1);
  }
}

// Run the verification
if (require.main === module) {
  main().catch(error => {
    log(`❌ Verification failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  verifyAboutUsSystem,
  verifyPermissionsSystem,
  verifyTabPermissionMapping,
  createMissingPermissions,
  generatePermissionsSummary,
  EXPECTED_PERMISSIONS,
  ADMIN_TAB_PERMISSIONS
};
