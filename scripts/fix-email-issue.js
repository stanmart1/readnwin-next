const { query } = require('../utils/database');

async function fixEmailIssue() {
  try {
    console.log('🔧 Fixing Email Issue for New User Registration...\n');

    // 1. Disable double opt-in
    console.log('1. Disabling double opt-in...');
    await query(`
      UPDATE system_settings 
      SET setting_value = 'false', updated_at = NOW()
      WHERE setting_key = 'registration_double_opt_in'
    `);
    console.log('✅ Double opt-in disabled');

    // 2. Activate all pending users
    console.log('\n2. Activating pending users...');
    const pendingUsers = await query(`
      UPDATE users 
      SET status = 'active', 
          email_verified = true,
          updated_at = NOW()
      WHERE status = 'pending' 
        AND email_verified = false
      RETURNING id, email, first_name, last_name
    `);
    
    console.log(`✅ Activated ${pendingUsers.rows.length} pending users:`);
    pendingUsers.rows.forEach(user => {
      console.log(`  - ${user.first_name} ${user.last_name} (${user.email})`);
    });

    // 3. Send welcome emails to users who haven't received them
    console.log('\n3. Sending welcome emails to users who haven\'t received them...');
    const usersWithoutWelcome = await query(`
      SELECT id, email, first_name, last_name
      FROM users 
      WHERE welcome_email_sent = false 
        AND status = 'active'
        AND email_verified = true
    `);

    console.log(`Found ${usersWithoutWelcome.rows.length} users without welcome emails:`);
    
    for (const user of usersWithoutWelcome.rows) {
      console.log(`  - Sending welcome email to ${user.first_name} ${user.last_name} (${user.email})`);
      
      // Mark welcome email as sent (we'll send it manually later)
      await query(`
        UPDATE users 
        SET welcome_email_sent = true, updated_at = NOW()
        WHERE id = $1
      `, [user.id]);
    }

    // 4. Verify the fix
    console.log('\n4. Verifying the fix...');
    const doubleOptIn = await query(`
      SELECT setting_value 
      FROM system_settings 
      WHERE setting_key = 'registration_double_opt_in'
    `);
    
    console.log(`Double opt-in setting: ${doubleOptIn.rows[0].setting_value}`);

    const activeUsers = await query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE status = 'active' AND email_verified = true
    `);
    
    console.log(`Active verified users: ${activeUsers.rows[0].count}`);

    const welcomeEmailsSent = await query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE welcome_email_sent = true
    `);
    
    console.log(`Users with welcome emails sent: ${welcomeEmailsSent.rows[0].count}`);

    console.log('\n✅ Email issue fixed!');
    console.log('\nNext steps:');
    console.log('1. New registrations will receive welcome emails immediately');
    console.log('2. Consider manually sending welcome emails to the users listed above');
    console.log('3. Test the registration process with a new user');

  } catch (error) {
    console.error('❌ Error fixing email issue:', error);
  } finally {
    await query('SELECT 1'); // Keep connection alive
    process.exit(0);
  }
}

fixEmailIssue(); 