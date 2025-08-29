import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: false // Disable SSL for this database connection
});

export async function GET() {
  try {
    console.log('🔍 Fetching works from database...');
    
    const client = await pool.connect();
    
    try {
      // First check if table exists
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'works'
        );
      `);
      
      if (!tableExists.rows[0].exists) {
        console.log('❌ Works table does not exist');
        return NextResponse.json({
          success: true,
          works: []
        });
      }
      
      const result = await client.query(`
        SELECT 
          id, 
          title, 
          description, 
          image_path, 
          alt_text, 
          order_index
        FROM works 
        WHERE is_active = true
        ORDER BY order_index ASC, created_at DESC
      `);
      
      console.log(`✅ Found ${result.rows.length} active works`);
      
      return NextResponse.json({
        success: true,
        works: result.rows
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Error fetching works:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch works', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 