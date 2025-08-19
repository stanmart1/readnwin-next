#!/usr/bin/env node

/**
 * Comprehensive Fix Script for About Us and Permissions System
 *
 * This script:
 * 1. Creates the missing about_us table
 * 2. Aligns permission expectations with existing dot notation system
 * 3. Creates any missing permissions needed for admin functionality
 * 4. Updates tab permission mappings to use correct permissions
 */

const { Pool } = require('pg');

// Working database configuration with fallback values
const pool = new Pool({
  user: process.env.DB_USER || 'avnadmin',
  host: process.env.DB_HOST || 'readnwin-nextjs-book-nextjs.b.aivencloud.com',
  database: process.env.DB_NAME || 'defaultdb',
  password: process.env.DB_PASSWORD || 'AVNS_Xv38UAMF77xN--vUfeX',
  port: parseInt(process.env.DB_PORT || '28428'),
  ssl: {
    rejectUnauthorized: false,
  },
});

// Query helper function
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

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Expected permissions using correct dot notation based on existing system
const ADDITIONAL_PERMISSIONS = [
  // Analytics permissions
  { name: 'analytics.dashboard', resource: 'analytics', action: 'dashboard', display_name: 'View Dashboard Analytics' },
  { name: 'analytics.sales', resource: 'analytics', action: 'sales', display_name: 'View Sales Analytics' },
  { name: 'analytics.users', resource: 'analytics', action: 'users', display_name: 'View User Analytics' },
  { name: 'analytics.books', resource: 'analytics', action: 'books', display_name: 'View Book Analytics' },

  // Books management
  { name: 'books.list', resource: 'books', action: 'list', display_name: 'List Books' },
  { name: 'books.create', resource: 'books', action: 'create', display_name: 'Create Books' },
  { name: 'books.read', resource: 'books', action: 'read', display_name: 'View Books' },
  { name: 'books.update', resource: 'books', action: 'update', display_name: 'Update Books' },
  { name: 'books.delete', resource: 'books', action: 'delete', display_name: 'Delete Books' },
  { name: 'books.publish', resource: 'books', action: 'publish', display_name: 'Publish Books' },
  { name: 'books.feature', resource: 'books', action: 'feature', display_name: 'Feature Books' },

  // Authors management
  { name: 'authors.list', resource: 'authors', action: 'list', display_name: 'List Authors' },
  { name: 'authors.create', resource: 'authors', action: 'create', display_name: 'Create Authors' },
  { name: 'authors.read', resource: 'authors', action: 'read', display_name: 'View Authors' },
  { name: 'authors.update', resource: 'authors', action: 'update', display_name: 'Update Authors' },
  { name: 'authors.delete', resource: 'authors', action: 'delete', display_name: 'Delete Authors' },

  // Categories management
  { name: 'categories.list', resource: 'categories', action: 'list', display_name: 'List Categories' },
  { name: 'categories.create', resource: 'categories', action: 'create', display_name: 'Create Categories' },
  { name: 'categories.read', resource: 'categories', action: 'read', display_name: 'View Categories' },
  { name: 'categories.update', resource: 'categories', action: 'update', display_name: 'Update Categories' },
  { name: 'categories.delete', resource: 'categories', action: 'delete', display_name: 'Delete Categories' },

  // Email management
  { name: 'emails.read', resource: 'emails', action: 'read', display_name: 'View Emails' },
  { name: 'emails.send', resource: 'emails', action: 'send', display_name: 'Send Emails' },
  { name: 'emails.templates', resource: 'emails', action: 'templates', display_name: 'Manage Email Templates' },
  { name: 'emails.gateway', resource: 'emails', action: 'gateway', display_name: 'Manage Email Gateway' },

  // Payment management
  { name: 'payments.read', resource: 'payments', action: 'read', display_name: 'View Payments' },
  { name: 'payments.analytics', resource: 'payments', action: 'analytics', display_name: 'View Payment Analytics' },
  { name: 'payments.gateways', resource: 'payments', action: 'gateways', display_name: 'Manage Payment Gateways' },

  // Additional content management
  { name: 'content.pages', resource: 'content', action: 'pages', display_name: 'Manage Pages' },
  { name: 'content.aboutus', resource: 'content', action: 'aboutus', display_name: 'Manage About Us' },
  { name: 'content.faq', resource: 'content', action: 'faq', display_name: 'Manage FAQ' },

  // File management
  { name: 'files.upload', resource: 'files', action: 'upload', display_name: 'Upload Files' },
  { name: 'files.delete', resource: 'files', action: 'delete', display_name: 'Delete Files' },
  { name: 'files.manage', resource: 'files', action: 'manage', display_name: 'Manage Files' }
];

// Updated admin tab permissions mapping using correct dot notation
const ADMIN_TAB_PERMISSIONS = {
  'dashboard': ['analytics.dashboard'],
  'users': ['users.read', 'users.create', 'users.update', 'users.delete'],
  'roles': ['roles.read', 'roles.create', 'roles.update', 'roles.delete', 'permissions.read'],
  'books': ['books.list', 'books.read', 'books.create', 'books.update', 'books.delete'],
  'authors': ['authors.list', 'authors.read', 'authors.create', 'authors.update', 'authors.delete'],
  'categories': ['categories.list', 'categories.read', 'categories.create', 'categories.update', 'categories.delete'],
  'orders': ['orders.read', 'orders.update', 'orders.view'],
  'payments': ['payments.read', 'payments.analytics', 'payments.gateways'],
  'content': ['content.read', 'content.update', 'content.pages', 'content.aboutus'],
  'email': ['emails.read', 'emails.templates', 'emails.gateway'],
  'analytics': ['analytics.dashboard', 'analytics.sales', 'analytics.users', 'analytics.books'],
  'settings': ['system.settings'],
  'faq': ['content.faq']
};

async function createAboutUsTable() {
  log('\n🔧 Creating About Us Table...', 'cyan');

  try {
    // Check if table already exists
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'about_us'
      );
    `);

    if (tableExists.rows[0].exists) {
      log('✅ About Us table already exists', 'green');
      return true;
    }

    // Create about_us table
    await query(`
      CREATE TABLE about_us (
        id SERIAL PRIMARY KEY,
        section VARCHAR(100) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        image_url VARCHAR(500),
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES users(id),
        updated_by INTEGER REFERENCES users(id)
      );
    `);

    log('✅ Created about_us table', 'green');

    // Create index for better performance
    await query(`
      CREATE INDEX idx_about_us_section ON about_us(section);
      CREATE INDEX idx_about_us_active ON about_us(is_active);
      CREATE INDEX idx_about_us_sort ON about_us(sort_order);
    `);

    log('✅ Created about_us table indexes', 'green');

    // Insert default content
    await query(`
      INSERT INTO about_us (section, title, content, sort_order, is_active)
      VALUES
      ('mission', 'Our Mission', 'To provide quality books and promote reading culture across our community. We believe in the power of books to transform lives and inspire minds.', 1, true),
      ('vision', 'Our Vision', 'To become the leading book platform in our region, connecting readers with amazing stories and authors with their audience.', 2, true),
      ('story', 'Our Story', 'ReadnWin was founded with a simple belief: everyone deserves access to great books. What started as a small initiative has grown into a thriving platform for book lovers.', 3, true),
      ('team', 'Our Team', 'We are a dedicated team of book lovers, technology enthusiasts, and customer service experts working together to create the best reading experience.', 4, true),
      ('values', 'Our Values', 'Quality, Community, Innovation, and Accessibility - these are the core values that guide everything we do at ReadnWin.', 5, true)
    `);

    log('✅ Inserted default About Us content', 'green');

    return true;

  } catch (error) {
    log(`❌ Error creating About Us table: ${error.message}`, 'red');
    return false;
  }
}

async function createMissingPermissions() {
  log('\n🔧 Creating Missing Permissions...', 'cyan');

  try {
    // Get existing permissions
    const currentPermissions = await query('SELECT name FROM permissions');
    const existingPermissions = currentPermissions.rows.map(p => p.name);

    const missingPermissions = ADDITIONAL_PERMISSIONS.filter(perm => !existingPermissions.includes(perm.name));

    if (missingPermissions.length === 0) {
      log('✅ No missing permissions to create', 'green');
      return true;
    }

    log(`📋 Creating ${missingPermissions.length} missing permissions...`, 'blue');

    for (const permission of missingPermissions) {
      await query(`
        INSERT INTO permissions (name, resource, action, display_name, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (name) DO NOTHING
      `, [permission.name, permission.resource, permission.action, permission.display_name]);

      log(`   ✅ Created: ${permission.name}`, 'green');
    }

    log(`\n✅ Successfully created ${missingPermissions.length} permissions`, 'green');
    return true;

  } catch (error) {
    log(`❌ Error creating missing permissions: ${error.message}`, 'red');
    return false;
  }
}

async function updateRolePermissions() {
  log('\n🔧 Updating Role Permissions...', 'cyan');

  try {
    // Get all permissions
    const allPermissions = await query('SELECT id, name FROM permissions ORDER BY name');
    const permissionMap = {};
    allPermissions.rows.forEach(p => {
      permissionMap[p.name] = p.id;
    });

    // Get admin and super_admin roles
    const roles = await query(`
      SELECT id, name FROM roles
      WHERE name IN ('admin', 'super_admin')
      ORDER BY name
    `);

    for (const role of roles.rows) {
      log(`\n📋 Updating permissions for role: ${role.name}`, 'blue');

      if (role.name === 'super_admin') {
        // Super admin gets all permissions
        log('   Granting all permissions to super_admin...', 'yellow');

        for (const [permName, permId] of Object.entries(permissionMap)) {
          await query(`
            INSERT INTO role_permissions (role_id, permission_id, created_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (role_id, permission_id) DO NOTHING
          `, [role.id, permId]);
        }

        log(`   ✅ Granted ${Object.keys(permissionMap).length} permissions to super_admin`, 'green');

      } else if (role.name === 'admin') {
        // Admin gets most permissions (excluding some system-level ones)
        const adminPermissions = Object.entries(permissionMap).filter(([name]) =>
          !name.includes('system.') || name === 'system.settings'
        );

        log(`   Granting ${adminPermissions.length} permissions to admin...`, 'yellow');

        for (const [permName, permId] of adminPermissions) {
          await query(`
            INSERT INTO role_permissions (role_id, permission_id, created_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (role_id, permission_id) DO NOTHING
          `, [role.id, permId]);
        }

        log(`   ✅ Granted ${adminPermissions.length} permissions to admin`, 'green');
      }
    }

    return true;

  } catch (error) {
    log(`❌ Error updating role permissions: ${error.message}`, 'red');
    return false;
  }
}

async function createAboutUsAPI() {
  log('\n🔧 Checking About Us API Endpoints...', 'cyan');

  const fs = require('fs');
  const path = require('path');

  // Check if API directories exist
  const adminApiDir = path.join(process.cwd(), 'app/api/admin/about-us');
  const publicApiDir = path.join(process.cwd(), 'app/api/about-us');

  // Create admin about-us API if it doesn't exist
  if (!fs.existsSync(adminApiDir)) {
    fs.mkdirSync(adminApiDir, { recursive: true });

    const adminApiContent = `import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { rbacService } from '@/lib/rbac';
import { query } from '@/utils/database';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'content.aboutus'
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const result = await query(
      'SELECT * FROM about_us ORDER BY sort_order, id'
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching about us content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch about us content' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'content.aboutus'
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { section, title, content, image_url, sort_order = 0, is_active = true } = body;

    if (!section || !title || !content) {
      return NextResponse.json(
        { error: 'Section, title, and content are required' },
        { status: 400 }
      );
    }

    const result = await query(
      \`INSERT INTO about_us (section, title, content, image_url, sort_order, is_active, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
       RETURNING *\`,
      [section, title, content, image_url, sort_order, is_active, session.user.id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating about us content:', error);
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Section already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create about us content' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'content.aboutus'
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id, section, title, content, image_url, sort_order, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required for updates' },
        { status: 400 }
      );
    }

    const result = await query(
      \`UPDATE about_us
       SET section = COALESCE($2, section),
           title = COALESCE($3, title),
           content = COALESCE($4, content),
           image_url = COALESCE($5, image_url),
           sort_order = COALESCE($6, sort_order),
           is_active = COALESCE($7, is_active),
           updated_by = $8,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *\`,
      [id, section, title, content, image_url, sort_order, is_active, session.user.id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'About us section not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating about us content:', error);
    return NextResponse.json(
      { error: 'Failed to update about us content' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'content.aboutus'
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM about_us WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'About us section not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'About us section deleted successfully' });
  } catch (error) {
    console.error('Error deleting about us content:', error);
    return NextResponse.json(
      { error: 'Failed to delete about us content' },
      { status: 500 }
    );
  }
}`;

    fs.writeFileSync(path.join(adminApiDir, 'route.js'), adminApiContent);
    log('✅ Created admin about-us API endpoint', 'green');
  } else {
    log('✅ Admin about-us API endpoint already exists', 'green');
  }

  // Create public about-us API if it doesn't exist
  if (!fs.existsSync(publicApiDir)) {
    fs.mkdirSync(publicApiDir, { recursive: true });

    const publicApiContent = `import { NextResponse } from 'next/server';
import { query } from '@/utils/database';

export async function GET() {
  try {
    const result = await query(
      'SELECT section, title, content, image_url, sort_order FROM about_us WHERE is_active = true ORDER BY sort_order, id'
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching about us content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch about us content' },
      { status: 500 }
    );
  }
}`;

    fs.writeFileSync(path.join(publicApiDir, 'route.js'), publicApiContent);
    log('✅ Created public about-us API endpoint', 'green');
  } else {
    log('✅ Public about-us API endpoint already exists', 'green');
  }

  return true;
}

async function verifyTabPermissionMapping() {
  log('\n🔍 Verifying Updated Tab Permission Mapping...', 'cyan');

  try {
    // Get all permissions from database
    const dbPermissions = await query('SELECT name FROM permissions ORDER BY name');
    const availablePermissions = dbPermissions.rows.map(p => p.name);

    let mappingIssues = 0;

    for (const [tab, requiredPerms] of Object.entries(ADMIN_TAB_PERMISSIONS)) {
      log(`\n📋 Checking ${tab} tab permissions:`, 'blue');

      const missingPerms = requiredPerms.filter(perm => !availablePermissions.includes(perm));

      if (missingPerms.length === 0) {
        log(`   ✅ All permissions exist (${requiredPerms.length} permissions)`, 'green');
      } else {
        log(`   ❌ Missing ${missingPerms.length} permissions:`, 'red');
        missingPerms.forEach(perm => {
          log(`      ${perm}`, 'red');
        });
        mappingIssues++;
      }
    }

    if (mappingIssues === 0) {
      log('\n✅ All tab permission mappings are valid', 'green');
      return true;
    } else {
      log(`\n⚠️ Found issues with ${mappingIssues} tabs`, 'yellow');
      return false;
    }

  } catch (error) {
    log(`❌ Error verifying tab permission mapping: ${error.message}`, 'red');
    return false;
  }
}

async function generateFinalReport() {
  log('\n📋 Generating Final System Report...', 'cyan');

  try {
    // Check about_us table
    const aboutUsExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'about_us'
      );
    `);

    const aboutUsCount = aboutUsExists.rows[0].exists ?
      (await query('SELECT COUNT(*) as count FROM about_us')).rows[0].count : 0;

    // Check permissions
    const permissionsCount = await query('SELECT COUNT(*) as count FROM permissions');
    const rolesCount = await query('SELECT COUNT(*) as count FROM roles');

    // Check role permissions
    const rolePermissionsCount = await query(`
      SELECT r.name as role_name, COUNT(rp.permission_id) as permission_count
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      GROUP BY r.id, r.name
      ORDER BY r.name
    `);

    log('\n📊 System Status Report:', 'blue');
    log(`   About Us Table: ${aboutUsExists.rows[0].exists ? '✅ Exists' : '❌ Missing'}`, aboutUsExists.rows[0].exists ? 'green' : 'red');
    log(`   About Us Sections: ${aboutUsCount}`, 'yellow');
    log(`   Total Permissions: ${permissionsCount.rows[0].count}`, 'yellow');
    log(`   Total Roles: ${rolesCount.rows[0].count}`, 'yellow');

    log('\n📋 Role Permission Assignments:', 'blue');
    rolePermissionsCount.rows.forEach(role => {
      log(`   ${role.role_name}: ${role.permission_count} permissions`, 'yellow');
    });

    // Check API endpoints
    const fs = require('fs');
    const path = require('path');

    const apiEndpoints = [
      'app/api/admin/about-us/route.js',
      'app/api/about-us/route.js'
    ];

    log('\n📋 API Endpoints:', 'blue');
    apiEndpoints.forEach(endpoint => {
      const exists = fs.existsSync(path.join(process.cwd(), endpoint));
      log(`   ${endpoint}: ${exists ? '✅ Exists' : '❌ Missing'}`, exists ? 'green' : 'red');
    });

    return true;

  } catch (error) {
    log(`❌ Error generating final report: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('🚀 Starting About Us and Permissions System Fix', 'bold');
  console.log(new Date().toISOString());

  const results = {
    aboutUsTable: false,
    permissions: false,
    rolePermissions: false,
    apiEndpoints: false,
    tabMapping: false
  };

  try {
    // Test database connection first
    await query('SELECT 1');
    log('✅ Database connection successful', 'green');

    // Create About Us table
    results.aboutUsTable = await createAboutUsTable();

    // Create missing permissions
    results.permissions = await createMissingPermissions();

    // Update role permissions
    results.rolePermissions = await updateRolePermissions();

    // Create API endpoints
    results.apiEndpoints = await createAboutUsAPI();

    // Verify tab permission mapping
    results.tabMapping = await verifyTabPermissionMapping();

    // Generate final report
    await generateFinalReport();

  } catch (error) {
    log(`❌ Critical error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await pool.end();
  }

  console.log(new Date().toISOString());
  log('\n📋 Final Fix Report:', 'bold');
  log(`   About Us Table: ${results.aboutUsTable ? '✅ Fixed' : '❌ Failed'}`, results.aboutUsTable ? 'green' : 'red');
  log(`   Permissions: ${results.permissions ? '✅ Fixed' : '❌ Failed'}`, results.permissions ? 'green' : 'red');
  log(`   Role Permissions: ${results.rolePermissions ? '✅ Fixed' : '❌ Failed'}`, results.rolePermissions ? 'green' : 'red');
  log(`   API Endpoints: ${results.apiEndpoints ? '✅ Fixed' : '❌ Failed'}`, results.apiEndpoints ? 'green' : 'red');
  log(`   Tab Mapping: ${results.tabMapping ? '✅ Fixed' : '❌ Failed'}`, results.tabMapping ? 'green' : 'red');

  const allFixed = Object.values(results).every(result => result);
  log(`\n🏁 Overall Status: ${allFixed ? '✅ All Systems Fixed' : '❌ Some Issues Remain'}`, allFixed ? 'green' : 'yellow');

  if (allFixed) {
    log('\n🎉 Success! About Us and Permissions systems are now fully functional:', 'green');
    log('   • About Us table created with default content', 'green');
    log('   • All necessary permissions added to database', 'green');
    log('   • Admin and super_admin roles updated with proper permissions', 'green');
    log('   • About Us API endpoints created for admin and public access', 'green');
    log('   • All admin tab permissions properly mapped', 'green');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createAboutUsTable,
  createMissingPermissions,
  updateRolePermissions,
  createAboutUsAPI,
  verifyTabPermissionMapping,
  generateFinalReport
};
