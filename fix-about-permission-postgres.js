#!/usr/bin/env node

/**
 * About Us Permission Diagnostic and Fix Script (PostgreSQL)
 *
 * This script diagnoses and fixes permission issues that prevent
 * the About Us management tab from appearing in the admin dashboard.
 */

const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false,
});

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log('\n' + '='.repeat(60), 'cyan');
  log(`  ${title}`, 'bright');
  log('='.repeat(60), 'cyan');
}

async function checkDatabaseConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    log('✅ Database connection successful', 'green');
    return true;
  } catch (error) {
    log('❌ Database connection failed', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function checkAboutUsPermission() {
  logSection('Checking About Us Permission');

  try {
    const result = await pool.query(
      'SELECT * FROM permissions WHERE name = $1',
      ['content.aboutus']
    );

    if (result.rows.length > 0) {
      const permission = result.rows[0];
      log('✅ content.aboutus permission exists', 'green');
      log(`   ID: ${permission.id}`, 'blue');
      log(`   Display Name: ${permission.display_name}`, 'blue');
      log(`   Resource: ${permission.resource}`, 'blue');
      log(`   Action: ${permission.action}`, 'blue');
      return permission;
    } else {
      log('❌ content.aboutus permission missing', 'red');
      return null;
    }
  } catch (error) {
    log('❌ Error checking permission', 'red');
    log(`   Error: ${error.message}`, 'red');
    return null;
  }
}

async function createAboutUsPermission() {
  log('\n🔧 Creating content.aboutus permission...', 'yellow');

  try {
    const result = await pool.query(
      `INSERT INTO permissions (name, resource, action, display_name, description, scope, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        'content.aboutus',
        'content',
        'aboutus',
        'Manage About Us',
        'Permission to manage About Us page content',
        'global'
      ]
    );

    const permission = result.rows[0];
    log('✅ content.aboutus permission created successfully', 'green');
    log(`   ID: ${permission.id}`, 'blue');
    return permission;
  } catch (error) {
    log('❌ Failed to create permission', 'red');
    log(`   Error: ${error.message}`, 'red');
    return null;
  }
}

async function checkUserRoles() {
  logSection('Checking User Roles');

  try {
    const result = await pool.query(
      `SELECT r.*, COUNT(ur.user_id) as user_count
       FROM roles r
       LEFT JOIN user_roles ur ON r.id = ur.role_id AND ur.is_active = TRUE
       GROUP BY r.id, r.name, r.display_name, r.priority
       ORDER BY r.priority DESC`
    );

    if (result.rows.length === 0) {
      log('❌ No roles found in database', 'red');
      return [];
    }

    log('📋 Available roles:', 'blue');
    result.rows.forEach(role => {
      log(`   • ${role.display_name} (${role.name}) - ${role.user_count} users`, 'blue');
    });

    return result.rows;
  } catch (error) {
    log('❌ Error checking roles', 'red');
    log(`   Error: ${error.message}`, 'red');
    return [];
  }
}

async function checkRolePermissions(roleId, permissionId) {
  try {
    const result = await pool.query(
      'SELECT * FROM role_permissions WHERE role_id = $1 AND permission_id = $2',
      [roleId, permissionId]
    );
    return result.rows.length > 0;
  } catch (error) {
    return false;
  }
}

async function assignPermissionToRole(roleId, permissionId, roleName) {
  try {
    await pool.query(
      `INSERT INTO role_permissions (role_id, permission_id, granted_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)`,
      [roleId, permissionId]
    );

    log(`   ✅ Assigned to ${roleName}`, 'green');
    return true;
  } catch (error) {
    log(`   ❌ Failed to assign to ${roleName}: ${error.message}`, 'red');
    return false;
  }
}

async function assignAboutUsPermissionToRoles(permission) {
  logSection('Assigning About Us Permission to Roles');

  const roles = await pool.query('SELECT * FROM roles');
  let assignmentCount = 0;

  for (const role of roles.rows) {
    const hasPermission = await checkRolePermissions(role.id, permission.id);

    if (hasPermission) {
      log(`   ✅ ${role.display_name} already has permission`, 'green');
    } else {
      // Assign to admin and super_admin roles
      if (role.name === 'admin' || role.name === 'super_admin' || role.name === 'administrator') {
        const success = await assignPermissionToRole(role.id, permission.id, role.display_name);
        if (success) assignmentCount++;
      } else {
        log(`   ⚠️  ${role.display_name} - not assigned (not admin role)`, 'yellow');
      }
    }
  }

  log(`\n📊 Summary: Assigned permission to ${assignmentCount} roles`, 'blue');
  return assignmentCount;
}

async function checkCurrentUserPermissions() {
  logSection('Checking Current User Permissions');

  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, r.name as role_name, r.display_name as role_display
       FROM users u
       JOIN user_roles ur ON u.id = ur.user_id
       JOIN roles r ON ur.role_id = r.id
       WHERE r.name IN ('admin', 'super_admin', 'administrator')
       AND ur.is_active = TRUE
       AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)
       ORDER BY u.email`
    );

    if (result.rows.length === 0) {
      log('❌ No admin users found', 'red');
      return false;
    }

    log('👥 Admin users found:', 'blue');
    result.rows.forEach(user => {
      log(`   • ${user.first_name} ${user.last_name} (${user.email}) - ${user.role_display}`, 'blue');
    });

    return true;
  } catch (error) {
    log('❌ Error checking users', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function verifyPermissionAssignment() {
  logSection('Verifying Permission Assignment');

  try {
    const result = await pool.query(
      `SELECT rp.*, r.name as role_name, r.display_name as role_display,
              p.name as permission_name, p.display_name as permission_display
       FROM role_permissions rp
       JOIN roles r ON rp.role_id = r.id
       JOIN permissions p ON rp.permission_id = p.id
       WHERE p.name = 'content.aboutus'`
    );

    if (result.rows.length === 0) {
      log('❌ content.aboutus permission not assigned to any roles', 'red');
      return false;
    }

    log('✅ Permission assignments found:', 'green');
    result.rows.forEach(assignment => {
      log(`   • ${assignment.role_display} has ${assignment.permission_display}`, 'green');
    });

    return true;
  } catch (error) {
    log('❌ Error verifying assignments', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function testUserPermissionRetrieval() {
  logSection('Testing User Permission Retrieval');

  try {
    // Test the permission query that the RBAC service uses
    const result = await pool.query(
      `SELECT DISTINCT p.name FROM user_roles ur
       JOIN role_permissions rp ON ur.role_id = rp.role_id
       JOIN permissions p ON rp.permission_id = p.id
       WHERE ur.is_active = TRUE
       AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)
       ORDER BY p.name`
    );

    const permissions = result.rows.map(row => row.name);
    const hasAboutPermission = permissions.includes('content.aboutus');

    log(`📊 Total permissions found: ${permissions.length}`, 'blue');

    if (hasAboutPermission) {
      log('✅ content.aboutus permission is retrievable', 'green');
    } else {
      log('❌ content.aboutus permission NOT retrievable', 'red');
      log('   This means users won\'t see the About Us tab', 'red');
    }

    // Show some permissions for debugging
    if (permissions.length > 0) {
      log('\n📋 Sample permissions:', 'blue');
      permissions.slice(0, 10).forEach(perm => {
        log(`   • ${perm}`, 'blue');
      });
      if (permissions.length > 10) {
        log(`   ... and ${permissions.length - 10} more`, 'blue');
      }
    }

    return hasAboutPermission;
  } catch (error) {
    log('❌ Error testing permission retrieval', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function refreshUserPermissions() {
  logSection('Refreshing User Permissions');

  try {
    // Clear permission cache if it exists
    const cacheExists = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_permission_cache')"
    );

    if (cacheExists.rows[0].exists) {
      await pool.query('DELETE FROM user_permission_cache');
      log('✅ Cleared user permission cache', 'green');
    } else {
      log('ℹ️  No permission cache table found (not using cache)', 'blue');
    }

    log('✅ Permission refresh completed', 'green');
    return true;
  } catch (error) {
    log('❌ Error refreshing permissions', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function validateFrontendConfiguration() {
  logSection('Validating Frontend Configuration');

  try {
    const fs = require('fs');
    const path = require('path');

    // Check permission mapping file
    const permissionMappingPath = 'utils/permission-mapping.ts';
    if (fs.existsSync(permissionMappingPath)) {
      const content = fs.readFileSync(permissionMappingPath, 'utf8');

      const hasAboutTab = content.includes('id: "about"') && content.includes('content.aboutus');
      if (hasAboutTab) {
        log('✅ About tab properly configured in permission mapping', 'green');
      } else {
        log('❌ About tab configuration missing in permission mapping', 'red');
      }
    } else {
      log('❌ Permission mapping file not found', 'red');
    }

    // Check admin page configuration
    const adminPagePath = 'app/admin/page.tsx';
    if (fs.existsSync(adminPagePath)) {
      const content = fs.readFileSync(adminPagePath, 'utf8');

      const hasAboutCase = content.includes('case "about"') && content.includes('EnhancedAboutManagement');
      if (hasAboutCase) {
        log('✅ About case properly configured in admin page', 'green');
      } else {
        log('❌ About case configuration missing in admin page', 'red');
      }
    } else {
      log('❌ Admin page file not found', 'red');
    }

    return true;
  } catch (error) {
    log('❌ Error validating frontend configuration', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function generateDiagnosticReport() {
  logSection('🔍 Running Complete Diagnostic');

  const report = {
    timestamp: new Date().toISOString(),
    checks: {
      databaseConnection: false,
      permissionExists: false,
      rolesExist: false,
      permissionAssigned: false,
      permissionRetrievable: false,
      frontendConfiguration: false
    },
    actions: [],
    recommendations: []
  };

  // Check database connection
  report.checks.databaseConnection = await checkDatabaseConnection();

  if (report.checks.databaseConnection) {
    // Check if permission exists
    let permission = await checkAboutUsPermission();
    report.checks.permissionExists = !!permission;

    // Create permission if it doesn't exist
    if (!permission) {
      permission = await createAboutUsPermission();
      if (permission) {
        report.checks.permissionExists = true;
        report.actions.push('Created content.aboutus permission');
      }
    }

    // Check roles
    const roles = await checkUserRoles();
    report.checks.rolesExist = roles.length > 0;

    // Assign permission to roles if we have a permission
    if (permission) {
      const assignmentCount = await assignAboutUsPermissionToRoles(permission);
      if (assignmentCount > 0) {
        report.actions.push(`Assigned permission to ${assignmentCount} admin roles`);
      }
    }

    // Check current users
    await checkCurrentUserPermissions();

    // Verify permission assignment
    report.checks.permissionAssigned = await verifyPermissionAssignment();

    // Test permission retrieval
    report.checks.permissionRetrievable = await testUserPermissionRetrieval();

    // Refresh permissions
    await refreshUserPermissions();
  }

  // Validate frontend
  report.checks.frontendConfiguration = await validateFrontendConfiguration();

  // Generate recommendations
  if (!report.checks.databaseConnection) {
    report.recommendations.push('Fix database connection issues');
  }

  if (!report.checks.permissionExists) {
    report.recommendations.push('Create content.aboutus permission in database');
  }

  if (!report.checks.rolesExist) {
    report.recommendations.push('Create admin roles in database');
  }

  if (!report.checks.permissionAssigned) {
    report.recommendations.push('Assign content.aboutus permission to admin roles');
  }

  if (!report.checks.permissionRetrievable) {
    report.recommendations.push('Fix permission retrieval query or user role assignments');
  }

  if (!report.checks.frontendConfiguration) {
    report.recommendations.push('Fix frontend permission mapping and admin page configuration');
  }

  // Save report
  try {
    const fs = require('fs');
    fs.writeFileSync('about-permission-diagnostic-report.json', JSON.stringify(report, null, 2));
    log('📄 Diagnostic report saved to: about-permission-diagnostic-report.json', 'blue');
  } catch (error) {
    log('⚠️  Could not save diagnostic report', 'yellow');
  }

  return report;
}

async function main() {
  try {
    log('🚀 Starting About Us Permission Diagnostic (PostgreSQL)...', 'bright');
    log(`⏰ Started at: ${new Date().toLocaleString()}`, 'blue');

    const report = await generateDiagnosticReport();

    logSection('🎯 Final Results');

    const criticalChecks = ['databaseConnection', 'permissionExists', 'permissionAssigned', 'permissionRetrievable'];
    const criticalPassed = criticalChecks.every(check => report.checks[check] === true);

    if (criticalPassed) {
      log('🎉 All critical checks passed! About Us tab should now be visible.', 'green');
      log('\n📋 Next steps:', 'blue');
      log('   1. Restart your development server (npm run dev)', 'blue');
      log('   2. Clear browser cache and refresh', 'blue');
      log('   3. Log out and back in to refresh permissions', 'blue');
      log('   4. Check the admin dashboard menu for "About Management"', 'blue');
    } else {
      log('⚠️  Some critical issues were found.', 'yellow');

      if (report.actions.length > 0) {
        log('\n✅ Actions taken:', 'green');
        report.actions.forEach(action => {
          log(`   • ${action}`, 'green');
        });
      }

      if (report.recommendations.length > 0) {
        log('\n📋 Remaining recommendations:', 'yellow');
        report.recommendations.forEach(rec => {
          log(`   • ${rec}`, 'yellow');
        });
      }

      log('\n🔄 Try the following:', 'blue');
      log('   1. Run this script again to see if issues are resolved', 'blue');
      log('   2. Restart your development server', 'blue');
      log('   3. Clear browser cache and refresh', 'blue');
      log('   4. Check database logs for any errors', 'blue');
    }

    // Final check summary
    log('\n📊 Check Summary:', 'cyan');
    Object.entries(report.checks).forEach(([check, passed]) => {
      const icon = passed ? '✅' : '❌';
      const color = passed ? 'green' : 'red';
      log(`   ${icon} ${check.replace(/([A-Z])/g, ' $1').toLowerCase()}`, color);
    });

  } catch (error) {
    log(`\n❌ Diagnostic failed: ${error.message}`, 'red');
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  log('\n🛑 Shutting down gracefully...', 'yellow');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log('\n🛑 Shutting down gracefully...', 'yellow');
  await pool.end();
  process.exit(0);
});

// Run the diagnostic if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  checkAboutUsPermission,
  createAboutUsPermission,
  assignAboutUsPermissionToRoles,
  verifyPermissionAssignment,
  testUserPermissionRetrieval,
  generateDiagnosticReport
};
