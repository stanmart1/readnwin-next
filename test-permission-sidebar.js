const { query } = require('./utils/database');

async function testPermissionSidebar() {
  try {
    console.log('🔍 Testing Permission-Based Admin Sidebar...\n');
    
    // Test 1: Check if permissions table has required permissions
    console.log('1. Checking required permissions in database...');
    const requiredPermissions = [
      'system.analytics', 'users.read', 'roles.read', 'system.audit_logs',
      'content.read', 'content.moderate', 'system.settings', 'content.aboutus'
    ];
    
    const permissionsResult = await query(`
      SELECT name FROM permissions 
      WHERE name = ANY($1)
      ORDER BY name
    `, [requiredPermissions]);
    
    const existingPermissions = permissionsResult.rows.map(row => row.name);
    const missingPermissions = requiredPermissions.filter(p => !existingPermissions.includes(p));
    
    console.log('✅ Existing permissions:', existingPermissions);
    if (missingPermissions.length > 0) {
      console.log('❌ Missing permissions:', missingPermissions);
    } else {
      console.log('✅ All required permissions exist');
    }
    
    // Test 2: Check admin role permissions
    console.log('\n2. Checking admin role permissions...');
    const adminPermissionsResult = await query(`
      SELECT p.name 
      FROM role_permissions rp
      JOIN roles r ON rp.role_id = r.id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE r.name = 'admin'
      ORDER BY p.name
    `);
    
    const adminPermissions = adminPermissionsResult.rows.map(row => row.name);
    console.log('✅ Admin role permissions:', adminPermissions);
    
    // Test 3: Check super_admin role permissions
    console.log('\n3. Checking super_admin role permissions...');
    const superAdminPermissionsResult = await query(`
      SELECT p.name 
      FROM role_permissions rp
      JOIN roles r ON rp.role_id = r.id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE r.name = 'super_admin'
      ORDER BY p.name
    `);
    
    const superAdminPermissions = superAdminPermissionsResult.rows.map(row => row.name);
    console.log('✅ Super admin role permissions:', superAdminPermissions);
    
    // Test 4: Check user role assignments
    console.log('\n4. Checking user role assignments...');
    const userRolesResult = await query(`
      SELECT u.email, r.name as role_name, ur.is_active
      FROM user_roles ur
      JOIN users u ON ur.user_id = u.id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.name IN ('admin', 'super_admin')
      ORDER BY u.email
    `);
    
    console.log('✅ Admin users:');
    userRolesResult.rows.forEach(row => {
      console.log(`   ${row.email} -> ${row.role_name} (${row.is_active ? 'active' : 'inactive'})`);
    });
    
    // Test 5: Simulate permission check for a user
    if (userRolesResult.rows.length > 0) {
      const testUser = userRolesResult.rows[0];
      console.log(`\n5. Testing permissions for user: ${testUser.email}`);
      
      const userPermissionsResult = await query(`
        SELECT DISTINCT p.name 
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        JOIN users u ON ur.user_id = u.id
        WHERE u.email = $1 AND ur.is_active = TRUE
        ORDER BY p.name
      `, [testUser.email]);
      
      const userPermissions = userPermissionsResult.rows.map(row => row.name);
      console.log('✅ User permissions:', userPermissions);
      
      // Check which tabs would be visible
      const tabPermissions = {
        'overview': ['system.analytics'],
        'users': ['users.read'],
        'roles': ['roles.read'],
        'audit': ['system.audit_logs'],
        'books': ['content.read'],
        'reviews': ['content.moderate'],
        'settings': ['system.settings']
      };
      
      console.log('\n📋 Visible tabs for this user:');
      Object.entries(tabPermissions).forEach(([tab, requiredPerms]) => {
        const hasAccess = requiredPerms.some(perm => userPermissions.includes(perm));
        console.log(`   ${tab}: ${hasAccess ? '✅ Visible' : '❌ Hidden'}`);
      });
    }
    
    console.log('\n🎉 Permission-based sidebar test complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPermissionSidebar();