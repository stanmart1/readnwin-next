import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/database';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const methodId = Number(params.id);
    
    if (isNaN(methodId)) {
      return NextResponse.json(
        { error: 'Invalid method ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
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
    } = body;

    // Validate required fields
    if (!name || base_cost === undefined || cost_per_item === undefined) {
      return NextResponse.json(
        { error: 'Name, base_cost, and cost_per_item are required' },
        { status: 400 }
      );
    }

    await query(`
      UPDATE shipping_methods SET
        name = $1,
        description = $2,
        base_cost = $3,
        cost_per_item = $4,
        free_shipping_threshold = $5,
        estimated_days_min = $6,
        estimated_days_max = $7,
        is_active = $8,
        sort_order = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
    `, [
      name,
      description || '',
      base_cost,
      cost_per_item,
      free_shipping_threshold,
      estimated_days_min || 3,
      estimated_days_max || 7,
      is_active !== undefined ? is_active : true,
      sort_order || 0,
      methodId
    ]);

    return NextResponse.json({
      success: true,
      message: 'Shipping method updated successfully'
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
    const methodId = Number(params.id);
    
    if (isNaN(methodId)) {
      return NextResponse.json(
        { error: 'Invalid method ID' },
        { status: 400 }
      );
    }

    // Check if method is being used in any orders
    const usageCheck = await query(`
      SELECT COUNT(*) FROM orders WHERE shipping_method_id = $1
    `, [methodId]);

    if (Number(usageCheck.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete shipping method that is being used in orders' },
        { status: 400 }
      );
    }

    // Delete method-zone associations first
    await query(`
      DELETE FROM shipping_method_zones WHERE shipping_method_id = $1
    `, [methodId]);

    // Delete the method
    await query(`
      DELETE FROM shipping_methods WHERE id = $1
    `, [methodId]);

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
