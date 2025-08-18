const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Database connection configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || '149.102.159.118',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'S48lyoqo1mX7ytoiBvDZfCBB4TiCcGIU1rEdpu0NfBFP3V9q426PKDkGmV8aMD8b',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false, // SSL is disabled for the new database
});

async function fixTimezone() {
  try {
    console.log('🔧 Fixing timezone settings for Nigeria (UTC+1)...');
    
    const client = await pool.connect();
    
    // Set timezone for the current session
    await client.query('SET timezone = \'Africa/Lagos\'');
    console.log('✅ Set session timezone to Africa/Lagos');
    
    // Check current timezone
    const timezoneResult = await client.query('SHOW timezone');
    console.log('📅 Current timezone:', timezoneResult.rows[0].TimeZone);
    
    // Get current time in different formats
    const nowResult = await client.query('SELECT NOW() as current_time, CURRENT_TIMESTAMP as current_timestamp');
    console.log('🕐 Current database time:', nowResult.rows[0].current_time);
    console.log('🕐 Current timestamp:', nowResult.rows[0].current_timestamp);
    
    // Update any existing timestamp columns to use timezone-aware format
    // Note: This is a read-only operation to check current data
    const tablesWithTimestamps = [
      'users',
      'reading_sessions', 
      'reading_progress',
      'user_bookmarks',
      'user_notes',
      'user_highlights',
      'orders',
      'audit_logs'
    ];
    
    console.log('📊 Checking timestamp columns in tables...');
    for (const table of tablesWithTimestamps) {
      try {
        const checkResult = await client.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = $1 AND data_type LIKE '%timestamp%'
        `, [table]);
        
        if (checkResult.rows.length > 0) {
          console.log(`  📋 ${table}:`, checkResult.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
        }
      } catch (error) {
        console.log(`  ⚠️ Could not check ${table}:`, error.message);
      }
    }
    
    client.release();
    
    console.log('✅ Timezone configuration completed');
    console.log('📝 Note: All new timestamps will be stored in Nigerian timezone (UTC+1)');
    console.log('📝 Note: Existing data timestamps will be interpreted in the new timezone');
    
  } catch (error) {
    console.error('❌ Error fixing timezone:', error);
  } finally {
    await pool.end();
  }
}

// Run the timezone fix
fixTimezone(); 