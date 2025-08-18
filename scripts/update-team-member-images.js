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

async function updateTeamMemberImages() {
  const client = await pool.connect();
  try {
    console.log('🔄 Updating team member images to use local URLs...');
    
    // Define local image URLs for team members
    const teamMemberUpdates = [
      {
        id: 1,
        name: 'Sarah Johnson',
        imageUrl: '/images/team/sarah-johnson.jpg'
      },
      {
        id: 2,
        name: 'Dr. Michael Chen',
        imageUrl: '/images/team/michael-chen.jpg'
      },
      {
        id: 3,
        name: 'Emma Rodriguez',
        imageUrl: '/images/team/emma-rodriguez.jpg'
      },
      {
        id: 4,
        name: 'David Wilson',
        imageUrl: '/images/team/david-wilson.jpg'
      }
    ];
    
    for (const member of teamMemberUpdates) {
      console.log(`📝 Updating ${member.name} (ID: ${member.id})...`);
      
      await client.query(
        'UPDATE team_members SET image_url = $1 WHERE id = $2',
        [member.imageUrl, member.id]
      );
      
      console.log(`✅ Updated ${member.name} to use: ${member.imageUrl}`);
    }
    
    console.log('\n✅ All team member images updated successfully!');
    console.log('📝 Note: You may need to add actual team member photos to the /public/images/team/ directory');
    
  } finally {
    client.release();
    await pool.end();
  }
}

updateTeamMemberImages().catch(console.error); 