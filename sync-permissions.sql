-- Sync comprehensive permissions with database
INSERT INTO permissions (name, display_name, description, resource, action, scope) VALUES
-- User Management
('users.read', 'View Users', 'View user accounts and profiles', 'users', 'read', 'global'),
('users.create', 'Create Users', 'Create new user accounts', 'users', 'create', 'global'),
('users.update', 'Update Users', 'Edit existing user accounts', 'users', 'update', 'global'),
('users.delete', 'Delete Users', 'Remove user accounts', 'users', 'delete', 'global'),
('users.manage_roles', 'Manage User Roles', 'Assign and remove user roles', 'users', 'manage_roles', 'global'),

-- Role Management
('roles.read', 'View Roles', 'View system roles', 'roles', 'read', 'global'),
('roles.create', 'Create Roles', 'Create new roles', 'roles', 'create', 'global'),
('roles.update', 'Update Roles', 'Edit existing roles', 'roles', 'update', 'global'),
('roles.delete', 'Delete Roles', 'Remove roles', 'roles', 'delete', 'global'),
('roles.manage_permissions', 'Manage Role Permissions', 'Assign and remove role permissions', 'roles', 'manage_permissions', 'global'),

-- Permission Management
('permissions.read', 'View Permissions', 'View system permissions', 'permissions', 'read', 'global'),
('permissions.create', 'Create Permissions', 'Create new permissions', 'permissions', 'create', 'global'),
('permissions.update', 'Update Permissions', 'Edit existing permissions', 'permissions', 'update', 'global'),
('permissions.delete', 'Delete Permissions', 'Remove permissions', 'permissions', 'delete', 'global'),

-- Content Management
('content.read', 'View Content', 'View content items', 'content', 'read', 'global'),
('content.create', 'Create Content', 'Create new content', 'content', 'create', 'global'),
('content.update', 'Update Content', 'Edit existing content', 'content', 'update', 'global'),
('content.delete', 'Delete Content', 'Remove content', 'content', 'delete', 'global'),
('content.publish', 'Publish Content', 'Publish content to public', 'content', 'publish', 'global'),
('content.moderate', 'Moderate Content', 'Moderate user-generated content', 'content', 'moderate', 'global'),
('content.manage', 'Manage Content', 'Full content management access', 'content', 'manage', 'global'),

-- System Management
('system.settings', 'Manage System Settings', 'Configure system settings', 'system', 'settings', 'global'),
('system.analytics', 'View Analytics', 'Access system analytics', 'system', 'analytics', 'global'),
('system.audit_logs', 'View Audit Logs', 'Access audit logs', 'system', 'audit_logs', 'global'),

-- Order Management
('orders.create', 'Create Orders', 'Create new orders', 'orders', 'create', 'global'),
('orders.read', 'View Orders', 'View order information', 'orders', 'read', 'global'),
('orders.update', 'Update Orders', 'Edit existing orders', 'orders', 'update', 'global'),
('orders.cancel', 'Cancel Orders', 'Cancel orders', 'orders', 'cancel', 'global'),
('orders.delete', 'Delete Orders', 'Remove orders', 'orders', 'delete', 'global'),
('orders.view', 'View Order Details', 'View detailed order information', 'orders', 'view', 'global'),

-- E-commerce
('checkout.access', 'Access Checkout', 'Access checkout process', 'checkout', 'access', 'global'),
('checkout.complete', 'Complete Checkout', 'Complete checkout process', 'checkout', 'complete', 'global'),
('checkout.guest', 'Guest Checkout', 'Allow guest checkout', 'checkout', 'guest', 'global'),
('cart.access', 'Access Cart', 'Access shopping cart', 'cart', 'access', 'global'),
('cart.manage', 'Manage Cart', 'Manage shopping cart items', 'cart', 'manage', 'global'),
('payment.process', 'Process Payment', 'Process payments', 'payment', 'process', 'global'),
('payment.verify', 'Verify Payment', 'Verify payment status', 'payment', 'verify', 'global'),

-- Library Management
('library.access', 'Access Library', 'Access personal library', 'library', 'access', 'global'),
('library.manage', 'Manage Library', 'Manage library content', 'library', 'manage', 'global'),

-- Profile Management
('profile.read', 'View Own Profile', 'View own profile information', 'profile', 'read', 'global'),
('profile.update', 'Update Own Profile', 'Update own profile information', 'profile', 'update', 'global'),

