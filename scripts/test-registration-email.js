#!/usr/bin/env node

/**
 * Test Registration Email Process
 * This script tests the registration process to ensure welcome emails are sent
 */

require('dotenv').config({ path: '.env.local' });
const { query } = require('../utils/database');

async function testRegistrationEmail() {
  try {
    console.log('🧪 Testing Registration Email Process...\n');

    // Test data
    const testUser = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test-registration@example.com',
      username: 'testuser123',
      password: 'testpassword123'
    };

    console.log('📝 Test user data:');
    console.log(`- Name: ${testUser.first_name} ${testUser.last_name}`);
    console.log(`- Email: ${testUser.email}`);
    console.log(`- Username: ${testUser.username}`);

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [testUser.email, testUser.username]
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  Test user already exists, using existing user');
      const userId = existingUser.rows[0].id;
      
      // Check if welcome email was sent
      const userStatus = await query(
        'SELECT welcome_email_sent FROM users WHERE id = $1',
        [userId]
      );
      
      console.log(`Welcome email sent: ${userStatus.rows[0].welcome_email_sent}`);
      
      if (!userStatus.rows[0].welcome_email_sent) {
        console.log('📧 Sending welcome email to existing user...');
        // Call the welcome email API
        const response = await fetch('http://localhost:3000/api/email/welcome', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: testUser.email,
            userName: `${testUser.first_name} ${testUser.last_name}`
          })
        });

        if (response.ok) {
          console.log('✅ Welcome email sent successfully!');
        } else {
          console.log('❌ Failed to send welcome email');
        }
      }
    } else {
      console.log('📝 Creating new test user...');
      
      // Simulate registration by calling the registration API
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testUser)
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Test user created successfully!');
        console.log('📧 Welcome email should have been sent during registration');
        
        // Check if welcome email was actually sent
        const userStatus = await query(
          'SELECT welcome_email_sent FROM users WHERE email = $1',
          [testUser.email]
        );
        
        if (userStatus.rows.length > 0) {
          console.log(`Welcome email sent: ${userStatus.rows[0].welcome_email_sent}`);
        }
      } else {
        console.log('❌ Failed to create test user:', result.error);
      }
    }

    // Test the welcome email API directly
    console.log('\n🧪 Testing welcome email API directly...');
    const apiResponse = await fetch('http://localhost:3000/api/email/welcome', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'direct-test@example.com',
        userName: 'Direct Test User'
      })
    });

    if (apiResponse.ok) {
      const apiResult = await apiResponse.json();
      console.log('✅ Direct API test successful!');
      console.log('Response:', apiResult.message);
    } else {
      console.log('❌ Direct API test failed');
    }

  } catch (error) {
    console.error('❌ Error testing registration email:', error);
  } finally {
    await query('SELECT 1'); // Keep connection alive
    process.exit(0);
  }
}

testRegistrationEmail(); 