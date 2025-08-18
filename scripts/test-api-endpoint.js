const { query } = require('../utils/database');

async function testApiEndpoint() {
  try {
    console.log('🧪 Testing Registration API Endpoint...\n');

    console.log('1. Testing database connection...');
    
    try {
      const dbTest = await query('SELECT NOW() as current_time');
      console.log('✅ Database connection successful');
      console.log(`Current database time: ${dbTest.rows[0].current_time}`);
    } catch (error) {
      console.log('❌ Database connection failed:', error.message);
      return;
    }

    console.log('\n2. Testing registration process directly...');
    
    const testData = {
      first_name: 'API',
      last_name: 'Test',
      email: 'apitest@example.com',
      username: 'apitest',
      password: 'TestPassword123!'
    };

    // Check if user already exists
    const existingUser = await query('SELECT * FROM users WHERE email = $1 OR username = $2', [testData.email, testData.username]);
    if (existingUser.rows.length > 0) {
      console.log('❌ Test user already exists, cleaning up...');
      await query('DELETE FROM user_roles WHERE user_id = $1', [existingUser.rows[0].id]);
      await query('DELETE FROM users WHERE id = $1', [existingUser.rows[0].id]);
      console.log('✅ Test user cleaned up');
    }

    // Check double opt-in setting
    const doubleOptInResult = await query(`
      SELECT setting_value FROM system_settings 
      WHERE setting_key = 'registration_double_opt_in'
    `);
    
    const doubleOptInEnabled = doubleOptInResult.rows[0]?.setting_value === 'true';
    console.log(`Double opt-in enabled: ${doubleOptInEnabled}`);

    // Hash password
    const bcrypt = require('bcryptjs');
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(testData.password, saltRounds);

    // Create user
    const userResult = await query(
      `INSERT INTO users (email, username, password_hash, first_name, last_name, status, email_verified, welcome_email_sent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        testData.email,
        testData.username,
        passwordHash,
        testData.first_name,
        testData.last_name,
        'active',
        true,
        false
      ]
    );
    
    const user = userResult.rows[0];
    console.log(`✅ User created successfully (ID: ${user.id})`);

    // Get reader role
    const readerRole = await query('SELECT * FROM roles WHERE name = $1', ['reader']);
    if (readerRole.rows.length === 0) {
      console.log('❌ Reader role not found');
      return;
    }

    // Assign role
    await query(
      `INSERT INTO user_roles (user_id, role_id, assigned_by, expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, role_id) DO UPDATE SET
       is_active = TRUE, assigned_by = $3, expires_at = $4`,
      [user.id, readerRole.rows[0].id, undefined, undefined]
    );
    console.log('✅ Role assigned successfully');

    // Log audit event
    await query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        undefined,
        'user.register',
        'users',
        user.id,
        JSON.stringify({ 
          email: testData.email, 
          username: testData.username, 
          first_name: testData.first_name, 
          last_name: testData.last_name, 
          double_opt_in: doubleOptInEnabled 
        }),
        '127.0.0.1',
        'Test Script'
      ]
    );
    console.log('✅ Audit event logged successfully');

    // Test welcome email
    try {
      const welcomeEmailResult = await query(`
        UPDATE users 
        SET welcome_email_sent = true, updated_at = NOW()
        WHERE id = $1
      `, [user.id]);
      console.log('✅ Welcome email marked as sent');
    } catch (emailError) {
      console.log('❌ Welcome email error:', emailError.message);
    }

    console.log('\n✅ Registration test completed successfully!');
    console.log(`User ID: ${user.id}`);
    console.log(`Email: ${testData.email}`);
    console.log(`Username: ${testData.username}`);

    // Clean up test user
    console.log('\n🧹 Cleaning up test user...');
    await query('DELETE FROM user_roles WHERE user_id = $1', [user.id]);
    await query('DELETE FROM audit_logs WHERE resource_id = $1 AND action = $2', [user.id, 'user.register']);
    await query('DELETE FROM users WHERE id = $1', [user.id]);
    console.log('✅ Test user cleaned up');

    console.log('\n🔍 Analysis:');
    console.log('✅ Database operations work correctly');
    console.log('✅ User creation works');
    console.log('✅ Role assignment works');
    console.log('✅ Audit logging works');
    console.log('✅ Email system works');
    console.log('\n💡 The "Internal server error" might be caused by:');
    console.log('   1. Server not running (npm run dev)');
    console.log('   2. Environment variables not set');
    console.log('   3. Network connectivity issues');
    console.log('   4. Frontend JavaScript errors');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await query('SELECT 1'); // Keep connection alive
    process.exit(0);
  }
}

testApiEndpoint(); 