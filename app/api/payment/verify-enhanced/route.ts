import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FlutterwaveService } from '@/utils/flutterwave-service';
import { ecommerceService } from '@/utils/ecommerce-service-new';
import { secureQuery } from '@/utils/secure-database';
import { validateInput, sanitizeInput, validateId } from '@/utils/security-middleware';
import { sendEmail, getOrderConfirmationEmailTemplate } from '@/utils/email';
import { sanitizeApiResponse, safeLog } from '@/utils/security';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    const status = sanitizeInput(searchParams.get('status') || '');
    const tx_ref = sanitizeInput(searchParams.get('tx_ref') || '');
    const transaction_id = sanitizeInput(searchParams.get('transaction_id') || '');
    
    // Validate required parameters
    const validation = validateInput({ status, tx_ref, transaction_id }, {
      status: { required: true, type: 'string', pattern: /^(successful|cancelled|failed)$/ },
      tx_ref: { required: true, type: 'string', maxLength: 100 },
      transaction_id: { required: true, type: 'string', maxLength: 100 }
    });
    
    if (!validation.isValid) {
      safeLog.error('❌ Invalid parameters:', validation.errors);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payment/failed?error=invalid_params`);
    }

    safeLog.info('🔍 Payment verification request:', { status, tx_ref, transaction_id });

    if (!tx_ref || !transaction_id) {
      safeLog.error('❌ Missing required parameters');
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payment/failed?error=missing_params`);
    }

    // Get session to verify user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      safeLog.error('❌ No session found');
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login?redirect=/payment/verify-enhanced`);
    }

    const userId = parseInt(session.user.id);

    if (status === 'cancelled') {
      safeLog.info('❌ Payment was cancelled by user');
      
      // Find the order by transaction reference
      const orderResult = await secureQuery(`
        SELECT id, order_number FROM orders 
        WHERE order_number = $1 AND user_id = $2
      `, [tx_ref, userId]);

      if (orderResult.rows.length > 0) {
        const order = orderResult.rows[0];
        
        // Update order status to cancelled
        await secureQuery(`
          UPDATE orders 
          SET status = 'cancelled', payment_status = 'failed', updated_at = NOW()
          WHERE id = $1
        `, [order.id]);

        safeLog.info(`✅ Order ${order.order_number} marked as cancelled`);
      }

      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payment/cancelled?order=${tx_ref}`);
    }

    if (status === 'successful') {
      safeLog.info('✅ Payment reported as successful, verifying...');

      try {
        // Get Flutterwave gateway configuration
        const gatewayResult = await secureQuery(`
          SELECT * FROM payment_gateways 
          WHERE gateway_id = 'flutterwave' AND enabled = true
        `);

        if (gatewayResult.rows.length === 0) {
          throw new Error('Flutterwave gateway not configured');
        }

        const gateway = gatewayResult.rows[0];
              const flutterwaveService = new FlutterwaveService();

        // Verify the payment with Flutterwave
        const verification = await flutterwaveService.verifyPayment(transaction_id);
        safeLog.info('🔍 Payment verification result:', verification.status);

        if (verification.status === 'successful') {
          // Find the order
          const orderResult = await secureQuery(`
            SELECT o.*, 
                   COUNT(CASE WHEN b.format IN ('ebook', 'hybrid') THEN 1 END) as ebook_count,
                   COUNT(CASE WHEN b.format IN ('physical', 'hybrid') THEN 1 END) as physical_count
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN books b ON oi.book_id = b.id
            WHERE o.order_number = $1 AND o.user_id = $2
            GROUP BY o.id
          `, [tx_ref, userId]);

          if (orderResult.rows.length === 0) {
            throw new Error('Order not found');
          }

          const order = orderResult.rows[0];
          safeLog.info(`🔍 Found order ${order.order_number} for verification`);

          // Check if order is already processed
          if (order.payment_status === 'paid') {
            safeLog.info('ℹ️ Order already processed, redirecting to confirmation');
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/order-confirmation-enhanced/${order.id}?status=success`);
          }

          // Update order status to paid
          await secureQuery(`
            UPDATE orders 
            SET status = 'confirmed', payment_status = 'paid', updated_at = NOW()
            WHERE id = $1
          `, [order.id]);

          // Update payment transaction record
          await secureQuery(`
            UPDATE payment_transactions 
            SET status = 'successful', updated_at = NOW()
            WHERE transaction_id = $1
          `, [transaction_id]);

          safeLog.info(`✅ Order ${order.order_number} payment confirmed`);

          // Sync books to user library using the sync service
          try {
            const { LibrarySyncService } = await import('@/utils/library-sync-service');
            await LibrarySyncService.syncOrderToLibrary(order.id, userId);
          } catch (libraryError) {
            safeLog.error('❌ Error syncing books to library:', libraryError);
            // Don't fail the entire process for library issues
          }

          // Clear user's cart after successful payment verification
          try {
            await ecommerceService.clearCartAfterPaymentSuccess(userId, order.id);
            safeLog.info('✅ Cart cleared after confirmed payment success');
          } catch (cartError) {
            safeLog.error('❌ Error clearing cart after payment success:', cartError);
            // Don't fail for cart clearing issues
          }

          // Send confirmation email
          try {
            const orderItemsResult = await secureQuery(`
              SELECT oi.*, b.title, COALESCE(a.name, 'Unknown Author') as author_name, b.format
              FROM order_items oi
              JOIN books b ON oi.book_id = b.id
              LEFT JOIN authors a ON b.author_id = a.id
              WHERE oi.order_id = $1
            `, [order.id]);

            const emailTemplate = getOrderConfirmationEmailTemplate(sanitizeApiResponse({
              orderNumber: order.order_number,
              orderTotal: `₦${order.total_amount.toLocaleString()}`,
              items: orderItemsResult.rows.map(item => ({
                title: item.title,
                author: item.author_name,
                quantity: item.quantity,
                price: `₦${item.price.toLocaleString()}`,
                total: `₦${item.total_price.toLocaleString()}`,
                format: item.format
              })),
              paymentMethod: 'Flutterwave',
              isDigital: parseInt(order.ebook_count) > 0 && parseInt(order.physical_count) === 0,
              isMixed: parseInt(order.ebook_count) > 0 && parseInt(order.physical_count) > 0
            }), `${order.shipping_address?.first_name || ''} ${order.shipping_address?.last_name || ''}`.trim() || 'Customer');

            await sendEmail(
              order.shipping_address?.email || session.user.email,
              emailTemplate.subject,
              emailTemplate.html
            );

            safeLog.info('✅ Confirmation email sent');
          } catch (emailError) {
            safeLog.error('❌ Error sending confirmation email:', emailError);
            // Don't fail for email issues
          }

          // Redirect to order confirmation
          return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/order-confirmation-enhanced/${order.id}?status=success&gateway=flutterwave`);

        } else {
          // Payment verification failed
          safeLog.error('❌ Payment verification failed');
          
          // Update order status to failed
          const orderResult = await secureQuery(`
            SELECT id FROM orders WHERE order_number = $1 AND user_id = $2
          `, [tx_ref, userId]);

          if (orderResult.rows.length > 0) {
            await secureQuery(`
              UPDATE orders 
              SET status = 'failed', payment_status = 'failed', updated_at = NOW()
              WHERE id = $1
            `, [orderResult.rows[0].id]);
          }

          return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payment/failed?order=${tx_ref}&reason=verification_failed`);
        }

      } catch (verificationError) {
        safeLog.error('❌ Payment verification error:', verificationError);
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payment/failed?order=${tx_ref}&reason=verification_error`);
      }
    }

    // Unknown status
    safeLog.error('❌ Unknown payment status:', status);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payment/failed?order=${tx_ref}&reason=unknown_status`);

  } catch (error) {
    safeLog.error('❌ Payment verification error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/payment/failed?reason=server_error`);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Handle webhook from Flutterwave
    const body = await request.json();
    safeLog.info('🔍 Payment webhook received:', body);

    // Verify webhook signature if needed
    // Implementation depends on Flutterwave webhook setup

    const { status, tx_ref, transaction_id } = body;

    if (status === 'successful') {
      // Process the successful payment
      // This is a backup in case the redirect verification fails
      safeLog.info('✅ Webhook confirmed successful payment for:', tx_ref);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    safeLog.error('❌ Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
} 