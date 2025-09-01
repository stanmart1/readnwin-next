import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FlutterwaveService } from '@/utils/flutterwave-service';

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { tx_ref, transaction_id, status } = body;

    if (!tx_ref) {
      return NextResponse.json(
        { error: 'Transaction reference is required' },
        { status: 400 }
      );
    }

    // Get Flutterwave configuration from database
    const { Pool } = require('pg');
    const pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || '5432'),
      ssl: false, // SSL is disabled for the new database
    });

    const client = await pool.connect();
    try {
      // Get payment gateway configuration
      const gatewayResult = await client.query(
        'SELECT * FROM payment_gateways WHERE gateway_id = $1 AND enabled = true',
        ['flutterwave']
      );

      if (gatewayResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Flutterwave is not configured' },
          { status: 500 }
        );
      }

      const gateway = gatewayResult.rows[0];
      
      // Create Flutterwave service instance using admin-configured parameters
      const flutterwaveService = new FlutterwaveService(
        gateway.secret_key,
        gateway.public_key,
        gateway.hash,
        gateway.test_mode
      );

      // Verify payment with Flutterwave
      let paymentData;
      try {
        paymentData = await flutterwaveService.verifyPayment(tx_ref);
      } catch (error) {
        console.error('Flutterwave verification error:', error);
        return NextResponse.json(
          { error: 'Payment verification failed' },
          { status: 500 }
        );
      }

      // Update transaction status in database
      await client.query(
        `UPDATE payment_transactions 
         SET status = $1, gateway_response = $2, updated_at = CURRENT_TIMESTAMP
         WHERE transaction_id = $3`,
        [
          paymentData.status,
          JSON.stringify(paymentData),
          tx_ref
        ]
      );

      // If payment is successful, update order status
      if (paymentData.status === 'successful') {
        // Find the order associated with this transaction
        const orderResult = await client.query(
          'SELECT id FROM orders WHERE payment_transaction_id = $1',
          [tx_ref]
        );

        if (orderResult.rows.length > 0) {
          const orderId = orderResult.rows[0].id;
          
          // Update order status to confirmed
          await client.query(
            `UPDATE orders 
             SET status = 'confirmed', payment_status = 'paid', updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [orderId]
          );

          // Add books to user library (both ebook and physical)
          const orderItemsResult = await client.query(
            'SELECT book_id, format FROM order_items WHERE order_id = $1',
            [orderId]
          );

          for (const item of orderItemsResult.rows) {
            await client.query(
              `INSERT INTO user_library (user_id, book_id, order_id, purchase_date, access_type)
               VALUES ($1, $2, $3, CURRENT_TIMESTAMP, 'purchased')
               ON CONFLICT (user_id, book_id) DO NOTHING`,
              [session.user.id, item.book_id, orderId]
            );
          }

          // Add order status history
          await client.query(
            `INSERT INTO order_status_history (order_id, status, notes, created_by)
             VALUES ($1, 'confirmed', 'Payment verified successfully', $2)`,
            [orderId, session.user.id]
          );
        }
      }

      return NextResponse.json({
        success: true,
        payment_status: paymentData.status,
        transaction_data: paymentData,
        message: paymentData.status === 'successful' 
          ? 'Payment verified successfully' 
          : `Payment status: ${paymentData.status}`
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
} 