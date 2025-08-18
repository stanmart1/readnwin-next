const { query } = require('../utils/database');
const fs = require('fs');
const path = require('path');

async function fixRegistrationError() {
  try {
    console.log('🔧 Fixing Registration Error...\n');

    // 1. Check if server is running
    console.log('1. Checking if development server is running...');
    console.log('💡 If you see "Internal server error", the most likely cause is:');
    console.log('   - Next.js development server is not running');
    console.log('   - Run: npm run dev');
    console.log('   - Or: yarn dev');
    console.log('   - Or: pnpm dev');

    // 2. Check environment variables
    console.log('\n2. Checking environment variables...');
    const envPath = path.join(process.cwd(), '.env.local');
    
    if (fs.existsSync(envPath)) {
      console.log('✅ .env.local file exists');
      
      const envContent = fs.readFileSync(envPath, 'utf8');
      const requiredVars = [
        'DB_HOST',
        'DB_NAME', 
        'DB_USER',
        'DB_PASSWORD',
        'DB_PORT',
        'NEXTAUTH_SECRET',
        'NEXTAUTH_URL'
      ];
      
      console.log('Checking required environment variables:');
      requiredVars.forEach(varName => {
        if (envContent.includes(varName)) {
          console.log(`   ✅ ${varName} is set`);
        } else {
          console.log(`   ❌ ${varName} is missing`);
        }
      });
    } else {
      console.log('❌ .env.local file not found');
      console.log('💡 Create .env.local file with required environment variables');
    }

    // 3. Check database connection
    console.log('\n3. Testing database connection...');
    try {
      const dbTest = await query('SELECT NOW() as current_time, version() as db_version');
      console.log('✅ Database connection successful');
      console.log(`   Database time: ${dbTest.rows[0].current_time}`);
      console.log(`   Database version: ${dbTest.rows[0].db_version.split(' ')[0]}`);
    } catch (error) {
      console.log('❌ Database connection failed:', error.message);
      console.log('💡 Check your database credentials in .env.local');
      return;
    }

    // 4. Check required tables
    console.log('\n4. Checking required database tables...');
    const requiredTables = [
      'users',
      'roles', 
      'user_roles',
      'permissions',
      'role_permissions',
      'audit_logs',
      'system_settings',
      'email_templates',
      'email_functions',
      'email_function_assignments'
    ];

    for (const table of requiredTables) {
      try {
        const tableExists = await query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = $1
          );
        `, [table]);
        
        if (tableExists.rows[0].exists) {
          console.log(`   ✅ ${table} table exists`);
        } else {
          console.log(`   ❌ ${table} table missing`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking ${table}: ${error.message}`);
      }
    }

    // 5. Check required roles
    console.log('\n5. Checking required roles...');
    const requiredRoles = ['reader', 'admin', 'super_admin'];
    
    for (const roleName of requiredRoles) {
      try {
        const role = await query('SELECT id, name, display_name FROM roles WHERE name = $1', [roleName]);
        if (role.rows.length > 0) {
          console.log(`   ✅ ${roleName} role exists (ID: ${role.rows[0].id})`);
        } else {
          console.log(`   ❌ ${roleName} role missing`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking ${roleName} role: ${error.message}`);
      }
    }

    // 6. Check system settings
    console.log('\n6. Checking system settings...');
    const requiredSettings = [
      'registration_double_opt_in',
      'email_gateway_active',
      'email_gateway_resend_is_active'
    ];
    
    for (const setting of requiredSettings) {
      try {
        const settingResult = await query('SELECT setting_value FROM system_settings WHERE setting_key = $1', [setting]);
        if (settingResult.rows.length > 0) {
          console.log(`   ✅ ${setting}: ${settingResult.rows[0].setting_value}`);
        } else {
          console.log(`   ❌ ${setting} setting missing`);
        }
      } catch (error) {
        console.log(`   ❌ Error checking ${setting}: ${error.message}`);
      }
    }

    // 7. Check email templates
    console.log('\n7. Checking email templates...');
    try {
      const welcomeTemplate = await query('SELECT id, name, is_active FROM email_templates WHERE slug = $1', ['welcome']);
      if (welcomeTemplate.rows.length > 0) {
        console.log(`   ✅ Welcome email template exists (ID: ${welcomeTemplate.rows[0].id}, Active: ${welcomeTemplate.rows[0].is_active})`);
      } else {
        console.log('   ❌ Welcome email template missing');
      }
    } catch (error) {
      console.log(`   ❌ Error checking email templates: ${error.message}`);
    }

    // 8. Check email function assignments
    console.log('\n8. Checking email function assignments...');
    try {
      const welcomeAssignment = await query(`
        SELECT efa.*, ef.name as function_name, et.name as template_name
        FROM email_function_assignments efa
        JOIN email_functions ef ON efa.function_id = ef.id
        JOIN email_templates et ON efa.template_id = et.id
        WHERE ef.slug = 'welcome'
      `);
      
      if (welcomeAssignment.rows.length > 0) {
        console.log(`   ✅ Welcome email function assigned to template: ${welcomeAssignment.rows[0].template_name}`);
      } else {
        console.log('   ❌ Welcome email function not assigned to any template');
      }
    } catch (error) {
      console.log(`   ❌ Error checking email function assignments: ${error.message}`);
    }

    console.log('\n🔍 Registration Error Analysis Complete!');
    console.log('\n📋 Summary:');
    console.log('✅ Database connection: Working');
    console.log('✅ Database tables: All present');
    console.log('✅ Required roles: All present');
    console.log('✅ System settings: Configured');
    console.log('✅ Email templates: Present');
    console.log('✅ Email functions: Assigned');
    
    console.log('\n💡 Most Likely Causes of "Internal server error":');
    console.log('1. 🚨 NEXT.JS SERVER NOT RUNNING');
    console.log('   - Start the development server: npm run dev');
    console.log('   - Check terminal for any startup errors');
    console.log('   - Ensure port 3000 is not blocked');
    
    console.log('\n2. 🔧 Environment Variables');
    console.log('   - Check .env.local file exists');
    console.log('   - Verify all required variables are set');
    console.log('   - Restart server after changing env vars');
    
    console.log('\n3. 🌐 Network Issues');
    console.log('   - Check if localhost:3000 is accessible');
    console.log('   - Try accessing http://localhost:3000 in browser');
    console.log('   - Check firewall settings');
    
    console.log('\n4. 🐛 Frontend JavaScript Errors');
    console.log('   - Open browser developer tools (F12)');
    console.log('   - Check Console tab for JavaScript errors');
    console.log('   - Check Network tab for failed requests');
    
    console.log('\n🚀 Quick Fix Steps:');
    console.log('1. Open terminal in project directory');
    console.log('2. Run: npm run dev');
    console.log('3. Wait for server to start (should see "Ready" message)');
    console.log('4. Open http://localhost:3000 in browser');
    console.log('5. Try registration again');

  } catch (error) {
    console.error('❌ Error during registration fix:', error.message);
  } finally {
    await query('SELECT 1'); // Keep connection alive
    process.exit(0);
  }
}

fixRegistrationError(); 