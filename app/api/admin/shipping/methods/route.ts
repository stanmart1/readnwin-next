import { sanitizeInput, sanitizeQuery, validateId, sanitizeHtml } from '@/lib/security';
import { requireAdmin, requirePermission } from '@/middleware/auth';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/database';

export async function GET() {
  try {
    await requireAdmin(request);
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await query(`
      SELECT * FROM shipping_methods 
      ORDER BY sort_order ASC, created_at DESC
    `);

    return NextResponse.json({
      success: true,
      methods: result.rows
    });

  } catch (error) {
    logger.error('Error fetching shipping methods:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    
  const body = await request.json();
  const sanitizedBody = {};
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'string') {
      sanitizedBody[key] = sanitizeInput(value);
    } else {
      sanitizedBody[key] = value;
    }
  }
    const {
      name,
      description,
      base_cost,
      cost_per_item,
      free_shipping_threshold,
      estimated_days_min,
      estimated_days_max,
      is_active,
      sort_order
    } = sanitizedBody;

    // Validate required fields
    if (!name || base_cost === undefined || cost_per_item === undefined) {
      return NextResponse.json(
        { error: 'Name, base_cost, and cost_per_item are required' },
        { status: 400 }
      );
    }

    const result = await query(`
      INSERT INTO shipping_methods (
        name, description, base_cost, cost_per_item, free_shipping_threshold,
        estimated_days_min, estimated_days_max, is_active, sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [
      name,
      description || '',
      base_cost,
      cost_per_item,
      free_shipping_threshold,
      estimated_days_min || 3,
      estimated_days_max || 7,
      is_active !== undefined ? is_active : true,
      sort_order || 0
    ]);

    return NextResponse.json({
      success: true,
      method_id: result.rows[0].id,
      message: 'Shipping method created successfully'
    });

  } catch (error) {
    logger.error('Error creating shipping method:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
