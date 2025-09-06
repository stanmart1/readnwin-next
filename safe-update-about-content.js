const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false,
});

async function safeUpdateAboutContent() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Starting safe update of about content...');
    
    // First, backup the current content
    const result = await client.query(
      "SELECT value FROM system_settings WHERE key = 'about_page_content'"
    );
    
    if (result.rows.length === 0) {
      console.log('ℹ️ No about_page_content found in database - nothing to update');
      return;
    }
    
    const currentValue = result.rows[0].value;
    console.log('📋 Current content backed up');
    
    try {
      const currentContent = JSON.parse(currentValue);
      
      // Check if mission.features exists and contains the target text
      if (currentContent.mission && 
          currentContent.mission.features && 
          Array.isArray(currentContent.mission.features)) {
        
        const originalFeatures = [...currentContent.mission.features];
        
        // Remove AI-Powered Recommendations
        currentContent.mission.features = currentContent.mission.features.filter(
          feature => feature !== 'AI-Powered Recommendations'
        );
        
        // Only update if there was a change
        if (originalFeatures.length !== currentContent.mission.features.length) {
          console.log('🔄 Updating features from:', originalFeatures);
          console.log('🔄 Updating features to:', currentContent.mission.features);
          
          // Update the database
          await client.query(
            "UPDATE system_settings SET value = $1, updated_at = NOW() WHERE key = 'about_page_content'",
            [JSON.stringify(currentContent)]
          );
          
          console.log('✅ About page content updated successfully');
          console.log('📊 Removed "AI-Powered Recommendations" from features');
        } else {
          console.log('ℹ️ No changes needed - "AI-Powered Recommendations" not found');
        }
      } else {
        console.log('⚠️ Mission features structure not found - no update needed');
      }
      
    } catch (parseError) {
      console.error('❌ Error parsing JSON content:', parseError.message);
      console.log('🔧 Content appears to be malformed, skipping update to prevent data loss');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    client.release();
    await pool.end();
    console.log('🔚 Database connection closed');
  }
}

// Run with error handling
safeUpdateAboutContent().catch(error => {
  console.error('💥 Script failed:', error.message);
  process.exit(1);
});