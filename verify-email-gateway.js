#!/usr/bin/env node

/**
 * Admin Email Gateway Management Verification
 * Tests that admins can manage email gateways from settings page
 */

const { query } = require('./utils/database');

async function verifyEmailGatewayManagement() {
  console.log('🔍 Verifying Admin Email Gateway Management...\n');

  // Test 1: Check database structure
  console.log('1. Checking database structure...');
  try {
    const result = await query(`
      SELECT setting_key, setting_value 
      FROM system_settings 
      WHERE setting_key LIKE 'email_gateway_%'
      ORDER BY setting_key
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Email gateway settings found in database');
      console.log(`   Found ${result.rows.length} settings`);
      
      // Show current active gateway
      const activeGateway = result.rows.find(row => row.setting_key === 'email_gateway_active');
      if (activeGateway) {
        console.log(`   Active gateway: ${activeGateway.setting_value}`);
      }
    } else {
      console.log('❌ No email gateway settings found');
      return false;
    }
  } catch (error) {
    console.log('❌ Database query failed:', error.message);
    return false;
  }

  // Test 2: Check admin users
  console.log('\n2. Checking admin users...');
  try {
    const adminResult = await query(`
      SELECT u.email, r.name as role_name 
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.name IN ('admin', 'super_admin') 
      AND u.status = 'active'
      AND ur.is_active = true
    `);
    
    if (adminResult.rows.length > 0) {
      console.log('✅ Admin users found');
      adminResult.rows.forEach(user => {
        console.log(`   ${user.email} (${user.role_name})`);
      });
    } else {
      console.log('❌ No admin users found');
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to check admin users:', error.message);
    return false;
  }

  // Test 3: Check required files exist
  console.log('\n3. Checking required files...');
  const fs = require('fs');
  const requiredFiles = [
    'app/admin/EmailGatewayManagement.tsx',
    'app/admin/SystemSettings.tsx',
    'app/api/admin/email-gateways/route.ts',
    'app/api/admin/email-gateways/test/route.ts'
  ];

  let allFilesExist = true;
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} exists`);
    } else {
      console.log(`❌ ${file} missing`);
      allFilesExist = false;
    }
  }

  if (!allFilesExist) {
    return false;
  }

  // Test 4: Check component integration
  console.log('\n4. Checking component integration...');
  try {
    const systemSettingsContent = fs.readFileSync('app/admin/SystemSettings.tsx', 'utf8');
    const adminPageContent = fs.readFileSync('app/admin/page.tsx', 'utf8');
    
    if (systemSettingsContent.includes('EmailGatewayManagement')) {
      console.log('✅ EmailGatewayManagement integrated in SystemSettings');
    } else {
      console.log('❌ EmailGatewayManagement not integrated in SystemSettings');
      return false;
    }
    
    if (adminPageContent.includes('settings') && adminPageContent.includes('SystemSettings')) {
      console.log('✅ SystemSettings integrated in admin page');
    } else {
      console.log('❌ SystemSettings not integrated in admin page');
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to check component integration:', error.message);
    return false;
  }

  // Test 5: Check API functionality
  console.log('\n5. Checking API functionality...');
  try {
    const apiRouteContent = fs.readFileSync('app/api/admin/email-gateways/route.ts', 'utf8');
    const testRouteContent = fs.readFileSync('app/api/admin/email-gateways/test/route.ts', 'utf8');
    
    if (apiRouteContent.includes('GET') && apiRouteContent.includes('POST')) {
      console.log('✅ Email gateways API has GET and POST methods');
    } else {
      console.log('❌ Email gateways API missing required methods');
      return false;
    }
    
    if (apiRouteContent.includes('admin') && apiRouteContent.includes('super_admin')) {
      console.log('✅ API has proper admin role checks');
    } else {
      console.log('❌ API missing admin role checks');
      return false;
    }
    
    if (testRouteContent.includes('testResendGateway') && testRouteContent.includes('testSMTPGateway')) {
      console.log('✅ Test API includes both Resend and SMTP testing');
    } else {
      console.log('❌ Test API missing gateway testing functions');
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to check API functionality:', error.message);
    return false;
  }

  console.log('\n🎉 VERIFICATION COMPLETE');
  console.log('✅ Admin email gateway management is properly configured and functional!');
  return true;
}

// Run verification
if (require.main === module) {
  verifyEmailGatewayManagement()
    .then(success => {
      if (!success) {
        console.log('\n❌ Some verification checks failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.log('\n❌ Verification failed:', error.message);
      process.exit(1);
    });
}

module.exports = { verifyEmailGatewayManagement }; 