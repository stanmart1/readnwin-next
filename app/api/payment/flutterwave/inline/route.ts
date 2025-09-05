import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FlutterwaveService } from '@/utils/flutterwave-service';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Flutterwave inline API called');
    
    // Get user session
    const session = await getServerSession(authOptions);
    console.log('🔍 Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasUserId: !!session?.user?.id,
      userId: session?.user?.id
    });
    
    if (!session?.user?.id) {
      console.log('❌ Authentication failed - no session or user ID');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('🔍 Request body parsed successfully');
    } catch (parseError) {
      console.log('❌ Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { amount, currency = 'NGN', email, phone_number, tx_ref, customizations, meta } = body;

    console.log('🔍 Flutterwave inline - Request body:', JSON.stringify(body, null, 2));
    console.log('🔍 Flutterwave inline - Session user:', JSON.stringify(session?.user, null, 2));
    console.log('🔍 Flutterwave inline - Amount:', amount, 'Type:', typeof amount);
    console.log('🔍 Flutterwave inline - Email:', email);
    console.log('🔍 Flutterwave inline - TX_REF:', tx_ref);
    console.log('🔍 Flutterwave inline - Currency:', currency);
    console.log('🔍 Flutterwave inline - Phone:', phone_number);

    // Validate required fields
    console.log('🔍 Starting validation...');
    
    if (!amount) {
      console.log('❌ Amount is missing');
      return NextResponse.json(
        { error: 'Amount is required' },
        { status: 400 }
      );
    }
    
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    console.log('🔍 Amount validation:', { original: amount, numeric: numericAmount, isNaN: isNaN(numericAmount) });
    
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.log('❌ Flutterwave inline - Invalid amount:', amount, 'Numeric amount:', numericAmount);
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    if (!email) {
      console.log('❌ Email is missing');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    if (!tx_ref) {
      console.log('❌ Transaction reference is missing');
      return NextResponse.json(
        { error: 'Transaction reference is required' },
        { status: 400 }
      );
    }
    
    console.log('✅ All required fields validated successfully');

    // Get Flutterwave configuration from database
    console.log('🔍 Fetching Flutterwave configuration from database...');
    const { query } = await import('@/utils/database');

    const gatewayResult = await query(
      'SELECT * FROM payment_gateways WHERE gateway_id = $1 AND enabled = true',
      ['flutterwave']
    );

    console.log('🔍 Gateway query result:', {
      rowCount: gatewayResult.rows.length,
      hasRows: gatewayResult.rows.length > 0
    });

    if (gatewayResult.rows.length === 0) {
      console.log('❌ Flutterwave gateway not found or not enabled');
      return NextResponse.json(
        { error: 'Flutterwave is not configured or enabled' },
        { status: 400 }
      );
    }

    const gateway = gatewayResult.rows[0];
    console.log('🔍 Gateway configuration:', {
      gateway_id: gateway.gateway_id,
      has_secret_key: !!gateway.secret_key,
      has_public_key: !!gateway.public_key,
      has_hash: !!gateway.hash,
      test_mode: gateway.test_mode,
      status: gateway.status,
      enabled: gateway.enabled
    });
      
    // Create Flutterwave service instance using admin-configured parameters
    const flutterwaveService = new FlutterwaveService(
      gateway.secret_key,
      gateway.public_key,
      gateway.hash,
      gateway.test_mode
    );
    
    console.log('🔍 Flutterwave service created successfully');

      // Prepare payment data for inline payment
      const paymentData = {
        amount: Number(numericAmount), // Ensure amount is a number
        currency: currency.toUpperCase(), // Ensure currency is uppercase
        email,
        phone_number: phone_number || '',
        tx_ref,
        redirect_url: `${process.env.NEXTAUTH_URL || 'https://readnwin.com'}/payment/verify`,
        customer: {
          email,
          phone_number: phone_number || '',
          name: `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim() || email,
        },
        customizations: customizations || {
          title: 'ReadnWin Payment',
          description: 'Payment for your order',
          logo: `${process.env.NEXTAUTH_URL || 'https://readnwin.com'}/logo.png`,
        },
        payment_options: 'card,banktransfer,ussd',
        meta: {
          ...meta,
          user_id: session.user.id,
          user_email: session.user.email,
          created_at: new Date().toISOString(),
        },
      };

      // Prepare inline payment data
      const inlinePaymentData = flutterwaveService.prepareInlinePaymentData(paymentData);

      console.log('✅ Flutterwave inline payment data prepared:', JSON.stringify(inlinePaymentData, null, 2));

      return NextResponse.json({
        success: true,
        paymentData: inlinePaymentData,
        message: 'Inline payment data prepared successfully'
      });

  } catch (error) {
    console.error('❌ Flutterwave inline payment error:', error);
    return NextResponse.json(
      { error: 'Failed to prepare inline payment' },
      { status: 500 }
    );
  }
} 