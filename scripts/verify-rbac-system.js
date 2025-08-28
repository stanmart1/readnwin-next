const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function verifyRBACSystem() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Verifying RBAC System...\n');
    
    let allTestsPassed = true;
    
    // 1. Verify tables exist
    console.log('📋 Checking RBAC tables...');
    
    const requiredTables = [
      'users', 'roles', 'permissions', 'user_roles', 
      'role_permissions', 'user_permission_cache', 'audit_logs'
    ];
    
    for (const table of requiredTables) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [table]);
      
      if (result.rows[0].exists) {
        console.log(`   ✅ Table '${table}' exists`);
      } else {
        console.log(`   ❌ Table '${table}' missing`);
        allTestsPassed = false;
      }
    }
    
    // 2. Verify system roles exist
    console.log('\n👥 Checking system roles...');
    
    const requiredRoles = [
      'super_admin', 'admin', 'moderator', 'author', 'editor', 'reader'
    ];
    
    for (const roleName of requiredRoles) {
      const result = await client.query('SELECT id, name FROM roles WHERE name = $1', [roleName]);
      
      if (result.rows.length > 0) {
        console.log(`   ✅ Role '${roleName}' exists (ID: ${result.rows[0].id})`);
      } else {
        console.log(`   ❌ Role '${roleName}' missing`);
        allTestsPassed = false;
      }
    }
    
    // 3. Verify critical permissions exist
    console.log('\n🔐 Checking critical permissions...');
    
    const criticalPermissions = [
      'users.read', 'users.create', 'users.update', 'users.delete', 'users.manage_roles',
      'roles.read', 'roles.create', 'roles.update', 'roles.delete', 'roles.manage_permissions',
      'permissions.read', 'permissions.create', 'permissions.update', 'permissions.delete',
      'system.settings', 'system.analytics', 'system.audit_logs',
      'books.read', 'books.create', 'books.update', 'books.delete'
    ];
    
    for (const permName of criticalPermissions) {
      const result = await client.query('SELECT id, name FROM permissions WHERE name = $1', [permName]);
      
      if (result.rows.length > 0) {
        console.log(`   ✅ Permission '${permName}' exists (ID: ${result.rows[0].id})`);
      } else {
        console.log(`   ❌ Permission '${permName}' missing`);
        allTestsPassed = false;
      }
    }
    
    // 4. Verify super admin user exists
    console.log('\n👤 Checking super admin user...');
    
    const superAdminResult = await client.query(`
      SELECT u.id, u.email, u.username, u.status, r.name as role_name
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.name = 'super_admin' AND ur.is_active = true
    `);
    
    if (superAdminResult.rows.length > 0) {
      const admin = superAdminResult.rows[0];
      console.log(`   ✅ Super admin user exists: ${admin.email} (ID: ${admin.id}, Status: ${admin.status})`);
    } else {
      console.log('   ❌ No super admin user found');
      allTestsPassed = false;
    }
    
    // 5. Verify super admin has all permissions
    console.log('\n🔗 Checking super admin permissions...');
    
    const superAdminPermissions = await client.query(`
      SELECT COUNT(DISTINCT p.id) as permission_count
      FROM roles r
      JOIN role_permissions rp ON r.id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE r.name = 'super_admin'
    `);
    
    const totalPermissions = await client.query('SELECT COUNT(*) as total FROM permissions');
    
    const adminPermCount = parseInt(superAdminPermissions.rows[0].permission_count);
    const totalPermCount = parseInt(totalPermissions.rows[0].total);
    
    if (adminPermCount === totalPermCount) {
      console.log(`   ✅ Super admin has all permissions (${adminPermCount}/${totalPermCount})`);
    } else {
      console.log(`   ❌ Super admin missing permissions (${adminPermCount}/${totalPermCount})`);
      allTestsPassed = false;
    }
    
    // 6. Verify indexes exist
    console.log('\n🔍 Checking database indexes...');
    
    const requiredIndexes = [
      'idx_users_email', 'idx_users_username', 'idx_user_roles_user_id',
      'idx_role_permissions_role_id', 'idx_user_permission_cache_user_id'
    ];
    
    for (const indexName of requiredIndexes) {
      const result = await client.query(`
        SELECT indexname FROM pg_indexes 
        WHERE schemaname = 'public' AND indexname = $1
      `, [indexName]);
      
      if (result.rows.length > 0) {
        console.log(`   ✅ Index '${indexName}' exists`);
      } else {
        console.log(`   ⚠️  Index '${indexName}' missing (performance may be affected)`);
      }
    }
    
    // 7. Test permission checking functionality
    console.log('\n🧪 Testing permission checking...');
    
    if (superAdminResult.rows.length > 0) {
      const adminUserId = superAdminResult.rows[0].id;
      
      // Test direct permission check
      const permissionTest = await client.query(`
        SELECT 1 FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = $1 AND ur.is_active = TRUE
        AND p.name = 'users.read'
        AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)
      `, [adminUserId]);
      
      if (permissionTest.rows.length > 0) {
        console.log('   ✅ Permission checking works correctly');
      } else {
        console.log('   ❌ Permission checking failed');
        allTestsPassed = false;
      }
    }
    
    // 8. Verify permission cache functionality
    console.log('\n💾 Checking permission cache...');
    
    const cacheCount = await client.query('SELECT COUNT(*) as count FROM user_permission_cache');
    console.log(`   📊 Permission cache entries: ${cacheCount.rows[0].count}`);
    
    // 9. Display system statistics
    console.log('\n📊 RBAC System Statistics:');
    
    const stats = await Promise.all([
      client.query('SELECT COUNT(*) as count FROM users'),
      client.query('SELECT COUNT(*) as count FROM roles'),
      client.query('SELECT COUNT(*) as count FROM permissions'),
      client.query('SELECT COUNT(*) as count FROM user_roles WHERE is_active = true'),
      client.query('SELECT COUNT(*) as count FROM role_permissions'),
      client.query('SELECT COUNT(*) as count FROM audit_logs')
    ]);
    
    console.log(`   👥 Total Users: ${stats[0].rows[0].count}`);
    console.log(`   🛡️  Total Roles: ${stats[1].rows[0].count}`);
    console.log(`   🔐 Total Permissions: ${stats[2].rows[0].count}`);
    console.log(`   🔗 Active User-Role Assignments: ${stats[3].rows[0].count}`);
    console.log(`   ⚙️  Role-Permission Assignments: ${stats[4].rows[0].count}`);
    console.log(`   📝 Audit Log Entries: ${stats[5].rows[0].count}`);
    
    // 10. Check for potential issues
    console.log('\n🔍 Checking for potential issues...');
    
    // Check for users without roles
    const usersWithoutRoles = await client.query(`
      SELECT u.id, u.email FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id AND ur.is_active = true
      WHERE ur.user_id IS NULL AND u.status = 'active'
    `);
    
    if (usersWithoutRoles.rows.length > 0) {
      console.log(`   ⚠️  ${usersWithoutRoles.rows.length} active users without roles:`);
      usersWithoutRoles.rows.forEach(user => {
        console.log(`      - ${user.email} (ID: ${user.id})`);
      });
    } else {
      console.log('   ✅ All active users have roles assigned');
    }
    
    // Check for roles without permissions
    const rolesWithoutPermissions = await client.query(`
      SELECT r.id, r.name FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      WHERE rp.role_id IS NULL AND r.name != 'reader'
    `);
    
    if (rolesWithoutPermissions.rows.length > 0) {
      console.log(`   ⚠️  ${rolesWithoutPermissions.rows.length} roles without permissions:`);
      rolesWithoutPermissions.rows.forEach(role => {
        console.log(`      - ${role.name} (ID: ${role.id})`);
      });
    } else {
      console.log('   ✅ All roles have appropriate permissions');
    }
    
    // Check for expired role assignments
    const expiredAssignments = await client.query(`
      SELECT COUNT(*) as count FROM user_roles 
      WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP AND is_active = true
    `);
    
    if (parseInt(expiredAssignments.rows[0].count) > 0) {
      console.log(`   ⚠️  ${expiredAssignments.rows[0].count} expired role assignments still active`);
    } else {
      console.log('   ✅ No expired role assignments found');
    }
    
    // Final result
    console.log('\n' + '='.repeat(50));
    if (allTestsPassed) {
      console.log('🎉 RBAC System Verification: PASSED');
      console.log('✅ All critical components are working correctly');
    } else {
      console.log('❌ RBAC System Verification: FAILED');
      console.log('⚠️  Some critical issues need to be addressed');
    }
    console.log('='.repeat(50));
    
    return allTestsPassed;
    
  } catch (error) {
    console.error('💥 Error during RBAC verification:', error);
    return false;
  } finally {
    client.release();
  }
}

// Run the verification
if (require.main === module) {
  verifyRBACSystem()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Verification failed:', error);
      process.exit(1);
    });
}

module.exports = { verifyRBACSystem };