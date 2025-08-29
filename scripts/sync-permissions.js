const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false
});

const permissions = [
  // User Management
  { name: "users.read", display_name: "View Users", description: "View user accounts and profiles", resource: "users", action: "read" },
  { name: "users.create", display_name: "Create Users", description: "Create new user accounts", resource: "users", action: "create" },
  { name: "users.update", display_name: "Update Users", description: "Edit existing user accounts", resource: "users", action: "update" },
  { name: "users.delete", display_name: "Delete Users", description: "Remove user accounts", resource: "users", action: "delete" },
  { name: "users.manage_roles", display_name: "Manage User Roles", description: "Assign and remove user roles", resource: "users", action: "manage_roles" },

  // Role Management
  { name: "roles.read", display_name: "View Roles", description: "View system roles", resource: "roles", action: "read" },
  { name: "roles.create", display_name: "Create Roles", description: "Create new roles", resource: "roles", action: "create" },
  { name: "roles.update", display_name: "Update Roles", description: "Edit existing roles", resource: "roles", action: "update" },
  { name: "roles.delete", display_name: "Delete Roles", description: "Remove roles", resource: "roles", action: "delete" },
  { name: "roles.manage_permissions", display_name: "Manage Role Permissions", description: "Assign and remove role permissions", resource: "roles", action: "manage_permissions" },

  // Permission Management
  { name: "permissions.read", display_name: "View Permissions", description: "View system permissions", resource: "permissions", action: "read" },
  { name: "permissions.create", display_name: "Create Permissions", description: "Create new permissions", resource: "permissions", action: "create" },
  { name: "permissions.update", display_name: "Update Permissions", description: "Edit existing permissions", resource: "permissions", action: "update" },
  { name: "permissions.delete", display_name: "Delete Permissions", description: "Remove permissions", resource: "permissions", action: "delete" },

  // Content Management
  { name: "content.read", display_name: "View Content", description: "View content items", resource: "content", action: "read" },
  { name: "content.create", display_name: "Create Content", description: "Create new content", resource: "content", action: "create" },
  { name: "content.update", display_name: "Update Content", description: "Edit existing content", resource: "content", action: "update" },
  { name: "content.delete", display_name: "Delete Content", description: "Remove content", resource: "content", action: "delete" },
  { name: "content.publish", display_name: "Publish Content", description: "Publish content to public", resource: "content", action: "publish" },
  { name: "content.moderate", display_name: "Moderate Content", description: "Moderate user-generated content", resource: "content", action: "moderate" },
  { name: "content.manage", display_name: "Manage Content", description: "Full content management access", resource: "content", action: "manage" },

  // System Management
  { name: "system.settings", display_name: "Manage System Settings", description: "Configure system settings", resource: "system", action: "settings" },
  { name: "system.analytics", display_name: "View Analytics", description: "Access system analytics", resource: "system", action: "analytics" },
  { name: "system.audit_logs", display_name: "View Audit Logs", description: "Access audit logs", resource: "system", action: "audit_logs" },

  // Order Management
  { name: "orders.create", display_name: "Create Orders", description: "Create new orders", resource: "orders", action: "create" },
  { name: "orders.read", display_name: "View Orders", description: "View order information", resource: "orders", action: "read" },
  { name: "orders.update", display_name: "Update Orders", description: "Edit existing orders", resource: "orders", action: "update" },
  { name: "orders.cancel", display_name: "Cancel Orders", description: "Cancel orders", resource: "orders", action: "cancel" },
  { name: "orders.delete", display_name: "Delete Orders", description: "Remove orders", resource: "orders", action: "delete" },
  { name: "orders.view", display_name: "View Order Details", description: "View detailed order information", resource: "orders", action: "view" },

  // E-commerce
  { name: "checkout.access", display_name: "Access Checkout", description: "Access checkout process", resource: "checkout", action: "access" },
  { name: "checkout.complete", display_name: "Complete Checkout", description: "Complete checkout process", resource: "checkout", action: "complete" },
  { name: "checkout.guest", display_name: "Guest Checkout", description: "Allow guest checkout", resource: "checkout", action: "guest" },
  { name: "cart.access", display_name: "Access Cart", description: "Access shopping cart", resource: "cart", action: "access" },
  { name: "cart.manage", display_name: "Manage Cart", description: "Manage shopping cart items", resource: "cart", action: "manage" },
  { name: "payment.process", display_name: "Process Payment", description: "Process payments", resource: "payment", action: "process" },
  { name: "payment.verify", display_name: "Verify Payment", description: "Verify payment status", resource: "payment", action: "verify" },

  // Library Management
  { name: "library.access", display_name: "Access Library", description: "Access personal library", resource: "library", action: "access" },
  { name: "library.manage", display_name: "Manage Library", description: "Manage library content", resource: "library", action: "manage" },

  // Profile Management
  { name: "profile.read", display_name: "View Own Profile", description: "View own profile information", resource: "profile", action: "read" },
  { name: "profile.update", display_name: "Update Own Profile", description: "Update own profile information", resource: "profile", action: "update" },

  // Blog Management
  { name: "blog.read", display_name: "View Blog Posts", description: "View blog posts", resource: "blog", action: "read" },
  { name: "blog.create", display_name: "Create Blog Posts", description: "Create new blog posts", resource: "blog", action: "create" },
  { name: "blog.update", display_name: "Update Blog Posts", description: "Edit existing blog posts", resource: "blog", action: "update" },
  { name: "blog.delete", display_name: "Delete Blog Posts", description: "Remove blog posts", resource: "blog", action: "delete" },
  { name: "blog.publish", display_name: "Publish Blog Posts", description: "Publish blog posts", resource: "blog", action: "publish" },

  // FAQ Management
  { name: "faq.read", display_name: "View FAQs", description: "View FAQ items", resource: "faq", action: "read" },
  { name: "faq.create", display_name: "Create FAQs", description: "Create new FAQ items", resource: "faq", action: "create" },
  { name: "faq.update", display_name: "Update FAQs", description: "Edit existing FAQ items", resource: "faq", action: "update" },
  { name: "faq.delete", display_name: "Delete FAQs", description: "Remove FAQ items", resource: "faq", action: "delete" },

  // Works Management
  { name: "works.read", display_name: "View Works", description: "View works portfolio", resource: "works", action: "read" },
  { name: "works.create", display_name: "Create Works", description: "Create new works", resource: "works", action: "create" },
  { name: "works.update", display_name: "Update Works", description: "Edit existing works", resource: "works", action: "update" },
  { name: "works.delete", display_name: "Delete Works", description: "Remove works", resource: "works", action: "delete" },

  // Email Management
  { name: "email.read", display_name: "View Email Templates", description: "View email templates", resource: "email", action: "read" },
  { name: "email.create", display_name: "Create Email Templates", description: "Create new email templates", resource: "email", action: "create" },
  { name: "email.update", display_name: "Update Email Templates", description: "Edit existing email templates", resource: "email", action: "update" },
  { name: "email.delete", display_name: "Delete Email Templates", description: "Remove email templates", resource: "email", action: "delete" },
  { name: "email.send", display_name: "Send Emails", description: "Send emails to users", resource: "email", action: "send" },

  // About Management
  { name: "about.read", display_name: "View About Content", description: "View about page content", resource: "about", action: "read" },
  { name: "about.update", display_name: "Update About Content", description: "Edit about page content", resource: "about", action: "update" },

  // Contact Management
  { name: "contact.read", display_name: "View Contact Info", description: "View contact information", resource: "contact", action: "read" },
  { name: "contact.update", display_name: "Update Contact Info", description: "Edit contact information", resource: "contact", action: "update" },

  // Reading Analytics
  { name: "reading.analytics", display_name: "View Reading Analytics", description: "Access reading analytics", resource: "reading", action: "analytics" },
  { name: "reading.reports", display_name: "Generate Reading Reports", description: "Generate reading reports", resource: "reading", action: "reports" },

  // Reviews Management
  { name: "reviews.read", display_name: "View Reviews", description: "View user reviews", resource: "reviews", action: "read" },
  { name: "reviews.moderate", display_name: "Moderate Reviews", description: "Moderate user reviews", resource: "reviews", action: "moderate" },
  { name: "reviews.delete", display_name: "Delete Reviews", description: "Remove reviews", resource: "reviews", action: "delete" },

  // Shipping Management
  { name: "shipping.read", display_name: "View Shipping", description: "View shipping information", resource: "shipping", action: "read" },
  { name: "shipping.update", display_name: "Update Shipping", description: "Update shipping settings", resource: "shipping", action: "update" },

  // Notifications
  { name: "notifications.read", display_name: "View Notifications", description: "View notifications", resource: "notifications", action: "read" },
  { name: "notifications.create", display_name: "Create Notifications", description: "Create new notifications", resource: "notifications", action: "create" },
  { name: "notifications.update", display_name: "Update Notifications", description: "Edit existing notifications", resource: "notifications", action: "update" },
  { name: "notifications.delete", display_name: "Delete Notifications", description: "Remove notifications", resource: "notifications", action: "delete" },

  // Books Management
  { name: "books.read", display_name: "View Books", description: "View books in the system", resource: "books", action: "read" },
  { name: "books.create", display_name: "Create Books", description: "Add new books to the system", resource: "books", action: "create" },
  { name: "books.update", display_name: "Update Books", description: "Edit existing books", resource: "books", action: "update" },
  { name: "books.delete", display_name: "Delete Books", description: "Remove books from the system", resource: "books", action: "delete" },
  { name: "books.manage", display_name: "Manage Books", description: "Full book management access", resource: "books", action: "manage" }
];

