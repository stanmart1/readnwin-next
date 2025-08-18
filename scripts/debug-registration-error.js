const { query } = require('../utils/database');

async function debugRegistrationError() {
  try {
    console.log('🔍 Debugging Registration Error...\n');

    // 1. Check if roles table exists and its structure
    console.log('1. Checking roles table...');
    const rolesTableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'roles'
      );
    `);
    
    if (rolesTableExists.rows[0].exists) {
      console.log('✅ Roles table exists');
      
      // Check roles table structure
      const rolesColumns = await query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'roles'
        ORDER BY ordinal_position
      `);
      
      console.log('Roles table columns:');
      rolesColumns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
      // Check if reader role exists
      const readerRole = await query(`
        SELECT id, name, display_name 
        FROM roles 
        WHERE name = 'reader'
      `);
      
      if (readerRole.rows.length > 0) {
        console.log(`✅ Reader role found: ${readerRole.rows[0].display_name} (ID: ${readerRole.rows[0].id})`);
      } else {
        console.log('❌ Reader role not found!');
        
        // Check what roles exist
        const allRoles = await query('SELECT id, name, display_name FROM roles');
        console.log('Available roles:');
        allRoles.rows.forEach(role => {
          console.log(`  - ${role.name}: ${role.display_name} (ID: ${role.id})`);
        });
      }
    } else {
      console.log('❌ Roles table does not exist!');
    }

    // 2. Check if user_roles table exists
    console.log('\n2. Checking user_roles table...');
    const userRolesTableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_roles'
      );
    `);
    
    if (userRolesTableExists.rows[0].exists) {
      console.log('✅ User_roles table exists');
      
      // Check user_roles table structure
      const userRolesColumns = await query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'user_roles'
        ORDER BY ordinal_position
      `);
      
      console.log('User_roles table columns:');
      userRolesColumns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    } else {
      console.log('❌ User_roles table does not exist!');
    }

    // 3. Check if permissions table exists
    console.log('\n3. Checking permissions table...');
    const permissionsTableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'permissions'
      );
    `);
    
    if (permissionsTableExists.rows[0].exists) {
      console.log('✅ Permissions table exists');
    } else {
      console.log('❌ Permissions table does not exist!');
    }

    // 4. Check if role_permissions table exists
    console.log('\n4. Checking role_permissions table...');
    const rolePermissionsTableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'role_permissions'
      );
    `);
    
    if (rolePermissionsTableExists.rows[0].exists) {
      console.log('✅ Role_permissions table exists');
    } else {
      console.log('❌ Role_permissions table does not exist!');
    }

    // 5. Check if audit_logs table exists
    console.log('\n5. Checking audit_logs table...');
    const auditLogsTableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'audit_logs'
      );
    `);
    
    if (auditLogsTableExists.rows[0].exists) {
      console.log('✅ Audit_logs table exists');
    } else {
      console.log('❌ Audit_logs table does not exist!');
    }

    // 6. Check double opt-in setting
    console.log('\n6. Checking double opt-in setting...');
    const doubleOptIn = await query(`
      SELECT setting_value 
      FROM system_settings 
      WHERE setting_key = 'registration_double_opt_in'
    `);
    
    if (doubleOptIn.rows.length > 0) {
      console.log(`Double opt-in setting: ${doubleOptIn.rows[0].setting_value}`);
    } else {
      console.log('❌ Double opt-in setting not found!');
    }

    // 7. Test user creation query
    console.log('\n7. Testing user creation query...');
    try {
      const testUser = await query(`
        INSERT INTO users (email, username, password_hash, first_name, last_name, status, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
      `, [
        'test@example.com',
        'testuser',
        '$2b$12$test',
        'Test',
        'User',
        'active',
        true
      ]);
      
      console.log(`✅ Test user created successfully (ID: ${testUser.rows[0].id})`);
      
      // Clean up test user
      await query('DELETE FROM users WHERE id = $1', [testUser.rows[0].id]);
      console.log('✅ Test user cleaned up');
      
    } catch (error) {
      console.log('❌ User creation failed:', error.message);
    }

    // 8. Check for any missing columns in users table
    console.log('\n8. Checking users table structure...');
    const userColumns = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('Users table columns:');
    userColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    console.log('\n🔍 Registration Error Diagnosis Complete!');

  } catch (error) {
    console.error('❌ Error during registration debugging:', error);
  } finally {
    await query('SELECT 1'); // Keep connection alive
    process.exit(0);
  }
}

debugRegistrationError(); 