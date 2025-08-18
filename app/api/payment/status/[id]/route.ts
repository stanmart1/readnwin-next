import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { paymentService } from '@/utils/payment-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const paymentIntentId = params.id;

    // Validate payment intent ID
    if (!paymentIntentId || typeof paymentIntentId !== 'string') {
      return NextResponse.json(
        { error: 'Valid payment intent ID is required' },
        { status: 400 }
      );
    }

    // Get payment intent status from Stripe
    const paymentIntent = await paymentService.getPaymentIntentStatus(paymentIntentId);

    // Check if the payment intent belongs to the authenticated user
    const userEmail = session.user.email;
    if (paymentIntent.receipt_email && paymentIntent.receipt_email !== userEmail) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Return payment status information
    return NextResponse.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // Convert from cents
      currency: paymentIntent.currency,
      created: paymentIntent.created,
      lastPaymentError: paymentIntent.last_payment_error,
      metadata: paymentIntent.metadata,
    });

  } catch (error) {
    console.error('Error retrieving payment status:', error);
    
    // Handle specific Stripe errors
    if (error instanceof Error) {
      if (error.message.includes('No such payment_intent')) {
        return NextResponse.json(
          { error: 'Payment intent not found' },
          { status: 404 }
        );
      }
      
      if (error.message.includes('Invalid API key')) {
        return NextResponse.json(
          { error: 'Payment service configuration error' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to retrieve payment status' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function POST() {
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