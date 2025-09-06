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
        console.log('🔍 Starting Flutterwave payment verification for tx_ref:', tx_ref);
        paymentData = await flutterwaveService.verifyPayment(tx_ref);
        console.log('🔍 Flutterwave verification response:', JSON.stringify(paymentData, null, 2));
      } catch (error) {
        console.error('❌ Flutterwave verification error:', error);
        return NextResponse.json(
          { 
            success: false,
            error: 'Payment verification failed',
            details: error instanceof Error ? error.message : 'Unknown error'
          },
          { status: 500 }
        );
      }

      // Extract the actual payment status from the response
      const actualPaymentStatus = paymentData.payment_status || paymentData.data?.status || paymentData.status;
      console.log('🔍 Extracted payment status:', actualPaymentStatus);
      
      // Update transaction status in database
      await client.query(
        `UPDATE payment_transactions 
         SET status = $1, gateway_response = $2, updated_at = CURRENT_TIMESTAMP
         WHERE transaction_id = $3`,
        [
          actualPaymentStatus,
          JSON.stringify(paymentData),
          tx_ref
        ]
      );

      // Check for successful payment (handle different success status formats)
      const isSuccessful = actualPaymentStatus === 'successful' || 
                          actualPaymentStatus === 'success' ||
                          actualPaymentStatus === 'completed';
      
      console.log('🔍 Payment success check:', { actualPaymentStatus, isSuccessful });
      
      // If payment is successful, update order status
      if (isSuccessful) {
        console.log('🔍 Processing successful payment for tx_ref:', tx_ref);
        
        // Find the order associated with this transaction - try multiple approaches
        let orderResult = await client.query(
          'SELECT id, order_number FROM orders WHERE payment_transaction_id = $1',
          [tx_ref]
        );
        
        // If not found by payment_transaction_id, try by order_number (tx_ref might be order_number)
        if (orderResult.rows.length === 0) {
          orderResult = await client.query(
            'SELECT id, order_number FROM orders WHERE order_number = $1',
            [tx_ref]
          );
        }
        
        // If still not found, try to find by transaction record
        if (orderResult.rows.length === 0) {
          const transactionResult = await client.query(
            'SELECT order_id FROM payment_transactions WHERE transaction_id = $1',
            [tx_ref]
          );
          
          if (transactionResult.rows.length > 0) {
            const orderIdFromTransaction = transactionResult.rows[0].order_id;
            orderResult = await client.query(
              'SELECT id, order_number FROM orders WHERE order_number = $1 OR id = $1',
              [orderIdFromTransaction]
            );
          }
        }

        console.log('🔍 Order lookup result:', {
          found: orderResult.rows.length > 0,
          orderId: orderResult.rows[0]?.id,
          orderNumber: orderResult.rows[0]?.order_number
        });

        if (orderResult.rows.length > 0) {
          const order = orderResult.rows[0];
          const orderId = order.id;
          
          console.log('🔍 Updating order status for order ID:', orderId);
          
          // Update order status to confirmed
          await client.query(
            `UPDATE orders 
             SET status = 'confirmed', payment_status = 'paid', updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [orderId]
          );
          
          console.log('✅ Order status updated to confirmed and paid');

          // Add books to user library (both ebook and physical)
          const orderItemsResult = await client.query(
            'SELECT book_id FROM order_items WHERE order_id = $1',
            [orderId]
          );
          
          console.log('🔍 Found order items:', orderItemsResult.rows.length);

          for (const item of orderItemsResult.rows) {
            try {
              await client.query(
                `INSERT INTO user_library (user_id, book_id, order_id, purchase_date, access_type)
                 VALUES ($1, $2, $3, CURRENT_TIMESTAMP, 'purchased')
                 ON CONFLICT (user_id, book_id) DO NOTHING`,
                [session.user.id, item.book_id, orderId]
              );
              console.log('✅ Added book to user library:', item.book_id);
            } catch (libraryError) {
              console.error('❌ Error adding book to library:', item.book_id, libraryError);
              // Continue with other books even if one fails
            }
          }

          // Clear user's cart after successful payment
          try {
            const cartClearResult = await client.query('DELETE FROM cart_items WHERE user_id = $1', [session.user.id]);
            console.log('✅ Cart cleared after successful payment verification. Rows affected:', cartClearResult.rowCount);
          } catch (cartError) {
            console.error('❌ Error clearing cart after payment:', cartError);
            // Don't fail for cart clearing issues
          }

          // Add order status history
          try {
            await client.query(
              `INSERT INTO order_status_history (order_id, status, notes, created_by)
               VALUES ($1, 'confirmed', 'Payment verified successfully via Flutterwave', $2)`,
              [orderId, session.user.id]
            );
            console.log('✅ Order status history updated');
          } catch (historyError) {
            console.error('❌ Error updating order status history:', historyError);
            // Don't fail for history issues
          }
        } else {
          console.error('❌ No order found for transaction reference:', tx_ref);
        }
      }

      return NextResponse.json({
        success: true,
        payment_status: actualPaymentStatus,
        transaction_data: paymentData,
        is_successful: isSuccessful,
        message: isSuccessful
          ? 'Payment verified successfully. Your books have been added to your library.' 
          : `Payment status: ${actualPaymentStatus}`,
        redirect_url: isSuccessful ? '/dashboard?tab=library&payment_success=true' : null,
        debug_info: {
          original_status: paymentData.status,
          data_status: paymentData.data?.status,
          extracted_status: actualPaymentStatus,
          tx_ref: tx_ref
        }
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