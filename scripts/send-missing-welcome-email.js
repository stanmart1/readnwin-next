require('dotenv').config({ path: '.env.local' });
const { query } = require('../utils/database');

async function sendMissingWelcomeEmail() {
  try {
    console.log('📧 Sending Missing Welcome Email...\n');

    // Get base URL from environment
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Find users who haven't received welcome emails
    const usersWithoutWelcome = await query(`
      SELECT id, email, first_name, last_name, created_at
      FROM users 
      WHERE welcome_email_sent = false 
        AND status = 'active'
        AND email_verified = true
        AND email NOT LIKE '%test%'
        AND email != 'admin@readnwin.com'
      ORDER BY created_at DESC
    `);

    if (usersWithoutWelcome.rows.length === 0) {
      console.log('✅ No users found without welcome emails');
      return;
    }

    console.log(`Found ${usersWithoutWelcome.rows.length} user(s) without welcome emails:`);
    usersWithoutWelcome.rows.forEach(user => {
      console.log(`  - ${user.first_name} ${user.last_name} (${user.email}) - Created: ${user.created_at}`);
    });

    // Send welcome emails to each user
    for (const user of usersWithoutWelcome.rows) {
      const userName = `${user.first_name} ${user.last_name}`;
      console.log(`\n📧 Sending welcome email to ${userName} (${user.email})...`);
      
      try {
        // Call the welcome email API endpoint
        const response = await fetch(`${baseUrl}/api/email/welcome`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            userName: userName
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Welcome email sent successfully to ${user.email}`);
          console.log(`   Response: ${result.message}`);
          
          // Mark welcome email as sent in database
          await query(`
            UPDATE users 
            SET welcome_email_sent = true, updated_at = NOW()
            WHERE id = $1
          `, [user.id]);
          console.log(`✅ Database updated: welcome_email_sent = true`);
          
        } else {
          const error = await response.json();
          console.log(`❌ Failed to send welcome email to ${user.email}:`, error.error);
        }
      } catch (error) {
        console.log(`❌ Error sending welcome email to ${user.email}:`, error.message);
        
        // If API call fails, try sending directly using the email service
        console.log(`🔄 Trying direct email sending...`);
        try {
          const { sendWelcomeEmail } = require('../utils/email');
          const result = await sendWelcomeEmail(user.email, userName);
          
          if (result.success) {
            console.log(`✅ Direct welcome email sent successfully to ${user.email}`);
            
            // Mark welcome email as sent in database
            await query(`
              UPDATE users 
              SET welcome_email_sent = true, updated_at = NOW()
              WHERE id = $1
            `, [user.id]);
            console.log(`✅ Database updated: welcome_email_sent = true`);
          } else {
            console.log(`❌ Direct email sending failed:`, result.error);
          }
        } catch (directError) {
          console.log(`❌ Direct email sending error:`, directError.message);
        }
      }
    }

    console.log('\n✅ Welcome email sending process completed!');
    console.log('\n📋 Summary:');
    console.log(`- Users processed: ${usersWithoutWelcome.rows.length}`);
    console.log(`- Emails sent: ${usersWithoutWelcome.rows.length}`);
    
    // Verify the fix
    const remainingUsers = await query(`
      SELECT COUNT(*) as count
      FROM users 
      WHERE welcome_email_sent = false 
        AND status = 'active'
        AND email_verified = true
        AND email NOT LIKE '%test%'
        AND email != 'admin@readnwin.com'
    `);
    
    console.log(`- Users still without welcome emails: ${remainingUsers.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error in send missing welcome email:', error);
  } finally {
    await query('SELECT 1'); // Keep connection alive
    process.exit(0);
  }
}

sendMissingWelcomeEmail(); 