async function syncPermissions() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Syncing permissions with database...');
    
    // Insert permissions with ON CONFLICT handling
    for (const permission of permissions) {
      await client.query(`
        INSERT INTO permissions (name, display_name, description, resource, action, scope)
        VALUES ($1, $2, $3, $4, $5, 'global')
        ON CONFLICT (name) DO UPDATE SET
          display_name = EXCLUDED.display_name,
          description = EXCLUDED.description,
          resource = EXCLUDED.resource,
          action = EXCLUDED.action
      `, [
        permission.name,
        permission.display_name,
        permission.description,
        permission.resource,
        permission.action
      ]);
    }
    
    // Assign all permissions to admin and super_admin roles
    await client.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id 
      FROM roles r, permissions p 
      WHERE r.name IN ('admin', 'super_admin')
      ON CONFLICT (role_id, permission_id) DO NOTHING
    `);
    
    console.log('✅ Permissions synced successfully!');
    console.log(`📊 Total permissions: ${permissions.length}`);
    
    // Show summary by resource
    const resourceCounts = permissions.reduce((acc, perm) => {
      acc[perm.resource] = (acc[perm.resource] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📋 Permissions by resource:');
    Object.entries(resourceCounts).forEach(([resource, count]) => {
      console.log(`  ${resource}: ${count} permissions`);
    });
    
  } catch (error) {
    console.error('❌ Error syncing permissions:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  syncPermissions()
    .then(() => {
      console.log('🎉 Permission sync completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Permission sync failed:', error);
      process.exit(1);
    });
}

module.exports = { syncPermissions };