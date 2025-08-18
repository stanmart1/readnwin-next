import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/utils/database';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin permissions
    const userRoles = session.user.roles || [];
    const isAdmin = userRoles.includes('admin') || userRoles.includes('super_admin');
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { payment_status, notes } = body;

    if (!payment_status) {
      return NextResponse.json(
        { error: 'Payment status is required' },
        { status: 400 }
      );
    }

    // Get current order
    const currentOrder = await query(
      'SELECT * FROM orders WHERE id = $1',
      [orderId]
    );

    if (currentOrder.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = currentOrder.rows[0];

    // Update payment status
    const result = await query(
      `UPDATE orders 
       SET payment_status = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [orderId, payment_status]
    );

    const updatedOrder = result.rows[0];

    // Add note if provided (don't fail if this errors)
    if (notes) {
      try {
        await query(
          `INSERT INTO order_notes (order_id, user_id, note, is_internal, note_type)
           VALUES ($1, $2, $3, true, 'payment_status_update')`,
          [orderId, parseInt(session.user.id), notes]
        );
      } catch (noteError) {
        console.error('Error adding note (non-critical):', noteError);
        // Continue execution - this is not critical
      }
    }

    // Log admin action (don't fail if this errors)
    try {
      await query(`
        INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        parseInt(session.user.id),
        'PAYMENT_STATUS_UPDATE',
        'orders',
        orderId,
        JSON.stringify({ 
          old_payment_status: order.payment_status,
          new_payment_status: payment_status, 
          notes 
        }),
        'admin_dashboard'
      ]);
    } catch (auditError) {
      console.error('Error logging audit (non-critical):', auditError);
      // Continue execution - this is not critical
    }

    console.log('✅ Payment status update successful:', {
      orderId,
      newPaymentStatus: payment_status,
      updatedOrder: updatedOrder ? updatedOrder.id : null
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Payment status updated successfully'
    });

  } catch (error) {
    console.error('❌ Error in PATCH /api/admin/orders/[id]/payment-status:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 