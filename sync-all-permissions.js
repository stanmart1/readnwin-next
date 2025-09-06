#!/usr/bin/env node

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const allPermissions = [
  // Users Management
  { name: 'users.read', display_name: 'View Users', description: 'View user information', resource: 'users', action: 'read', scope: 'global' },
  { name: 'users.create', display_name: 'Create Users', description: 'Create new users', resource: 'users', action: 'create', scope: 'global' },
  { name: 'users.update', display_name: 'Update Users', description: 'Update user information', resource: 'users', action: 'update', scope: 'global' },
  { name: 'users.delete', display_name: 'Delete Users', description: 'Delete users', resource: 'users', action: 'delete', scope: 'global' },
  { name: 'users.manage_roles', display_name: 'Manage User Roles', description: 'Assign and remove roles from users', resource: 'users', action: 'manage_roles', scope: 'global' },
  
  // Roles Management
  { name: 'roles.read', display_name: 'View Roles', description: 'View role information', resource: 'roles', action: 'read', scope: 'global' },
  { name: 'roles.create', display_name: 'Create Roles', description: 'Create new roles', resource: 'roles', action: 'create', scope: 'global' },
  { name: 'roles.update', display_name: 'Update Roles', description: 'Update role information', resource: 'roles', action: 'update', scope: 'global' },
  { name: 'roles.delete', display_name: 'Delete Roles', description: 'Delete roles', resource: 'roles', action: 'delete', scope: 'global' },
  { name: 'roles.manage_permissions', display_name: 'Manage Role Permissions', description: 'Assign and remove permissions from roles', resource: 'roles', action: 'manage_permissions', scope: 'global' },
  
  // Permissions Management
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
  
  // Categories Management
  { name: 'categories.read', display_name: 'View Categories', description: 'View book categories', resource: 'categories', action: 'read', scope: 'global' },
  { name: 'categories.create', display_name: 'Create Categories', description: 'Create new categories', resource: 'categories', action: 'create', scope: 'global' },
  { name: 'categories.update', display_name: 'Update Categories', description: 'Update categories', resource: 'categories', action: 'update', scope: 'global' },
  { name: 'categories.delete', display_name: 'Delete Categories', description: 'Delete categories', resource: 'categories', action: 'delete', scope: 'global' },
  
  // Orders Management
  { name: 'orders.read', display_name: 'View Orders', description: 'View order information', resource: 'orders', action: 'read', scope: 'global' },
  { name: 'orders.create', display_name: 'Create Orders', description: 'Create new orders', resource: 'orders', action: 'create', scope: 'global' },
  { name: 'orders.update', display_name: 'Update Orders', description: 'Update order information', resource: 'orders', action: 'update', scope: 'global' },
  { name: 'orders.delete', display_name: 'Delete Orders', description: 'Delete orders', resource: 'orders', action: 'delete', scope: 'global' },
  
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
  { name: 'works.delete', display_name: 'Delete Works', description: 'Delete works', resource: 'works', action: 'delete', scope: 'global' },
  
  // System Management
  { name: 'system.settings', display_name: 'Manage System Settings', description: 'Manage system configuration', resource: 'system', action: 'settings', scope: 'global' },
  { name: 'system.analytics', display_name: 'View Analytics', description: 'View system analytics and reports', resource: 'system', action: 'analytics', scope: 'global' },
  { name: 'system.audit_logs', display_name: 'View Audit Logs', description: 'View system audit logs', resource: 'system', action: 'audit_logs', scope: 'global' },
  
  // Profile Management
  { name: 'profile.read', display_name: 'View Own Profile', description: 'View own user profile', resource: 'profile', action: 'read', scope: 'user' },
  { name: 'profile.update', display_name: 'Update Own Profile', description: 'Update own user profile', resource: 'profile', action: 'update', scope: 'user' },
  
  // User Libraries Management
  { name: 'libraries.read', display_name: 'View User Libraries', description: 'View user library information', resource: 'libraries', action: 'read', scope: 'global' },
  { name: 'libraries.manage', display_name: 'Manage User Libraries', description: 'Manage user library assignments', resource: 'libraries', action: 'manage', scope: 'global' },
  
  // Analytics Management
  { name: 'analytics.read', display_name: 'View Reading Analytics', description: 'View reading analytics and reports', resource: 'analytics', action: 'read', scope: 'global' },
  
  // Footer Management
  { name: 'footer.read', display_name: 'View Footer Settings', description: 'View footer configuration', resource: 'footer', action: 'read', scope: 'global' },
  { name: 'footer.update', display_name: 'Update Footer Settings', description: 'Update footer configuration', resource: 'footer', action: 'update', scope: 'global' },
  
  // Payment Management
  { name: 'payment.read', display_name: 'View Payment Settings', description: 'View payment gateway settings', resource: 'payment', action: 'read', scope: 'global' },
  { name: 'payment.update', display_name: 'Update Payment Settings', description: 'Update payment gateway settings', resource: 'payment', action: 'update', scope: 'global' }
];

async function syncAllPermissions() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Syncing all permissions with the application...');
    
    let added = 0;
    let updated = 0;
    
    for (const permission of allPermissions) {
      const result = await client.query(`
        INSERT INTO permissions (name, display_name, description, resource, action, scope)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (name) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        description = EXCLUDED.description,
        resource = EXCLUDED.resource,
        action = EXCLUDED.action,
        scope = EXCLUDED.scope
        RETURNING (xmax = 0) AS inserted
      `, [permission.name, permission.display_name, permission.description, permission.resource, permission.action, permission.scope]);
      
      if (result.rows[0].inserted) {
        added++;
        console.log(`✓ Added: ${permission.display_name}`);
      } else {
        updated++;
        console.log(`↻ Updated: ${permission.display_name}`);
      }
    }
    
    console.log(`\n✅ Sync completed!`);
    console.log(`   📝 Added: ${added} permissions`);
    console.log(`   🔄 Updated: ${updated} permissions`);
    console.log(`   📊 Total: ${allPermissions.length} permissions`);
    
  } catch (error) {
    console.error('❌ Error syncing permissions:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

syncAllPermissions();