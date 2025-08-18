-- RBAC Database Schema for ReadnWin Admin Dashboard

-- Users table
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

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 0,
  is_system_role BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
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

-- User roles (many-to-many)
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

-- Role permissions (many-to-many)
CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  granted_by INTEGER REFERENCES users(id),
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role_id, permission_id)
);

-- User permissions cache (for performance)
CREATE TABLE IF NOT EXISTS user_permission_cache (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  permission_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, permission_name)
);

-- Audit log
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

-- System settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_permission_cache_user_id ON user_permission_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- Insert default system roles
INSERT INTO roles (name, display_name, description, priority, is_system_role) VALUES
('super_admin', 'Super Administrator', 'Full system access with all permissions', 100, TRUE),
('admin', 'Administrator', 'System administrator with most permissions', 90, TRUE),
('moderator', 'Moderator', 'Content moderator with limited admin access', 70, TRUE),
('author', 'Author', 'Content creator with publishing permissions', 50, TRUE),
('editor', 'Editor', 'Content editor with review permissions', 40, TRUE),
('reader', 'Reader', 'Standard user with basic permissions', 10, TRUE)
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (name, display_name, description, resource, action, scope) VALUES
-- User management permissions
('users.read', 'View Users', 'View user information', 'users', 'read', 'global'),
('users.create', 'Create Users', 'Create new users', 'users', 'create', 'global'),
('users.update', 'Update Users', 'Update user information', 'users', 'update', 'global'),
('users.delete', 'Delete Users', 'Delete users', 'users', 'delete', 'global'),
('users.manage_roles', 'Manage User Roles', 'Assign and remove roles from users', 'users', 'manage_roles', 'global'),

-- Role management permissions
('roles.read', 'View Roles', 'View role information', 'roles', 'read', 'global'),
('roles.create', 'Create Roles', 'Create new roles', 'roles', 'create', 'global'),
('roles.update', 'Update Roles', 'Update role information', 'roles', 'update', 'global'),
('roles.delete', 'Delete Roles', 'Delete roles', 'roles', 'delete', 'global'),
('roles.manage_permissions', 'Manage Role Permissions', 'Assign and remove permissions from roles', 'roles', 'manage_permissions', 'global'),

-- Permission management permissions
('permissions.read', 'View Permissions', 'View permission information', 'permissions', 'read', 'global'),
('permissions.create', 'Create Permissions', 'Create new permissions', 'permissions', 'create', 'global'),
('permissions.update', 'Update Permissions', 'Update permission information', 'permissions', 'update', 'global'),
('permissions.delete', 'Delete Permissions', 'Delete permissions', 'permissions', 'delete', 'global'),

-- Content management permissions
('content.read', 'View Content', 'View all content', 'content', 'read', 'global'),
('content.create', 'Create Content', 'Create new content', 'content', 'create', 'global'),
('content.update', 'Update Content', 'Update existing content', 'content', 'update', 'global'),
('content.delete', 'Delete Content', 'Delete content', 'content', 'delete', 'global'),
('content.publish', 'Publish Content', 'Publish content', 'content', 'publish', 'global'),
('content.moderate', 'Moderate Content', 'Moderate user-generated content', 'content', 'moderate', 'global'),

-- System management permissions
('system.settings', 'Manage System Settings', 'Manage system configuration', 'system', 'settings', 'global'),
('system.analytics', 'View Analytics', 'View system analytics and reports', 'system', 'analytics', 'global'),
('system.audit_logs', 'View Audit Logs', 'View system audit logs', 'system', 'audit_logs', 'global'),

-- User-specific permissions
('profile.read', 'View Own Profile', 'View own user profile', 'profile', 'read', 'user'),
('profile.update', 'Update Own Profile', 'Update own user profile', 'profile', 'update', 'user')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
-- Super Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'super_admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Admin gets most permissions (except system-level ones)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'admin' 
AND p.name NOT IN ('system.settings', 'system.analytics', 'system.audit_logs')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Moderator gets content moderation and user viewing permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'moderator' 
AND p.name IN ('users.read', 'content.read', 'content.moderate', 'profile.read', 'profile.update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Author gets content creation and own content management permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'author' 
AND p.name IN ('content.read', 'content.create', 'content.update', 'content.publish', 'profile.read', 'profile.update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Editor gets content editing permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'editor' 
AND p.name IN ('content.read', 'content.update', 'profile.read', 'profile.update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Reader gets basic permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'reader' 
AND p.name IN ('content.read', 'profile.read', 'profile.update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Create a default super admin user (password: Admin123!)
-- You should change this password in production
INSERT INTO users (email, username, password_hash, first_name, last_name, status, email_verified)
VALUES (
  'admin@readnwin.com',
  'admin',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', -- Admin123!
  'System',
  'Administrator',
  'active',
  TRUE
) ON CONFLICT (email) DO NOTHING;

-- Assign super admin role to the default admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'admin@readnwin.com' AND r.name = 'super_admin'
ON CONFLICT (user_id, role_id) DO NOTHING; 