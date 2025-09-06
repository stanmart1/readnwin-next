import { sanitizeInput, sanitizeQuery, validateId, sanitizeHtml } from '@/lib/security';
import { requireAdmin, requirePermission } from '@/middleware/auth';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (!(session.user.role === 'admin' || session.user.role === 'super_admin')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has admin role
    if (!(session.user.role === 'admin' || session.user.role === 'super_admin')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
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
    
    // Validate required fields
    if (!sanitizedBody.name || !sanitizedBody.description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    // Insert new shipping method
    const result = await query(`
      INSERT INTO shipping_methods (
        name, 
        description, 
        base_cost, 
        cost_per_item, 
        free_shipping_threshold, 
        estimated_days_min, 
        estimated_days_max, 
        is_active, 
        sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      sanitizedBody.name,
      sanitizedBody.description,
      sanitizedBody.base_cost || 0,
      sanitizedBody.cost_per_item || 0,
      sanitizedBody.free_shipping_threshold,
      sanitizedBody.estimated_days_min || 1,
      sanitizedBody.estimated_days_max || 7,
      sanitizedBody.is_active !== false, // Default to true
      sanitizedBody.sort_order || 0
    ]);

    return NextResponse.json({
      success: true,
      method: result.rows[0]
    });

  } catch (error) {
    logger.error('Error creating shipping method:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
