const { query } = require('../utils/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function testRegistration() {
  try {
    console.log('🧪 Testing Registration Process Step by Step...\n');

    const testData = {
      first_name: 'Test',
      last_name: 'User',
      email: 'testregistration@example.com',
      username: 'testregistration',
      password: 'TestPassword123!'
    };

    console.log('1. Validating input data...');
    // Validate required fields
    if (!testData.first_name || !testData.last_name || !testData.email || !testData.username || !testData.password) {
      throw new Error('All fields are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testData.email)) {
      throw new Error('Please enter a valid email address');
    }

    // Validate password strength
    if (testData.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Validate username
    if (testData.username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }

    console.log('✅ Input validation passed');

    console.log('\n2. Checking if user already exists...');
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [testData.email]);
    if (existingUser.rows.length > 0) {
      console.log('❌ User with this email already exists');
      return;
    }
    console.log('✅ User does not exist');

    console.log('\n3. Checking double opt-in setting...');
    const doubleOptInResult = await query(`
      SELECT setting_value FROM system_settings 
      WHERE setting_key = 'registration_double_opt_in'
    `);
    
    const doubleOptInEnabled = doubleOptInResult.rows[0]?.setting_value === 'true';
    console.log(`Double opt-in enabled: ${doubleOptInEnabled}`);

    console.log('\n4. Hashing password...');
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(testData.password, saltRounds);
    console.log('✅ Password hashed successfully');

    console.log('\n5. Generating verification token...');
    let verificationToken = undefined;
    let verificationExpires = undefined;
    let initialStatus = 'active';
    
    if (doubleOptInEnabled) {
      verificationToken = crypto.randomBytes(32).toString('hex');
      verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      initialStatus = 'pending';
    }
    console.log(`Initial status: ${initialStatus}`);

    console.log('\n6. Creating user...');
    const userResult = await query(
      `INSERT INTO users (email, username, password_hash, first_name, last_name, status, email_verified, email_verification_token, email_verification_expires, welcome_email_sent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        testData.email,
        testData.username,
        passwordHash,
        testData.first_name,
        testData.last_name,
        initialStatus,
        !doubleOptInEnabled,
        verificationToken,
        verificationExpires,
        false
      ]
    );
    
    const user = userResult.rows[0];
    console.log(`✅ User created successfully (ID: ${user.id})`);

    console.log('\n7. Getting reader role...');
    const readerRole = await query('SELECT * FROM roles WHERE name = $1', ['reader']);
    if (readerRole.rows.length === 0) {
      console.log('❌ Reader role not found');
      return;
    }
    console.log(`✅ Reader role found (ID: ${readerRole.rows[0].id})`);

    console.log('\n8. Assigning reader role to user...');
    const roleAssignment = await query(
      `INSERT INTO user_roles (user_id, role_id, assigned_by, expires_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, role_id) DO UPDATE SET
       is_active = TRUE, assigned_by = $3, expires_at = $4`,
      [user.id, readerRole.rows[0].id, undefined, undefined]
    );
    console.log('✅ Role assigned successfully');

    console.log('\n9. Logging audit event...');
    const auditResult = await query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        undefined, // System event
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

    console.log('\n10. Testing email sending...');
    try {
      // Test welcome email API call
      const response = await fetch('http://localhost:3000/api/email/welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testData.email,
          userName: `${testData.first_name} ${testData.last_name}`
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Welcome email sent successfully: ${result.message}`);
      } else {
        const error = await response.json();
        console.log(`❌ Welcome email failed: ${error.error}`);
      }
    } catch (emailError) {
      console.log(`❌ Email sending error: ${emailError.message}`);
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

  } catch (error) {
    console.error('❌ Registration test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await query('SELECT 1'); // Keep connection alive
    process.exit(0);
  }
}

testRegistration(); 