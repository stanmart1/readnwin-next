const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false,
});

async function updateAboutContent() {
  const client = await pool.connect();
  
  try {
    // Get current content
    const result = await client.query(
      "SELECT value FROM system_settings WHERE key = 'about_page_content'"
    );
    
    if (result.rows.length > 0) {
      const currentContent = JSON.parse(result.rows[0].value);
      
      // Update the features array to remove AI-Powered Recommendations
      if (currentContent.mission && currentContent.mission.features) {
        currentContent.mission.features = currentContent.mission.features.filter(
          feature => feature !== 'AI-Powered Recommendations'
        );
        
        console.log('Updated features:', currentContent.mission.features);
        
        // Update the database
        await client.query(
          "UPDATE system_settings SET value = $1, updated_at = NOW() WHERE key = 'about_page_content'",
          [JSON.stringify(currentContent)]
        );
        
        console.log('✅ About page content updated successfully');
      } else {
        console.log('❌ Mission features not found in current content');
      }
    } else {
      console.log('❌ About page content not found in database');
    }
  } catch (error) {
    console.error('❌ Error updating about content:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updateAboutContent();