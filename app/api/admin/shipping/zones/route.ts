import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/database';

export async function GET() {
  try {
    const result = await query(`
      SELECT * FROM shipping_zones 
      ORDER BY name ASC
    `);

    return NextResponse.json({
      success: true,
      zones: result.rows
    });

  } catch (error) {
    console.error('Error fetching shipping zones:', error);
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
      name,
      description,
      countries,
      states,
      is_active
    } = body;

    // Validate required fields
    if (!name || !countries || countries.length === 0) {
      return NextResponse.json(
        { error: 'Name and countries are required' },
        { status: 400 }
      );
    }

    const result = await query(`
      INSERT INTO shipping_zones (
        name, description, countries, states, is_active
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [
      name,
      description || '',
      countries,
      states || [],
      is_active !== undefined ? is_active : true
    ]);

    return NextResponse.json({
      success: true,
      zone_id: result.rows[0].id,
      message: 'Shipping zone created successfully'
    });

  } catch (error) {
    console.error('Error creating shipping zone:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
