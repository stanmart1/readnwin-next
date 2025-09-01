import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/utils/payment-service';
import { ecommerceService } from '@/utils/ecommerce-service';
import { OrderStatus } from '@/utils/order-types';

// Helper function to handle payment_intent.succeeded event
async function handlePaymentSucceeded(paymentIntent: {
  id: string;
  amount: number;
  metadata: { order_id?: string; user_id?: string; order_number?: string };
}) {
  try {
    console.log('Processing payment succeeded for:', paymentIntent.id);
    
    // Extract order information from metadata
    const { order_id, user_id } = paymentIntent.metadata;
    
    if (order_id) {
      // Update order status to 'paid'
      await ecommerceService.updateOrderStatus(parseInt(order_id), OrderStatus.PAID);
      
      // Add payment transaction ID to order
      await ecommerceService.updateOrderPaymentInfo(
        parseInt(order_id),
        paymentIntent.id,
        'stripe',
        paymentIntent.amount / 100 // Convert from cents
      );
      
      console.log('Order status updated to paid:', order_id);

      // Send payment confirmation email
      try {
        const { sendPaymentConfirmationEmail } = await import('@/utils/email');
        const { query } = await import('@/utils/database');
        
        const userResult = await query('SELECT first_name, last_name, email FROM users WHERE id = $1', [user_id]);
        const user = userResult.rows[0];
        
        if (user?.email) {
          const orderDetails = {
            orderNumber: paymentIntent.metadata.order_number || order_id,
            paymentAmount: (paymentIntent.amount / 100).toFixed(2),
            paymentMethod: 'Credit Card'
          };

          const userName = user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : (user.first_name || user.last_name || 'Customer');
          await sendPaymentConfirmationEmail(user.email, orderDetails, userName);
          console.log('✅ Payment confirmation email sent');
        }
      } catch (emailError) {
        console.error('❌ Error sending payment confirmation email:', emailError);
        // Don't fail the payment processing if email fails
      }
    }
    
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
    throw error;
  }
}

// Helper function to handle payment_intent.payment_failed event
async function handlePaymentFailed(paymentIntent: {
  id: string;
  metadata: { order_id?: string };
}) {
  try {
    console.log('Processing payment failed for:', paymentIntent.id);
    
    const { order_id } = paymentIntent.metadata;
    
    if (order_id) {
      // Update order status to 'payment_failed'
      await ecommerceService.updateOrderStatus(parseInt(order_id), OrderStatus.PAYMENT_FAILED);
      
      console.log('Order status updated to payment_failed:', order_id);
    }
    
    // TODO: Send payment failed notification email
    // await sendPaymentFailedEmail(order_id);
    
  } catch (error) {
    console.error('Error handling payment failed:', error);
    throw error;
  }
}

// Helper function to handle payment_intent.canceled event
async function handlePaymentCanceled(paymentIntent: {
  id: string;
  metadata: { order_id?: string };
}) {
  try {
    console.log('Processing payment canceled for:', paymentIntent.id);
    
    const { order_id } = paymentIntent.metadata;
    
    if (order_id) {
      // Update order status to 'canceled'
      await ecommerceService.updateOrderStatus(parseInt(order_id), OrderStatus.CANCELED);
      
      console.log('Order status updated to canceled:', order_id);
    }
    
  } catch (error) {
    console.error('Error handling payment canceled:', error);
    throw error;
  }
}

// Helper function to handle charge.refunded event
async function handleChargeRefunded(charge: {
  id: string;
  metadata: { order_id?: string };
}) {
  try {
    console.log('Processing charge refunded for:', charge.id);
    
    const { order_id } = charge.metadata;
    
    if (order_id) {
      // Update order status to 'refunded'
      await ecommerceService.updateOrderStatus(parseInt(order_id), OrderStatus.REFUNDED);
      
      console.log('Order status updated to refunded:', order_id);
    }
    
    // TODO: Send refund confirmation email
    // await sendRefundConfirmationEmail(order_id);
    
  } catch (error) {
    console.error('Error handling charge refunded:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for webhook signature validation
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found in webhook request');
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    let event;
    
    try {
      // Validate webhook signature
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret';
      event = paymentService.validateWebhookSignature(body, signature, webhookSecret);
    } catch (error) {
      console.error('Webhook signature validation failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('Processing webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
        
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object);
        break;
        
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;
        
      case 'payment_intent.created':
      case 'payment_intent.processing':
      case 'payment_intent.requires_action':
        // Log these events but no action needed
        console.log('Payment intent event logged:', event.type, event.data.object.id);
        break;
        
      default:
        console.log('Unhandled webhook event type:', event.type);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // Return 200 to acknowledge receipt even if processing failed
    // This prevents Stripe from retrying the webhook
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 200 }
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