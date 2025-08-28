const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initializeRBACSystem() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Initializing RBAC System...');
    
    // Start transaction
    await client.query('BEGIN');
    
    // 1. Create RBAC tables if they don't exist
    console.log('📋 Creating RBAC tables...');
    
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        avatar_url TEXT,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending')),
        email_verified BOOLEAN DEFAULT FALSE,
        email_verification_token VARCHAR(255),
        email_verification_expires TIMESTAMP,
        welcome_email_sent BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );
    `);
    
    // Roles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        description TEXT,
        priority INTEGER DEFAULT 0,
        is_system_role BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Permissions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        description TEXT,
        resource VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        scope VARCHAR(20) DEFAULT 'global' CHECK (scope IN ('global', 'user', 'organization')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // User roles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
        assigned_by INTEGER REFERENCES users(id),
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        UNIQUE(user_id, role_id)
      );
    `);
    
    // Role permissions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id SERIAL PRIMARY KEY,
        role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
        permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
        granted_by INTEGER REFERENCES users(id),
        granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(role_id, permission_id)
      );
    `);
    
    // User permission cache table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_permission_cache (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        permission_name VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, permission_name)
      );
    `);
    
    // Audit logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50),
        resource_id INTEGER,
        details JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // 2. Create indexes for performance
    console.log('🔍 Creating indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
      'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);',
      'CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);',
      'CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);',
      'CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);',
      'CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_permission_cache_user_id ON user_permission_cache(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);'
    ];
    
    for (const indexQuery of indexes) {
      await client.query(indexQuery);
    }
    
    // 3. Insert system roles
    console.log('👥 Creating system roles...');
    
    const roles = [
      { name: 'super_admin', display_name: 'Super Administrator', description: 'Full system access with all permissions', priority: 100, is_system_role: true },
      { name: 'admin', display_name: 'Administrator', description: 'System administrator with most permissions', priority: 90, is_system_role: true },
      { name: 'moderator', display_name: 'Moderator', description: 'Content moderator with limited admin access', priority: 70, is_system_role: true },
      { name: 'author', display_name: 'Author', description: 'Content creator with publishing permissions', priority: 50, is_system_role: true },
      { name: 'editor', display_name: 'Editor', description: 'Content editor with review permissions', priority: 40, is_system_role: true },
      { name: 'reader', display_name: 'Reader', description: 'Standard user with basic permissions', priority: 10, is_system_role: true }
    ];
    
    for (const role of roles) {
      await client.query(`
        INSERT INTO roles (name, display_name, description, priority, is_system_role)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (name) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        description = EXCLUDED.description,
        priority = EXCLUDED.priority,
        is_system_role = EXCLUDED.is_system_role
      `, [role.name, role.display_name, role.description, role.priority, role.is_system_role]);
    }
    
    // 4. Insert comprehensive permissions
    console.log('🔐 Creating permissions...');
    
    const permissions = [
      // User Management
      { name: 'users.read', display_name: 'View Users', description: 'View user information', resource: 'users', action: 'read', scope: 'global' },
      { name: 'users.create', display_name: 'Create Users', description: 'Create new users', resource: 'users', action: 'create', scope: 'global' },
      { name: 'users.update', display_name: 'Update Users', description: 'Update user information', resource: 'users', action: 'update', scope: 'global' },
      { name: 'users.delete', display_name: 'Delete Users', description: 'Delete users', resource: 'users', action: 'delete', scope: 'global' },
      { name: 'users.manage_roles', display_name: 'Manage User Roles', description: 'Assign and remove roles from users', resource: 'users', action: 'manage_roles', scope: 'global' },
      
      // Role Management
      { name: 'roles.read', display_name: 'View Roles', description: 'View role information', resource: 'roles', action: 'read', scope: 'global' },
      { name: 'roles.create', display_name: 'Create Roles', description: 'Create new roles', resource: 'roles', action: 'create', scope: 'global' },
      { name: 'roles.update', display_name: 'Update Roles', description: 'Update role information', resource: 'roles', action: 'update', scope: 'global' },
      { name: 'roles.delete', display_name: 'Delete Roles', description: 'Delete roles', resource: 'roles', action: 'delete', scope: 'global' },
      { name: 'roles.manage_permissions', display_name: 'Manage Role Permissions', description: 'Assign and remove permissions from roles', resource: 'roles', action: 'manage_permissions', scope: 'global' },
      
      // Permission Management
      { name: 'permissions.read', display_name: 'View Permissions', description: 'View permission information', resource: 'permissions', action: 'read', scope: 'global' },
      { name: 'permissions.create', display_name: 'Create Permissions', description: 'Create new permissions', resource: 'permissions', action: 'create', scope: 'global' },
      { name: 'permissions.update', display_name: 'Update Permissions', description: 'Update permission information', resource: 'permissions', action: 'update', scope: 'global' },
      { name: 'permissions.delete', display_name: 'Delete Permissions', description: 'Delete permissions', resource: 'permissions', action: 'delete', scope: 'global' },
      
      // Books Management
      { name: 'books.read', display_name: 'View Books', description: 'View book information', resource: 'books', action: 'read', scope: 'global' },
      { name: 'books.create', display_name: 'Create Books', description: 'Create new books', resource: 'books', action: 'create', scope: 'global' },
      { name: 'books.update', display_name: 'Update Books', description: 'Update book information', resource: 'books', action: 'update', scope: 'global' },
      { name: 'books.delete', display_name: 'Delete Books', description: 'Delete books', resource: 'books', action: 'delete', scope: 'global' },
      
      // Authors Management
      { name: 'authors.read', display_name: 'View Authors', description: 'View author information', resource: 'authors', action: 'read', scope: 'global' },
      { name: 'authors.create', display_name: 'Create Authors', description: 'Create new authors', resource: 'authors', action: 'create', scope: 'global' },
      { name: 'authors.update', display_name: 'Update Authors', description: 'Update author information', resource: 'authors', action: 'update', scope: 'global' },
      { name: 'authors.delete', display_name: 'Delete Authors', description: 'Delete authors', resource: 'authors', action: 'delete', scope: 'global' },
      
      // Orders Management
      { name: 'orders.read', display_name: 'View Orders', description: 'View order information', resource: 'orders', action: 'read', scope: 'global' },
      { name: 'orders.create', display_name: 'Create Orders', description: 'Create new orders', resource: 'orders', action: 'create', scope: 'global' },
      { name: 'orders.update', display_name: 'Update Orders', description: 'Update order information', resource: 'orders', action: 'update', scope: 'global' },
      { name: 'orders.delete', display_name: 'Delete Orders', description: 'Delete orders', resource: 'orders', action: 'delete', scope: 'global' },
      
      // Content Management
      { name: 'content.read', display_name: 'View Content', description: 'View all content', resource: 'content', action: 'read', scope: 'global' },
      { name: 'content.create', display_name: 'Create Content', description: 'Create new content', resource: 'content', action: 'create', scope: 'global' },
      { name: 'content.update', display_name: 'Update Content', description: 'Update existing content', resource: 'content', action: 'update', scope: 'global' },
      { name: 'content.delete', display_name: 'Delete Content', description: 'Delete content', resource: 'content', action: 'delete', scope: 'global' },
      { name: 'content.publish', display_name: 'Publish Content', description: 'Publish content', resource: 'content', action: 'publish', scope: 'global' },
      { name: 'content.moderate', display_name: 'Moderate Content', description: 'Moderate user-generated content', resource: 'content', action: 'moderate', scope: 'global' },
      
      // System Management
      { name: 'system.settings', display_name: 'Manage System Settings', description: 'Manage system configuration', resource: 'system', action: 'settings', scope: 'global' },
      { name: 'system.analytics', display_name: 'View Analytics', description: 'View system analytics and reports', resource: 'system', action: 'analytics', scope: 'global' },
      { name: 'system.audit_logs', display_name: 'View Audit Logs', description: 'View system audit logs', resource: 'system', action: 'audit_logs', scope: 'global' },
      
      // Profile Management
      { name: 'profile.read', display_name: 'View Own Profile', description: 'View own user profile', resource: 'profile', action: 'read', scope: 'user' },
      { name: 'profile.update', display_name: 'Update Own Profile', description: 'Update own user profile', resource: 'profile', action: 'update', scope: 'user' },
      
      // Blog Management
      { name: 'blog.read', display_name: 'View Blog Posts', description: 'View blog posts', resource: 'blog', action: 'read', scope: 'global' },
      { name: 'blog.create', display_name: 'Create Blog Posts', description: 'Create new blog posts', resource: 'blog', action: 'create', scope: 'global' },
      { name: 'blog.update', display_name: 'Update Blog Posts', description: 'Update blog posts', resource: 'blog', action: 'update', scope: 'global' },
      { name: 'blog.delete', display_name: 'Delete Blog Posts', description: 'Delete blog posts', resource: 'blog', action: 'delete', scope: 'global' },
      
      // FAQ Management
      { name: 'faq.read', display_name: 'View FAQs', description: 'View FAQ entries', resource: 'faq', action: 'read', scope: 'global' },
      { name: 'faq.create', display_name: 'Create FAQs', description: 'Create new FAQ entries', resource: 'faq', action: 'create', scope: 'global' },
      { name: 'faq.update', display_name: 'Update FAQs', description: 'Update FAQ entries', resource: 'faq', action: 'update', scope: 'global' },
      { name: 'faq.delete', display_name: 'Delete FAQs', description: 'Delete FAQ entries', resource: 'faq', action: 'delete', scope: 'global' },
      
      // Email Management
      { name: 'email.read', display_name: 'View Email Templates', description: 'View email templates', resource: 'email', action: 'read', scope: 'global' },
      { name: 'email.create', display_name: 'Create Email Templates', description: 'Create new email templates', resource: 'email', action: 'create', scope: 'global' },
      { name: 'email.update', display_name: 'Update Email Templates', description: 'Update email templates', resource: 'email', action: 'update', scope: 'global' },
      { name: 'email.delete', display_name: 'Delete Email Templates', description: 'Delete email templates', resource: 'email', action: 'delete', scope: 'global' },
      { name: 'email.send', display_name: 'Send Emails', description: 'Send emails', resource: 'email', action: 'send', scope: 'global' },
      
      // About Management
      { name: 'about.read', display_name: 'View About Content', description: 'View about page content', resource: 'about', action: 'read', scope: 'global' },
      { name: 'about.update', display_name: 'Update About Content', description: 'Update about page content', resource: 'about', action: 'update', scope: 'global' },
      
      // Contact Management
      { name: 'contact.read', display_name: 'View Contact Info', description: 'View contact information', resource: 'contact', action: 'read', scope: 'global' },
      { name: 'contact.update', display_name: 'Update Contact Info', description: 'Update contact information', resource: 'contact', action: 'update', scope: 'global' },
      
      // Reviews Management
      { name: 'reviews.read', display_name: 'View Reviews', description: 'View book reviews', resource: 'reviews', action: 'read', scope: 'global' },
      { name: 'reviews.moderate', display_name: 'Moderate Reviews', description: 'Moderate book reviews', resource: 'reviews', action: 'moderate', scope: 'global' },
      { name: 'reviews.delete', display_name: 'Delete Reviews', description: 'Delete book reviews', resource: 'reviews', action: 'delete', scope: 'global' },
      
      // Shipping Management
      { name: 'shipping.read', display_name: 'View Shipping', description: 'View shipping information', resource: 'shipping', action: 'read', scope: 'global' },
      { name: 'shipping.update', display_name: 'Update Shipping', description: 'Update shipping settings', resource: 'shipping', action: 'update', scope: 'global' },
      
      // Notifications Management
      { name: 'notifications.read', display_name: 'View Notifications', description: 'View notifications', resource: 'notifications', action: 'read', scope: 'global' },
      { name: 'notifications.create', display_name: 'Create Notifications', description: 'Create notifications', resource: 'notifications', action: 'create', scope: 'global' },
      { name: 'notifications.update', display_name: 'Update Notifications', description: 'Update notifications', resource: 'notifications', action: 'update', scope: 'global' },
      { name: 'notifications.delete', display_name: 'Delete Notifications', description: 'Delete notifications', resource: 'notifications', action: 'delete', scope: 'global' },
      
      // Works Management
      { name: 'works.read', display_name: 'View Works', description: 'View works', resource: 'works', action: 'read', scope: 'global' },
      { name: 'works.create', display_name: 'Create Works', description: 'Create new works', resource: 'works', action: 'create', scope: 'global' },
      { name: 'works.update', display_name: 'Update Works', description: 'Update works', resource: 'works', action: 'update', scope: 'global' },
      { name: 'works.delete', display_name: 'Delete Works', description: 'Delete works', resource: 'works', action: 'delete', scope: 'global' }
    ];
    
    for (const permission of permissions) {
      await client.query(`
        INSERT INTO permissions (name, display_name, description, resource, action, scope)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (name) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        description = EXCLUDED.description,
        resource = EXCLUDED.resource,
        action = EXCLUDED.action,
        scope = EXCLUDED.scope
      `, [permission.name, permission.display_name, permission.description, permission.resource, permission.action, permission.scope]);
    }
    
    // 5. Assign permissions to roles
    console.log('🔗 Assigning permissions to roles...');
    
    // Super Admin gets all permissions
    await client.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'super_admin'
      ON CONFLICT (role_id, permission_id) DO NOTHING
    `);
    
    // Admin gets most permissions (except some system-level ones)
    const adminExcludedPermissions = ['system.settings', 'permissions.create', 'permissions.delete', 'roles.create', 'roles.delete'];
    const adminExcludedClause = adminExcludedPermissions.map(p => `'${p}'`).join(', ');
    
    await client.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.name = 'admin' 
      AND p.name NOT IN (${adminExcludedClause})
      ON CONFLICT (role_id, permission_id) DO NOTHING
    `);
    
    // Moderator gets content and user viewing permissions
    const moderatorPermissions = [
      'users.read', 'content.read', 'content.moderate', 'books.read', 'authors.read',
      'orders.read', 'reviews.read', 'reviews.moderate', 'reviews.delete',
      'blog.read', 'faq.read', 'profile.read', 'profile.update'
    ];
    
    for (const permName of moderatorPermissions) {
      await client.query(`
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p
        WHERE r.name = 'moderator' AND p.name = $1
        ON CONFLICT (role_id, permission_id) DO NOTHING
      `, [permName]);
    }
    
    // Author gets content creation permissions
    const authorPermissions = [
      'content.read', 'content.create', 'content.update', 'content.publish',
      'books.read', 'books.create', 'books.update', 'authors.read',
      'blog.read', 'blog.create', 'blog.update', 'profile.read', 'profile.update'
    ];
    
    for (const permName of authorPermissions) {
      await client.query(`
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p
        WHERE r.name = 'author' AND p.name = $1
        ON CONFLICT (role_id, permission_id) DO NOTHING
      `, [permName]);
    }
    
    // Editor gets content editing permissions
    const editorPermissions = [
      'content.read', 'content.update', 'books.read', 'books.update',
      'authors.read', 'blog.read', 'blog.update', 'profile.read', 'profile.update'
    ];
    
    for (const permName of editorPermissions) {
      await client.query(`
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p
        WHERE r.name = 'editor' AND p.name = $1
        ON CONFLICT (role_id, permission_id) DO NOTHING
      `, [permName]);
    }
    
    // Reader gets basic permissions
    const readerPermissions = ['content.read', 'books.read', 'profile.read', 'profile.update'];
    
    for (const permName of readerPermissions) {
      await client.query(`
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p
        WHERE r.name = 'reader' AND p.name = $1
        ON CONFLICT (role_id, permission_id) DO NOTHING
      `, [permName]);
    }
    
    // 6. Create default super admin user if it doesn't exist
    console.log('👤 Creating default super admin user...');
    
    const adminEmail = 'admin@readnwin.com';
    const adminPassword = 'Admin123!';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    const userResult = await client.query(`
      INSERT INTO users (email, username, password_hash, first_name, last_name, status, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      status = 'active',
      email_verified = true
      RETURNING id
    `, [adminEmail, 'admin', hashedPassword, 'System', 'Administrator', 'active', true]);
    
    const adminUserId = userResult.rows[0].id;
    
    // Assign super admin role to the user
    await client.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT $1, r.id FROM roles r
      WHERE r.name = 'super_admin'
      ON CONFLICT (user_id, role_id) DO UPDATE SET
      is_active = true
    `, [adminUserId]);
    
    // 7. Clear and rebuild permission cache for all users
    console.log('🔄 Rebuilding permission cache...');
    
    await client.query('DELETE FROM user_permission_cache');
    
    // Rebuild cache for all active users
    const usersWithRoles = await client.query(`
      SELECT DISTINCT ur.user_id
      FROM user_roles ur
      WHERE ur.is_active = true
    `);
    
    for (const userRow of usersWithRoles.rows) {
      const userId = userRow.user_id;
      
      // Get all permissions for this user
      const userPermissions = await client.query(`
        SELECT DISTINCT p.name
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = $1 AND ur.is_active = true
        AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)
      `, [userId]);
      
      // Cache each permission
      for (const permRow of userPermissions.rows) {
        await client.query(`
          INSERT INTO user_permission_cache (user_id, permission_name, is_active)
          VALUES ($1, $2, true)
          ON CONFLICT (user_id, permission_name) DO UPDATE SET
          is_active = true, cached_at = CURRENT_TIMESTAMP
        `, [userId, permRow.name]);
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('✅ RBAC System initialized successfully!');
    console.log(`📧 Default admin user: ${adminEmail}`);
    console.log(`🔑 Default admin password: ${adminPassword}`);
    console.log('⚠️  Please change the default password after first login!');
    
    // Display summary
    const roleCount = await client.query('SELECT COUNT(*) FROM roles');
    const permissionCount = await client.query('SELECT COUNT(*) FROM permissions');
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    
    console.log('\n📊 RBAC System Summary:');
    console.log(`   Roles: ${roleCount.rows[0].count}`);
    console.log(`   Permissions: ${permissionCount.rows[0].count}`);
    console.log(`   Users: ${userCount.rows[0].count}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error initializing RBAC system:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the initialization
if (require.main === module) {
  initializeRBACSystem()
    .then(() => {
      console.log('🎉 RBAC initialization completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 RBAC initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeRBACSystem };