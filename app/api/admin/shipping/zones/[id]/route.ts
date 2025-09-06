import { sanitizeInput, sanitizeQuery, validateId, sanitizeHtml } from '@/lib/security';
import { requireAdmin, requirePermission } from '@/middleware/auth';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request);
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!validateId(params.id)) {
    return Response.json({ error: 'Invalid ID format' }, { status: 400 });
  }
  try {
    const zoneId = Number(params.id);

    if (isNaN(zoneId)) {
      return NextResponse.json(
        { error: 'Invalid zone ID' },
        { status: 400 }
      );
    }

    
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
      countries,
      states,
      is_active
    } = sanitizedBody;

    // Validate required fields
    if (!name || !countries || countries.length === 0) {
      return NextResponse.json(
        { error: 'Name and countries are required' },
        { status: 400 }
      );
    }

    await query(`
      UPDATE shipping_zones SET
        name = $1,
        description = $2,
        countries = $3,
        states = $4,
        is_active = $5
      WHERE id = $6
    `, [
      name,
      description || '',
      countries,
      states || [],
      is_active !== undefined ? is_active : true,
      zoneId
    ]);

    return NextResponse.json({
      success: true,
      message: 'Shipping zone updated successfully'
    });

  } catch (error) {
    logger.error('Error updating shipping zone:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const zoneId = Number(params.id);

    if (isNaN(zoneId)) {
      return NextResponse.json(
        { error: 'Invalid zone ID' },
        { status: 400 }
      );
    }

    // Check if zone is being used in any orders
    const usageCheck = await query(`
      SELECT COUNT(*) FROM orders WHERE shipping_zone_id = $1
    `, [zoneId]);

    if (Number(usageCheck.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete shipping zone that is being used in orders' },
        { status: 400 }
      );
    }

    // Delete method-zone associations first
    await query(`
      DELETE FROM shipping_method_zones WHERE shipping_zone_id = $1
    `, [zoneId]);

    // Delete the zone
    await query(`
      DELETE FROM shipping_zones WHERE id = $1
    `, [zoneId]);

    return NextResponse.json({
      success: true,
      message: 'Shipping zone deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting shipping zone:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
