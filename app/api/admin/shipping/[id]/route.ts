import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid shipping method ID' },
        { status: 400 }
      );
    }

    const result = await query(`
      SELECT * FROM shipping_methods WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Shipping method not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      method: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching shipping method:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid shipping method ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    // Check if shipping method exists
    const existingResult = await query(`
      SELECT id FROM shipping_methods WHERE id = $1
    `, [id]);

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Shipping method not found' },
        { status: 404 }
      );
    }

    // Update shipping method
    const result = await query(`
      UPDATE shipping_methods SET
        name = $1,
        description = $2,
        base_cost = $3,
        cost_per_item = $4,
        free_shipping_threshold = $5,
        estimated_days_min = $6,
        estimated_days_max = $7,
        is_active = $8,
        sort_order = $9
      WHERE id = $10
      RETURNING *
    `, [
      body.name,
      body.description,
      body.base_cost || 0,
      body.cost_per_item || 0,
      body.free_shipping_threshold,
      body.estimated_days_min || 1,
      body.estimated_days_max || 7,
      body.is_active !== false, // Default to true
      body.sort_order || 0,
      id
    ]);

    return NextResponse.json({
      success: true,
      method: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating shipping method:', error);
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

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid shipping method ID' },
        { status: 400 }
      );
    }

    // Check if shipping method exists
    const existingResult = await query(`
      SELECT id FROM shipping_methods WHERE id = $1
    `, [id]);

    if (existingResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Shipping method not found' },
        { status: 404 }
      );
    }

    // Check if shipping method is being used in any orders
    const usageResult = await query(`
      SELECT COUNT(*) as count FROM orders WHERE shipping_method_id = $1
    `, [id]);

    if (parseInt(usageResult.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete shipping method that is being used in orders' },
        { status: 400 }
      );
    }

    // Delete shipping method
    await query(`
      DELETE FROM shipping_methods WHERE id = $1
    `, [id]);

    return NextResponse.json({
      success: true,
      message: 'Shipping method deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting shipping method:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
