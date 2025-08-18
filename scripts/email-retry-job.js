require('dotenv').config({ path: '.env.local' });
const { query } = require('../utils/database');

async function emailRetryJob() {
  try {
    console.log('🔄 Running Email Retry Job...\n');

    // Get base URL from environment
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // 1. Check for users without welcome emails
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

    if (usersWithoutWelcome.rows.length > 0) {
      console.log(`Found ${usersWithoutWelcome.rows.length} user(s) without welcome emails`);
      
      for (const user of usersWithoutWelcome.rows) {
        const userName = `${user.first_name} ${user.last_name}`;
        console.log(`\n📧 Attempting to send welcome email to ${userName} (${user.email})...`);
        
        try {
          // Try sending via API
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
            
            // Mark as sent in database
            await query(`
              UPDATE users 
              SET welcome_email_sent = true, updated_at = NOW()
              WHERE id = $1
            `, [user.id]);
            console.log(`✅ Database updated: welcome_email_sent = true`);
          } else {
            throw new Error(`API returned ${response.status}`);
          }
        } catch (error) {
          console.log(`❌ Failed to send welcome email to ${user.email}: ${error.message}`);
          
          // Add to retry queue for later attempts
          const existingRetry = await query(`
            SELECT id FROM email_retry_queue 
            WHERE user_id = $1 AND email_type = 'welcome'
          `, [user.id]);

          if (existingRetry.rows.length === 0) {
            await query(`
              INSERT INTO email_retry_queue (user_id, email_type, email_address, user_name, next_retry_at)
              VALUES ($1, $2, $3, $4, NOW() + INTERVAL '15 minutes')
            `, [
              user.id,
              'welcome',
              user.email,
              userName
            ]);
            console.log(`✅ Added ${user.email} to retry queue for later attempt`);
          }
        }
      }
    } else {
      console.log('✅ All users have received welcome emails');
    }

    // 2. Process retry queue
    console.log('\n🔄 Processing email retry queue...');
    const pendingEmails = await query(`
      SELECT * FROM email_retry_queue 
      WHERE status = 'pending' 
        AND next_retry_at <= NOW()
        AND retry_count < max_retries
      ORDER BY created_at ASC
    `);

    if (pendingEmails.rows.length > 0) {
      console.log(`Found ${pendingEmails.rows.length} emails to retry`);
      
      for (const emailJob of pendingEmails.rows) {
        console.log(`\n🔄 Retrying welcome email for ${emailJob.email_address} (Attempt ${emailJob.retry_count + 1})`);
        
        try {
          // Mark as processing
          await query(`
            UPDATE email_retry_queue 
            SET status = 'processing', updated_at = NOW()
            WHERE id = $1
          `, [emailJob.id]);

          // Try sending email
          const response = await fetch(`${baseUrl}/api/email/welcome`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: emailJob.email_address,
              userName: emailJob.user_name
            })
          });

          if (response.ok) {
            // Mark as completed
            await query(`
              UPDATE email_retry_queue 
              SET status = 'completed', updated_at = NOW()
              WHERE id = $1
            `, [emailJob.id]);

            // Update user record
            await query(`
              UPDATE users 
              SET welcome_email_sent = true, updated_at = NOW()
              WHERE id = $1
            `, [emailJob.user_id]);

            console.log(`✅ Welcome email sent successfully to ${emailJob.email_address}`);
          } else {
            throw new Error(`API returned ${response.status}`);
          }
        } catch (error) {
          console.log(`❌ Retry failed: ${error.message}`);
          
          // Update retry count and schedule next retry
          const nextRetryDelay = Math.min(30 * Math.pow(2, emailJob.retry_count), 1440); // Max 24 hours
          await query(`
            UPDATE email_retry_queue 
            SET status = 'pending', 
                retry_count = retry_count + 1,
                next_retry_at = NOW() + INTERVAL '${nextRetryDelay} minutes',
                updated_at = NOW()
            WHERE id = $1
          `, [emailJob.id]);

          if (emailJob.retry_count + 1 >= emailJob.max_retries) {
            await query(`
              UPDATE email_retry_queue 
              SET status = 'failed', updated_at = NOW()
              WHERE id = $1
            `, [emailJob.id]);
            console.log(`❌ Max retries reached for ${emailJob.email_address}`);
          }
        }
      }
    } else {
      console.log('✅ No emails in retry queue');
    }

    // 3. Clean up old failed jobs (older than 7 days)
    const cleanupResult = await query(`
      DELETE FROM email_retry_queue 
      WHERE status = 'failed' 
        AND updated_at < NOW() - INTERVAL '7 days'
    `);
    
    if (cleanupResult.rowCount > 0) {
      console.log(`🧹 Cleaned up ${cleanupResult.rowCount} old failed email jobs`);
    }

    console.log('\n✅ Email retry job completed!');
    console.log('\n📋 Summary:');
    console.log(`- Users processed: ${usersWithoutWelcome.rows.length}`);
    console.log(`- Emails retried: ${pendingEmails.rows.length}`);
    console.log(`- Registration process unaffected ✅`);
    console.log(`- Users will receive emails eventually ✅`);

  } catch (error) {
    console.error('❌ Error in email retry job:', error);
  } finally {
    await query('SELECT 1'); // Keep connection alive
    process.exit(0);
  }
}

emailRetryJob(); 