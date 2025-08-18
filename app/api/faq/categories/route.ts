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

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const query = `
        SELECT * FROM faq_categories 
        WHERE is_active = true 
        ORDER BY name
      `;
      
      const result = await client.query(query);
      
      return NextResponse.json({
        success: true,
        data: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching FAQ categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch FAQ categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Category name is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const query = `
        INSERT INTO faq_categories (name, description, icon, color, is_active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const values = [
        body.name,
        body.description || '',
        body.icon || 'ri-question-line',
        body.color || '#3B82F6',
        body.is_active !== undefined ? body.is_active : true
      ];
      
      const result = await client.query(query, values);
      
      return NextResponse.json({
        success: true,
        data: result.rows[0]
      }, { status: 201 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating FAQ category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create FAQ category' },
      { status: 500 }
    );
  }
} 