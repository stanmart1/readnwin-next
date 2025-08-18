import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ecommerceService } from '@/utils/ecommerce-service';
import { OrderStatus } from '@/utils/order-types';
import { query } from '@/utils/database';

export async function GET(
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

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const order = await ecommerceService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this order
    const userId = parseInt(session.user.id);
    if (order.user_id && order.user_id !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get order items
    const orderItems = await ecommerceService.getOrderItems(orderId);

    // Return order with items
    return NextResponse.json({
      ...order!,
      items: orderItems
    });

  } catch (error) {
    console.error('Error in GET /api/orders/[id]:', error);
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
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
    const { status, notes, tracking_number, estimated_delivery_date } = body;

    // Get current order
    const currentOrder = await ecommerceService.getOrderById(orderId);
    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this order
    const userId = parseInt(session.user.id);
    if (currentOrder.user_id && currentOrder.user_id !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    let updatedOrder = currentOrder;

    // Update order status if provided
    if (status && status !== currentOrder.status) {
      try {
        const statusUpdateResult = await ecommerceService.updateOrderStatus(
          orderId, 
          status as OrderStatus, 
          notes, 
          userId
        );
        if (statusUpdateResult) {
          updatedOrder = statusUpdateResult;
        }
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Invalid status transition' },
          { status: 400 }
        );
      }
    }

    // Update other fields if provided
    if (tracking_number || estimated_delivery_date) {
      const updateData: any = {};
      if (tracking_number) updateData.tracking_number = tracking_number;
      if (estimated_delivery_date) updateData.estimated_delivery_date = estimated_delivery_date;

      // Update order with new data
      const result = await query(
        `UPDATE orders 
         SET ${Object.keys(updateData).map((key, index) => `${key} = $${index + 2}`).join(', ')}, 
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1
         RETURNING *`,
        [orderId, ...Object.values(updateData)]
      );

      if (result.rows[0]) {
        updatedOrder = result.rows[0];
      }
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error in PUT /api/orders/[id]:', error);
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
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    // Get current order to check ownership
    const currentOrder = await ecommerceService.getOrderById(orderId);
    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this order
    const userId = parseInt(session.user.id);
    if (currentOrder.user_id && currentOrder.user_id !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Only allow deletion of pending or cancelled orders
    if (currentOrder.status !== 'pending' && currentOrder.status !== 'cancelled') {
      return NextResponse.json(
        { error: 'Only pending or cancelled orders can be deleted' },
        { status: 400 }
      );
    }

    const deleted = await ecommerceService.deleteOrder(orderId);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Order not found or could not be deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 