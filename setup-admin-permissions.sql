-- Setup comprehensive admin permissions for sidebar tabs

-- Insert all required permissions for admin tabs
INSERT INTO permissions (name, display_name, description, resource, action) VALUES
-- System permissions
('system.analytics', 'System Analytics', 'View system analytics and reports', 'system', 'analytics'),
('system.audit_logs', 'Audit Logs', 'View system audit logs', 'system', 'audit_logs'),
('system.settings', 'System Settings', 'Manage system settings', 'system', 'settings'),

-- User management permissions
('users.read', 'Read Users', 'View user accounts', 'users', 'read'),
('users.create', 'Create Users', 'Create new user accounts', 'users', 'create'),
('users.update', 'Update Users', 'Edit user accounts', 'users', 'update'),
('users.delete', 'Delete Users', 'Remove user accounts', 'users', 'delete'),

-- Role management permissions
('roles.read', 'Read Roles', 'View roles and permissions', 'roles', 'read'),
('roles.create', 'Create Roles', 'Create new roles', 'roles', 'create'),
('roles.update', 'Update Roles', 'Edit existing roles', 'roles', 'update'),
('roles.delete', 'Delete Roles', 'Remove roles', 'roles', 'delete'),

-- Content management permissions
('content.read', 'Read Content', 'View content', 'content', 'read'),
('content.create', 'Create Content', 'Create content', 'content', 'create'),
('content.update', 'Update Content', 'Edit content', 'content', 'update'),
('content.delete', 'Delete Content', 'Remove content', 'content', 'delete'),
('content.moderate', 'Moderate Content', 'Moderate user-generated content', 'content', 'moderate'),
('content.aboutus', 'About Us Management', 'Manage about us page content', 'content', 'aboutus'),

-- Book management permissions
('books.read', 'Read Books', 'View books', 'books', 'read'),
('books.create', 'Create Books', 'Create new books', 'books', 'create'),
('books.update', 'Update Books', 'Edit existing books', 'books', 'update'),
('books.delete', 'Delete Books', 'Remove books', 'books', 'delete'),

-- Order management permissions
('orders.read', 'Read Orders', 'View orders', 'orders', 'read'),
('orders.create', 'Create Orders', 'Create new orders', 'orders', 'create'),
('orders.update', 'Update Orders', 'Edit existing orders', 'orders', 'update'),
('orders.delete', 'Delete Orders', 'Remove orders', 'orders', 'delete')

ON CONFLICT (name) DO NOTHING;

-- Assign ALL permissions to super_admin role (wildcard equivalent)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'super_admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign comprehensive permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'admin' AND p.name IN (
  'system.analytics',
  'users.read', 'users.create', 'users.update',
  'roles.read',
  'content.read', 'content.create', 'content.update', 'content.moderate', 'content.aboutus',
  'books.read', 'books.create', 'books.update', 'books.delete',
  'orders.read', 'orders.update',
  'system.settings'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Update user permission cache for existing admin users
DELETE FROM user_permission_cache WHERE user_id IN (
  SELECT DISTINCT ur.user_id 
  FROM user_roles ur 
  JOIN roles r ON ur.role_id = r.id 
  WHERE r.name IN ('admin', 'super_admin')
);

-- Refresh permission cache for admin users
INSERT INTO user_permission_cache (user_id, permission_name)
SELECT DISTINCT ur.user_id, p.name
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE ur.is_active = TRUE AND r.name IN ('admin', 'super_admin')
ON CONFLICT (user_id, permission_name) DO NOTHING;