-- Blog Management
('blog.read', 'View Blog Posts', 'View blog posts', 'blog', 'read', 'global'),
('blog.create', 'Create Blog Posts', 'Create new blog posts', 'blog', 'create', 'global'),
('blog.update', 'Update Blog Posts', 'Edit existing blog posts', 'blog', 'update', 'global'),
('blog.delete', 'Delete Blog Posts', 'Remove blog posts', 'blog', 'delete', 'global'),
('blog.publish', 'Publish Blog Posts', 'Publish blog posts', 'blog', 'publish', 'global'),

-- FAQ Management
('faq.read', 'View FAQs', 'View FAQ items', 'faq', 'read', 'global'),
('faq.create', 'Create FAQs', 'Create new FAQ items', 'faq', 'create', 'global'),
('faq.update', 'Update FAQs', 'Edit existing FAQ items', 'faq', 'update', 'global'),
('faq.delete', 'Delete FAQs', 'Remove FAQ items', 'faq', 'delete', 'global'),

-- Works Management
('works.read', 'View Works', 'View works portfolio', 'works', 'read', 'global'),
('works.create', 'Create Works', 'Create new works', 'works', 'create', 'global'),
('works.update', 'Update Works', 'Edit existing works', 'works', 'update', 'global'),
('works.delete', 'Delete Works', 'Remove works', 'works', 'delete', 'global'),

-- Email Management
('email.read', 'View Email Templates', 'View email templates', 'email', 'read', 'global'),
('email.create', 'Create Email Templates', 'Create new email templates', 'email', 'create', 'global'),
('email.update', 'Update Email Templates', 'Edit existing email templates', 'email', 'update', 'global'),
('email.delete', 'Delete Email Templates', 'Remove email templates', 'email', 'delete', 'global'),
('email.send', 'Send Emails', 'Send emails to users', 'email', 'send', 'global'),

-- About Management
('about.read', 'View About Content', 'View about page content', 'about', 'read', 'global'),
('about.update', 'Update About Content', 'Edit about page content', 'about', 'update', 'global'),

-- Contact Management
('contact.read', 'View Contact Info', 'View contact information', 'contact', 'read', 'global'),
('contact.update', 'Update Contact Info', 'Edit contact information', 'contact', 'update', 'global'),

-- Reading Analytics
('reading.analytics', 'View Reading Analytics', 'Access reading analytics', 'reading', 'analytics', 'global'),
('reading.reports', 'Generate Reading Reports', 'Generate reading reports', 'reading', 'reports', 'global'),

-- Reviews Management
('reviews.read', 'View Reviews', 'View user reviews', 'reviews', 'read', 'global'),
('reviews.moderate', 'Moderate Reviews', 'Moderate user reviews', 'reviews', 'moderate', 'global'),
('reviews.delete', 'Delete Reviews', 'Remove reviews', 'reviews', 'delete', 'global'),

-- Shipping Management
('shipping.read', 'View Shipping', 'View shipping information', 'shipping', 'read', 'global'),
('shipping.update', 'Update Shipping', 'Update shipping settings', 'shipping', 'update', 'global'),

-- Notifications
('notifications.read', 'View Notifications', 'View notifications', 'notifications', 'read', 'global'),
('notifications.create', 'Create Notifications', 'Create new notifications', 'notifications', 'create', 'global'),
('notifications.update', 'Update Notifications', 'Edit existing notifications', 'notifications', 'update', 'global'),
('notifications.delete', 'Delete Notifications', 'Remove notifications', 'notifications', 'delete', 'global'),

-- Books Management
('books.read', 'View Books', 'View books in the system', 'books', 'read', 'global'),
('books.create', 'Create Books', 'Add new books to the system', 'books', 'create', 'global'),
('books.update', 'Update Books', 'Edit existing books', 'books', 'update', 'global'),
('books.delete', 'Delete Books', 'Remove books from the system', 'books', 'delete', 'global'),
('books.manage', 'Manage Books', 'Full book management access', 'books', 'manage', 'global')

ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  resource = EXCLUDED.resource,
  action = EXCLUDED.action;

-- Assign all permissions to admin and super_admin roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name IN ('admin', 'super_admin')
ON CONFLICT (role_id, permission_id) DO NOTHING;