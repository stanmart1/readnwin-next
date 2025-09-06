import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false,
});

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      "SELECT value FROM system_settings WHERE key = 'about_page_content'"
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'No content found' });
    }
    
    const currentContent = JSON.parse(result.rows[0].value);
    
    if (currentContent.mission?.features && Array.isArray(currentContent.mission.features)) {
      const originalLength = currentContent.mission.features.length;
      currentContent.mission.features = currentContent.mission.features.filter(
        feature => feature !== 'AI-Powered Recommendations'
      );
      
      if (originalLength !== currentContent.mission.features.length) {
        await client.query(
          "UPDATE system_settings SET value = $1, updated_at = NOW() WHERE key = 'about_page_content'",
          [JSON.stringify(currentContent)]
        );
        
        return NextResponse.json({ 
          success: true, 
          message: 'Content updated successfully'
        });
      }
    }
    
    return NextResponse.json({ success: true, message: 'No changes needed' });
    
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Update failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    client.release();
  }
}