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

    // Check if user has access to this order (allow admin access)
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

    // Get payment proofs for this order
    // For bank transfer orders, we need to check if there's a bank_transfer record
    // and then get the associated payment proofs
    
    const bankTransferResult = await query(`
      SELECT id FROM bank_transfers WHERE order_id = $1
    `, [orderId]);

    if (bankTransferResult.rows.length === 0) {
      // No bank transfer record found for this order
      console.log(`No bank transfer record found for order ${orderId}`);
      return NextResponse.json([]);
    }

    const bankTransferId = bankTransferResult.rows[0].id;

    // Get payment proofs for this bank transfer
    const result = await query(`
      SELECT pp.*, bt.order_id
      FROM payment_proofs pp
      JOIN bank_transfers bt ON pp.bank_transfer_id = bt.id
      WHERE bt.id = $1
      ORDER BY pp.upload_date DESC
    `, [bankTransferId]);

    console.log(`Found ${result.rows.length} payment proofs for order ${orderId}`);
    return NextResponse.json(result.rows);

  } catch (error) {
    console.error('Error in GET /api/payment/bank-transfer/proofs/[orderId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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