require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false
});

async function updateAboutPageContent() {
  const client = await pool.connect();
  try {
    console.log('🔄 Updating about page content in database...');
    
    // Get current content
    const result = await client.query(
      'SELECT setting_value FROM system_settings WHERE setting_key = $1',
      ['about_page_content']
    );

    if (result.rows.length > 0) {
      const content = JSON.parse(result.rows[0].setting_value);
      console.log('📋 Found existing about page content');
      
      // Update team member images to use local URLs
      if (content.team && Array.isArray(content.team)) {
        console.log('🔄 Updating team member images...');
        content.team.forEach(member => {
          if (member.name === 'Sarah Johnson') {
            member.image = '/images/team/sarah-johnson.jpg';
          } else if (member.name === 'Dr. Michael Chen') {
            member.image = '/images/team/michael-chen.jpg';
          } else if (member.name === 'Emma Rodriguez') {
            member.image = '/images/team/emma-rodriguez.jpg';
          } else if (member.name === 'David Wilson') {
            member.image = '/images/team/david-wilson.jpg';
          }
        });
      }
      
      // Update the database
      await client.query(
        'UPDATE system_settings SET setting_value = $1 WHERE setting_key = $2',
        [JSON.stringify(content), 'about_page_content']
      );
      
      console.log('✅ About page content updated successfully!');
      console.log('Team member images updated to use local URLs');
    } else {
      console.log('❌ No about page content found in database');
    }
    
  } finally {
    client.release();
    await pool.end();
  }
}

updateAboutPageContent().catch(console.error); 