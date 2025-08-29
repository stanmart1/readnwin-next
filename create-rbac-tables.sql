-- Create RBAC tables for proper permission system

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 0,
  is_system_role BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  scope VARCHAR(100) DEFAULT 'global',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by INTEGER,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role_id)
);

-- Role permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  granted_by INTEGER,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role_id, permission_id)
);

-- User permission cache table
CREATE TABLE IF NOT EXISTS user_permission_cache (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  permission_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, permission_name)
);

-- Insert default roles
INSERT INTO roles (name, display_name, description, priority, is_system_role) VALUES
('super_admin', 'Super Administrator', 'Full system access', 100, true),
('admin', 'Administrator', 'Administrative access', 90, true),
('user', 'User', 'Basic user access', 10, true)
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (name, display_name, description, resource, action) VALUES
('books.read', 'Read Books', 'View books', 'books', 'read'),
('books.create', 'Create Books', 'Create new books', 'books', 'create'),
('books.update', 'Update Books', 'Edit existing books', 'books', 'update'),
('books.delete', 'Delete Books', 'Remove books', 'books', 'delete'),
('content.read', 'Read Content', 'View content', 'content', 'read'),
('content.create', 'Create Content', 'Create content', 'content', 'create'),
('content.update', 'Update Content', 'Edit content', 'content', 'update'),
('content.delete', 'Delete Content', 'Remove content', 'content', 'delete')
ON CONFLICT (name) DO NOTHING;

-- Assign all permissions to admin and super_admin roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name IN ('admin', 'super_admin')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign admin role to all existing users with admin role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.role = 'admin' AND r.name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_permission_cache_user_id ON user_permission_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permission_cache_permission ON user_permission_cache(permission_name);