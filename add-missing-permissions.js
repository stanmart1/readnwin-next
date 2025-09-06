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

const missingPermissions = [
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

async function addMissingPermissions() {
  const client = await pool.connect();
  
  try {
    console.log('Adding missing permissions...');
    
    for (const permission of missingPermissions) {
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
      
      console.log(`✓ Added: ${permission.display_name}`);
    }
    
    console.log(`\n✅ Successfully added ${missingPermissions.length} permissions!`);
    
  } catch (error) {
    console.error('❌ Error adding permissions:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addMissingPermissions();