import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ecommerceService } from '@/utils/ecommerce-service';
import { rbacService } from '@/utils/rbac-service';
import { OrderStatus } from '@/utils/order-types';

// Helper function to handle order status updates
async function handleOrderStatusUpdate(
  request: NextRequest,
  params: { id: string }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permission
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'orders.update'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = Object.values(OrderStatus);
    if (!validStatuses.includes(status as OrderStatus)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Get order info before update for audit log
    const order = await ecommerceService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const oldStatus = order.status;

    // Update order status
    let updated;
    try {
      updated = await ecommerceService.updateOrderStatus(orderId, status);
      
      if (!updated) {
        return NextResponse.json(
          { error: 'Failed to update order status' },
          { status: 500 }
        );
      }
    } catch (updateError) {
      console.error('Error updating order status:', updateError);
      
      // Check if it's a constraint violation error
      if (updateError instanceof Error && updateError.message.includes('check constraint')) {
        return NextResponse.json(
          { 
            error: 'Database constraint error. The new status may not be supported by the current database schema. Please contact the administrator to update the database constraints.',
            details: 'This error occurs when trying to use new order statuses that are not yet supported by the database.'
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: updateError instanceof Error ? updateError.message : 'Failed to update order status' },
        { status: 500 }
      );
    }

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'orders.update',
      'orders',
      orderId,
      { 
        order_number: order.order_number,
        old_status: oldStatus,
        new_status: status,
        total_amount: order.total_amount,
        user_id: order.user_id
      },
      request.headers.get('x-forwarded-for') || request.ip || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      order: {
        id: orderId,
        status: status
      }
    });

  } catch (error) {
    console.error('Error updating order status:', error);
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
  return handleOrderStatusUpdate(request, params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleOrderStatusUpdate(request, params);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 