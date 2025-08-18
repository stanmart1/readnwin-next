import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { paymentService } from '@/utils/payment-service';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Payment create-intent endpoint called');
    
    // Get user session
    const session = await getServerSession(authOptions);
    console.log('🔍 Session check:', session ? 'Authenticated' : 'Not authenticated');
    console.log('🔍 Session details:', session ? {
      userId: session.user?.id,
      email: session.user?.email,
      role: session.user?.role
    } : 'No session');
    
    if (!session?.user?.id) {
      console.log('❌ Authentication required but not provided');
      console.log('❌ Session details:', session);
      return NextResponse.json(
        { 
          error: 'Authentication required',
          details: 'Please log in to continue with payment',
          session: session ? 'Session exists but no user ID' : 'No session found'
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    console.log('🔍 Request body:', JSON.stringify(body, null, 2));
    
    const { amount, currency = 'ngn', metadata = {}, description, paymentMethod } = body;

    // Validate required fields
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      console.log('❌ Invalid amount:', amount);
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    // Validate currency - Updated to include NGN and other common currencies
    const validCurrencies = ['usd', 'eur', 'gbp', 'cad', 'aud', 'ngn', 'ghs', 'kes', 'zar'];
    if (!validCurrencies.includes(currency.toLowerCase())) {
      console.log('❌ Invalid currency:', currency);
      return NextResponse.json(
        { error: `Invalid currency. Supported currencies: ${validCurrencies.join(', ')}` },
        { status: 400 }
      );
    }

    // Currency-aware amount validation
    const currencyLimits: { [key: string]: number } = {
      'usd': 999999,      // USD: $999,999
      'eur': 999999,      // EUR: €999,999
      'gbp': 999999,      // GBP: £999,999
      'cad': 999999,      // CAD: C$999,999
      'aud': 999999,      // AUD: A$999,999
      'ngn': 100000000,   // NGN: ₦100,000,000 (100 million Naira)
      'ghs': 10000000,    // GHS: GH₵10,000,000 (10 million Ghana Cedis)
      'kes': 50000000,    // KES: KSh50,000,000 (50 million Kenyan Shillings)
      'zar': 20000000     // ZAR: R20,000,000 (20 million South African Rand)
    };

    const maxAmount = currencyLimits[currency.toLowerCase()] || 999999;
    if (amount > maxAmount) {
      console.log(`❌ Amount ${amount} ${currency.toUpperCase()} exceeds maximum limit ${maxAmount} ${currency.toUpperCase()}`);
      return NextResponse.json(
        { error: `Amount exceeds maximum limit for ${currency.toUpperCase()}. Maximum allowed: ${maxAmount.toLocaleString()} ${currency.toUpperCase()}` },
        { status: 400 }
      );
    }

    // Add user information to metadata
    const enhancedMetadata = {
      ...metadata,
      user_id: session.user.id,
      user_email: session.user.email || '',
      created_at: new Date().toISOString(),
    };

    console.log('🔍 Processing payment method:', paymentMethod);

    // Handle different payment methods
    if (paymentMethod === 'flutterwave') {
      console.log('🔍 Processing Flutterwave payment');
      
      try {
        // Check if Flutterwave gateway is configured and enabled
        const { query } = await import('@/utils/database');
        const gatewayResult = await query(
          'SELECT * FROM payment_gateways WHERE gateway_id = $1 AND enabled = true',
          ['flutterwave']
        );

        if (gatewayResult.rows.length === 0) {
          console.log('❌ Flutterwave gateway not configured or disabled');
          return NextResponse.json(
            { error: 'Flutterwave payment is not available. Please contact support.' },
            { status: 503 }
          );
        }

        const gateway = gatewayResult.rows[0];
        console.log('🔍 Flutterwave gateway config:', {
          enabled: gateway.enabled,
          testMode: gateway.test_mode,
          hasSecretKey: !!gateway.secret_key,
          hasPublicKey: !!gateway.public_key
        });

        // For Flutterwave, we need to redirect to the Flutterwave initialization endpoint
        const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/payment/flutterwave/initialize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': request.headers.get('cookie') || '',
          },
          body: JSON.stringify({
            amount,
            currency: currency.toUpperCase(), // Flutterwave expects uppercase currency codes
            email: session.user.email || 'test@example.com',
            phone_number: metadata.phone_number || '+2348012345678',
            tx_ref: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            redirect_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/verify`,
            metadata: enhancedMetadata
          }),
        });

        if (response.ok) {
          const flutterwaveData = await response.json();
          console.log('✅ Flutterwave initialization successful:', JSON.stringify(flutterwaveData, null, 2));
          
          return NextResponse.json({
            success: true,
            paymentMethod: 'flutterwave',
            authorization_url: flutterwaveData.authorization_url, // Keep for backward compatibility
            inlinePaymentData: flutterwaveData.inlinePaymentData, // Add inline payment data
            reference: flutterwaveData.reference,
            amount,
            currency: currency.toUpperCase(),
          });
        } else {
          const errorData = await response.json();
          console.log('❌ Flutterwave initialization failed:', errorData);
          return NextResponse.json(
            { error: errorData.error || 'Failed to initialize Flutterwave payment' },
            { status: 500 }
          );
        }
      } catch (flutterwaveError) {
        console.error('❌ Flutterwave error:', flutterwaveError);
        return NextResponse.json(
          { error: 'Failed to initialize Flutterwave payment' },
          { status: 500 }
        );
      }
    }

    // For Stripe and other payment methods
    console.log('🔍 Processing Stripe payment');
    try {
      // Create payment intent
      const paymentIntent = await paymentService.createPaymentIntent({
        amount,
        currency: currency.toLowerCase(),
        metadata: enhancedMetadata,
        customer_email: session.user.email || undefined,
        description: description || `Payment for order - ${session.user.email}`,
      });

      console.log('✅ Payment intent created successfully');

      // Return client secret and payment intent data
      return NextResponse.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100, // Convert back to dollars
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      });
    } catch (paymentError) {
      console.error('❌ Payment service error:', paymentError);
      return NextResponse.json(
        { error: 'Payment service is not available' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('❌ Error in payment create-intent:', error);
    
    // Handle specific Stripe errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid API key')) {
        return NextResponse.json(
          { error: 'Payment service configuration error' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('amount_too_small')) {
        return NextResponse.json(
          { error: 'Amount is too small for this currency' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('invalid_currency')) {
        return NextResponse.json(
          { error: 'Invalid currency code' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
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