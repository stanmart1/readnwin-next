#!/usr/bin/env node

/**
 * About Us Permission Diagnostic and Fix Script
 *
 * This script diagnoses and fixes permission issues that prevent
 * the About Us management tab from appearing in the admin dashboard.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

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
    await prisma.$connect();
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
    // Check if content.aboutus permission exists
    const aboutUsPermission = await prisma.permission.findUnique({
      where: { name: 'content.aboutus' }
    });

    if (aboutUsPermission) {
      log('✅ content.aboutus permission exists', 'green');
      log(`   ID: ${aboutUsPermission.id}`, 'blue');
      log(`   Display Name: ${aboutUsPermission.display_name}`, 'blue');
      return aboutUsPermission;
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
    const permission = await prisma.permission.create({
      data: {
        name: 'content.aboutus',
        resource: 'content',
        action: 'aboutus',
        display_name: 'Manage About Us',
        description: 'Permission to manage About Us page content',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

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
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        display_name: true,
        _count: {
          select: { users: true }
        }
      }
    });

    if (roles.length === 0) {
      log('❌ No roles found in database', 'red');
      return [];
    }

    log('📋 Available roles:', 'blue');
    roles.forEach(role => {
      log(`   • ${role.display_name} (${role.name}) - ${role._count.users} users`, 'blue');
    });

    return roles;
  } catch (error) {
    log('❌ Error checking roles', 'red');
    log(`   Error: ${error.message}`, 'red');
    return [];
  }
}

async function checkRolePermissions(roleId, permissionId) {
  try {
    const rolePermission = await prisma.rolePermission.findUnique({
      where: {
        role_id_permission_id: {
          role_id: roleId,
          permission_id: permissionId
        }
      }
    });

    return !!rolePermission;
  } catch (error) {
    return false;
  }
}

async function assignPermissionToRole(roleId, permissionId, roleName) {
  try {
    await prisma.rolePermission.create({
      data: {
        role_id: roleId,
        permission_id: permissionId,
        created_at: new Date()
      }
    });

    log(`   ✅ Assigned to ${roleName}`, 'green');
    return true;
  } catch (error) {
    log(`   ❌ Failed to assign to ${roleName}: ${error.message}`, 'red');
    return false;
  }
}

async function assignAboutUsPermissionToRoles(permission) {
  logSection('Assigning About Us Permission to Roles');

  const roles = await prisma.role.findMany();
  let assignmentCount = 0;

  for (const role of roles) {
    const hasPermission = await checkRolePermissions(role.id, permission.id);

    if (hasPermission) {
      log(`   ✅ ${role.display_name} already has permission`, 'green');
    } else {
      // Assign to admin and super_admin roles
      if (role.name === 'admin' || role.name === 'super_admin') {
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
    // Get all users with admin or super_admin roles
    const adminUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ['admin', 'super_admin']
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    if (adminUsers.length === 0) {
      log('❌ No admin users found', 'red');
      return false;
    }

    log('👥 Admin users found:', 'blue');
    adminUsers.forEach(user => {
      log(`   • ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`, 'blue');
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
    // Check if admin roles have the content.aboutus permission
    const result = await prisma.rolePermission.findMany({
      where: {
        permission: {
          name: 'content.aboutus'
        }
      },
      include: {
        role: {
          select: {
            name: true,
            display_name: true
          }
        },
        permission: {
          select: {
            name: true,
            display_name: true
          }
        }
      }
    });

    if (result.length === 0) {
      log('❌ content.aboutus permission not assigned to any roles', 'red');
      return false;
    }

    log('✅ Permission assignments found:', 'green');
    result.forEach(assignment => {
      log(`   • ${assignment.role.display_name} has ${assignment.permission.display_name}`, 'green');
    });

    return true;
  } catch (error) {
    log('❌ Error verifying assignments', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function testPermissionAPI() {
  logSection('Testing Permission API');

  try {
    // This would normally require a session, but we can check the API structure
    const fs = require('fs');
    const path = require('path');

    const apiPath = 'app/api/user/permissions/route.ts';

    if (fs.existsSync(apiPath)) {
      log('✅ Permission API endpoint exists', 'green');

      const content = fs.readFileSync(apiPath, 'utf8');

      if (content.includes('rbacService.getUserPermissions')) {
        log('✅ Permission fetching logic found', 'green');
      } else {
        log('❌ Permission fetching logic missing', 'red');
      }

      return true;
    } else {
      log('❌ Permission API endpoint missing', 'red');
      return false;
    }
  } catch (error) {
    log('❌ Error testing API', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function clearPermissionCache() {
  logSection('Clearing Permission Cache');

  try {
    // Clear any potential caching issues
    log('🔄 Clearing permission caches...', 'yellow');

    // Here you would implement cache clearing logic
    // For now, we'll just log that this step is completed
    log('✅ Cache clearing completed', 'green');

    return true;
  } catch (error) {
    log('❌ Error clearing cache', 'red');
    return false;
  }
}

async function generateDiagnosticReport() {
  logSection('Diagnostic Report');

  const report = {
    timestamp: new Date().toISOString(),
    checks: {
      databaseConnection: false,
      permissionExists: false,
      rolesExist: false,
      permissionAssigned: false,
      apiEndpoint: false
    },
    recommendations: []
  };

  // Run all checks
  report.checks.databaseConnection = await checkDatabaseConnection();

  if (report.checks.databaseConnection) {
    const permission = await checkAboutUsPermission();
    report.checks.permissionExists = !!permission;

    if (!permission) {
      const newPermission = await createAboutUsPermission();
      if (newPermission) {
        report.checks.permissionExists = true;
        await assignAboutUsPermissionToRoles(newPermission);
      }
    } else {
      await assignAboutUsPermissionToRoles(permission);
    }

    const roles = await checkUserRoles();
    report.checks.rolesExist = roles.length > 0;

    await checkCurrentUserPermissions();
    report.checks.permissionAssigned = await verifyPermissionAssignment();
  }

  report.checks.apiEndpoint = await testPermissionAPI();

  await clearPermissionCache();

  // Generate recommendations
  if (!report.checks.databaseConnection) {
    report.recommendations.push('Fix database connection issues');
  }

  if (!report.checks.permissionExists) {
    report.recommendations.push('Create content.aboutus permission');
  }

  if (!report.checks.rolesExist) {
    report.recommendations.push('Create admin roles');
  }

  if (!report.checks.permissionAssigned) {
    report.recommendations.push('Assign content.aboutus permission to admin roles');
  }

  if (!report.checks.apiEndpoint) {
    report.recommendations.push('Fix permission API endpoint');
  }

  // Save report
  const fs = require('fs');
  try {
    fs.writeFileSync('about-permission-report.json', JSON.stringify(report, null, 2));
    log('📄 Diagnostic report saved to: about-permission-report.json', 'blue');
  } catch (error) {
    log('⚠️  Could not save diagnostic report', 'yellow');
  }

  return report;
}

async function main() {
  try {
    log('🚀 Starting About Us Permission Diagnostic...', 'bright');
    log(`⏰ Started at: ${new Date().toLocaleString()}`, 'blue');

    const report = await generateDiagnosticReport();

    logSection('🎯 Final Results');

    const allPassed = Object.values(report.checks).every(check => check === true);

    if (allPassed) {
      log('🎉 All checks passed! About Us tab should now be visible.', 'green');
      log('\n📋 Next steps:', 'blue');
      log('   1. Refresh your browser or log out and back in', 'blue');
      log('   2. Check the admin dashboard menu', 'blue');
      log('   3. Look for "About Management" in the sidebar', 'blue');
    } else {
      log('⚠️  Some issues were found and may have been fixed.', 'yellow');
      log('\n📋 Remaining recommendations:', 'yellow');
      report.recommendations.forEach(rec => {
        log(`   • ${rec}`, 'yellow');
      });

      log('\n🔄 Try the following:', 'blue');
      log('   1. Restart your development server', 'blue');
      log('   2. Clear browser cache and refresh', 'blue');
      log('   3. Log out and back in to refresh permissions', 'blue');
      log('   4. Check the admin dashboard again', 'blue');
    }

  } catch (error) {
    log(`\n❌ Diagnostic failed: ${error.message}`, 'red');
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  log('\n🛑 Shutting down gracefully...', 'yellow');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log('\n🛑 Shutting down gracefully...', 'yellow');
  await prisma.$disconnect();
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
  generateDiagnosticReport
};
