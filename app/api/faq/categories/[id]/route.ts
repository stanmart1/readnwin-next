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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category ID' },
        { status: 400 }
      );
    }

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
        UPDATE faq_categories 
        SET 
          name = $1,
          description = $2,
          icon = $3,
          color = $4,
          is_active = $5
        WHERE id = $6
        RETURNING *
      `;
      
      const values = [
        body.name,
        body.description || '',
        body.icon || 'ri-question-line',
        body.color || '#3B82F6',
        body.is_active !== undefined ? body.is_active : true,
        id
      ];
      
      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Category not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: result.rows[0]
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating FAQ category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update FAQ category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      // Check if category is being used by any FAQs
      const checkQuery = 'SELECT COUNT(*) as count FROM faqs WHERE category = (SELECT name FROM faq_categories WHERE id = $1)';
      const checkResult = await client.query(checkQuery, [id]);
      
      if (parseInt(checkResult.rows[0].count) > 0) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete category that has FAQs' },
          { status: 400 }
        );
      }

      const query = 'DELETE FROM faq_categories WHERE id = $1';
      const result = await client.query(query, [id]);
      
      if (result.rowCount === 0) {
        return NextResponse.json(
          { success: false, error: 'Category not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting FAQ category:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete FAQ category' },
      { status: 500 }
    );
  }
} 