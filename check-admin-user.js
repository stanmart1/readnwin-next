// Check admin user in database
const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || '149.102.159.118',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'S48lyoqo1mX7ytoiBvDZfCBB4TiCcGIU1rEdpu0NfBFP3V9q426PKDkGmV8aMD8b',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false, // SSL is disabled for the new database
});

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

async function checkAdminUser() {
  try {
    console.log('🔍 Checking admin user...\n');

    // Check admin user
    const adminUser = await query(`
      SELECT u.id, u.email, u.username, u.first_name, u.last_name, u.status, u.email_verified
      FROM users u
      WHERE u.email = 'admin@readnwin.com'
    `);

    if (adminUser.rows.length > 0) {
      const user = adminUser.rows[0];
      console.log('✅ Admin user found:');
      console.log('  ID:', user.id);
      console.log('  Email:', user.email);
      console.log('  Username:', user.username);
      console.log('  Name:', `${user.first_name} ${user.last_name}`);
      console.log('  Status:', user.status);
      console.log('  Email Verified:', user.email_verified);
      console.log('');

      // Check admin role
      const adminRole = await query(`
        SELECT r.name, r.display_name
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = $1
      `, [user.id]);

      if (adminRole.rows.length > 0) {
              console.log('✅ Current roles assigned:');
      adminRole.rows.forEach(role => {
        console.log('  Role:', role.name, `(${role.display_name})`);
      });
    } else {
      console.log('❌ No admin role assigned');
    }
    
    // Check if user already has super_admin role
    const hasSuperAdmin = adminRole.rows.some(role => role.name === 'super_admin');
    
    if (hasSuperAdmin) {
      console.log('\n✅ User already has super_admin role!');
    } else {
      console.log('\n🔧 Upgrading user to super_admin...');
      
      // Get the super_admin role ID
      const superAdminRole = await query(`
        SELECT id, name, display_name
        FROM roles
        WHERE name = 'super_admin'
      `);

      if (superAdminRole.rows.length === 0) {
        console.log('❌ super_admin role not found in database');
        return;
      }

      const superAdminRoleId = superAdminRole.rows[0].id;
      console.log('✅ Found super_admin role:', JSON.stringify(superAdminRole.rows[0], null, 2));

      // Remove any existing roles for the admin user
      await query(`
        DELETE FROM user_roles
        WHERE user_id = $1
      `, [user.id]);

      console.log('🗑️ Removed existing user roles');

      // Assign super_admin role to the admin user
      await query(`
        INSERT INTO user_roles (user_id, role_id, assigned_by, is_active)
        VALUES ($1, $2, $1, TRUE)
      `, [user.id, superAdminRoleId]);

      console.log('✅ Assigned super_admin role to admin user');

      // Verify the assignment
      const newRolesResult = await query(`
        SELECT r.name, r.display_name
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = $1 AND ur.is_active = TRUE
        ORDER BY r.priority DESC
      `, [user.id]);

      console.log('\n📋 New user roles:');
      newRolesResult.rows.forEach(role => {
        console.log(`  Role: ${role.name} (${role.display_name})`);
      });
    }
    
    console.log('');

    console.log('🔑 Login Credentials:');
    console.log('  Email: admin@readnwin.com');
    console.log('  Password: Admin123!');
    console.log('');
    console.log('🌐 Access admin dashboard at: http://localhost:3002/admin');
    console.log('\n⚠️ Note: You may need to log out and log back in to see the changes.');

    } else {
      console.log('❌ Admin user not found');
      console.log('Creating admin user...');
      
      // Create admin user
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('Admin123!', 12);
      
      const newUser = await query(`
        INSERT INTO users (email, username, password_hash, first_name, last_name, status, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, ['admin@readnwin.com', 'admin', passwordHash, 'System', 'Administrator', 'active', true]);

      // Assign super admin role
      await query(`
        INSERT INTO user_roles (user_id, role_id)
        SELECT $1, r.id FROM roles r WHERE r.name = 'super_admin'
      `, [newUser.rows[0].id]);

      console.log('✅ Admin user created successfully');
      console.log('🔑 Login Credentials:');
      console.log('  Email: admin@readnwin.com');
      console.log('  Password: Admin123!');
    }

  } catch (error) {
    console.error('❌ Error checking admin user:', error);
  } finally {
    await pool.end();
  }
}

// Run the check
checkAdminUser(); 