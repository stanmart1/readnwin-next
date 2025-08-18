import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/database';

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        smz.id,
        smz.shipping_method_id,
        smz.shipping_zone_id,
        smz.is_available,
        smz.created_at,
        sm.name as method_name,
        sz.name as zone_name
      FROM shipping_method_zones smz
      JOIN shipping_methods sm ON smz.shipping_method_id = sm.id
      JOIN shipping_zones sz ON smz.shipping_zone_id = sz.id
      ORDER BY smz.shipping_method_id, smz.shipping_zone_id
    `);

    return NextResponse.json({
      success: true,
      methodZones: result.rows
    });

  } catch (error) {
    console.error('Error fetching method-zone associations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      shipping_method_id,
      shipping_zone_id,
      is_available
    } = body;

    // Validate required fields
    if (!shipping_method_id || !shipping_zone_id) {
      return NextResponse.json(
        { error: 'Shipping method ID and zone ID are required' },
        { status: 400 }
      );
    }

    // Check if association already exists
    const existingCheck = await query(`
      SELECT id FROM shipping_method_zones 
      WHERE shipping_method_id = $1 AND shipping_zone_id = $2
    `, [shipping_method_id, shipping_zone_id]);

    if (existingCheck.rows.length > 0) {
      // Update existing association
      await query(`
        UPDATE shipping_method_zones SET
          is_available = $1,
          created_at = CURRENT_TIMESTAMP
        WHERE shipping_method_id = $2 AND shipping_zone_id = $3
      `, [is_available, shipping_method_id, shipping_zone_id]);
    } else {
      // Create new association
      await query(`
        INSERT INTO shipping_method_zones (
          shipping_method_id, shipping_zone_id, is_available
        ) VALUES ($1, $2, $3)
      `, [shipping_method_id, shipping_zone_id, is_available]);
    }

    return NextResponse.json({
      success: true,
      message: 'Method-zone association updated successfully'
    });

  } catch (error) {
    console.error('Error updating method-zone association:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
