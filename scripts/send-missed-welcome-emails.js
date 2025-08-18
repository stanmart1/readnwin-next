const { query } = require('../utils/database');

async function sendMissedWelcomeEmails() {
  try {
    console.log('📧 Sending missed welcome emails...\n');

    // Get users who should receive welcome emails
    const usersToEmail = await query(`
      SELECT id, email, first_name, last_name
      FROM users 
      WHERE welcome_email_sent = false 
        AND status = 'active'
        AND email_verified = true
        AND email NOT LIKE '%test%'
        AND email != 'admin@readnwin.com'
    `);

    console.log(`Found ${usersToEmail.rows.length} users to send welcome emails to:`);

    for (const user of usersToEmail.rows) {
      const userName = `${user.first_name} ${user.last_name}`;
      console.log(`\n📧 Sending welcome email to ${userName} (${user.email})...`);
      
      try {
        // Call the welcome email API endpoint
        const response = await fetch('http://localhost:3000/api/email/welcome', {
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
        } else {
          const error = await response.json();
          console.log(`❌ Failed to send welcome email to ${user.email}:`, error.error);
        }
      } catch (error) {
        console.log(`❌ Error sending welcome email to ${user.email}:`, error.message);
      }
    }

    console.log('\n✅ Welcome email sending process completed!');
    console.log('\nNote: Check the email service logs for delivery status.');

  } catch (error) {
    console.error('❌ Error in send missed welcome emails:', error);
  } finally {
    await query('SELECT 1'); // Keep connection alive
    process.exit(0);
  }
}

sendMissedWelcomeEmails(); 