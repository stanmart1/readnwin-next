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

    // Check if user has access to this order
    const userId = parseInt(session.user.id);
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    
    const order = await query(
      'SELECT * FROM orders WHERE id = $1',
      [orderId]
    );

    if (order.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const orderData = order.rows[0];
    
    if (orderData.user_id && orderData.user_id !== userId && !isAdmin) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get bank transfer for this order
    const bankTransferResult = await query(`
      SELECT * FROM bank_transfers 
      WHERE order_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `, [orderId]);

    if (bankTransferResult.rows.length === 0) {
      return NextResponse.json({
        bankTransfer: null,
        proofs: []
      });
    }

    const bankTransfer = bankTransferResult.rows[0];

    // Get payment proofs for this bank transfer
    const proofsResult = await query(`
      SELECT * FROM payment_proofs 
      WHERE bank_transfer_id = $1 
      ORDER BY upload_date DESC
    `, [bankTransfer.id]);

    return NextResponse.json({
      bankTransfer,
      proofs: proofsResult.rows
    });

  } catch (error) {
    console.error('Error in GET /api/payment/bank-transfer/orders/[orderId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 