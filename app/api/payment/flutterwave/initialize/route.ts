import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FlutterwaveService } from '@/utils/flutterwave-service';

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    console.log('🔍 Flutterwave initialize - Session check:', session ? 'Authenticated' : 'Not authenticated');
    console.log('🔍 Flutterwave initialize - Session details:', session ? {
      userId: session.user?.id,
      email: session.user?.email,
      role: session.user?.role
    } : 'No session');
    
    if (!session?.user?.id) {
      console.log('❌ Flutterwave initialize - Authentication required but not provided');
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
    const { amount, currency = 'NGN', email, phone_number, tx_ref, redirect_url, customizations, meta } = body;

    console.log('🔍 Flutterwave initialize - Request body:', JSON.stringify(body, null, 2));
    console.log('🔍 Flutterwave initialize - Amount received:', amount, 'Type:', typeof amount);
    console.log('🔍 Flutterwave initialize - Currency received:', currency);

    // Validate required fields
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      console.log('❌ Flutterwave initialize - Invalid amount:', amount);
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    if (!email || !tx_ref) {
      return NextResponse.json(
        { error: 'Email and transaction reference are required' },
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
      const gatewayResult = await client.query(
        'SELECT * FROM payment_gateways WHERE gateway_id = $1 AND enabled = true',
        ['flutterwave']
      );

      if (gatewayResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Flutterwave is not configured or enabled' },
          { status: 400 }
        );
      }

      const gateway = gatewayResult.rows[0];
      
      // Parse gateway config to get v3 API fields
      let gatewayConfig = {};
      if (gateway.config) {
        try {
          gatewayConfig = typeof gateway.config === 'string' 
            ? JSON.parse(gateway.config) 
            : gateway.config;
        } catch (error) {
          console.error('Error parsing gateway config:', error);
        }
      }

      // Create Flutterwave service instance using v3 API fields
      const clientSecret = (gatewayConfig as any).clientSecret || gateway.secret_key;
      const clientId = (gatewayConfig as any).clientId || gateway.public_key;
      const encryptionKey = (gatewayConfig as any).encryptionKey || gateway.hash;
      
      const flutterwaveService = new FlutterwaveService(
        clientSecret,
        clientId,
        encryptionKey,
        gateway.test_mode
      );

      // Prepare payment data
      const paymentData = {
        amount,
        currency,
        email,
        phone_number,
        tx_ref,
        redirect_url: redirect_url || `${process.env.NEXTAUTH_URL}/payment/verify`,
        customer: {
          email,
          phone_number,
          name: session.user.firstName && session.user.lastName ? `${session.user.firstName} ${session.user.lastName}` : email,
        },
        customizations: customizations || {
          title: 'ReadnWin Payment',
          description: 'Payment for your order',
          logo: `${process.env.NEXTAUTH_URL}/logo.png`,
        },
        meta: {
          ...meta,
          user_id: session.user.id,
          user_email: session.user.email,
          created_at: new Date().toISOString(),
        },
      };

      // Generate hash for payment verification
      const paymentHash = flutterwaveService.generatePaymentHash(paymentData);
      (paymentData as any).hash = paymentHash;

      // Initialize payment
      const result = await flutterwaveService.initializePayment(paymentData);

      console.log('✅ Flutterwave payment initialized, creating temporary order...');

      // Create a temporary order to get order_id for payment transaction
      let orderNumber: string;
      try {
        const tempOrderResult = await client.query(
          `INSERT INTO orders (
            order_number, user_id, subtotal, total_amount, currency, 
            payment_status, status, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING order_number`,
          [
            tx_ref, // Use tx_ref as order_number temporarily
            session.user.id,
            amount,
            amount,
            currency,
            'pending',
            'pending'
          ]
        );

        if (!tempOrderResult.rows || tempOrderResult.rows.length === 0) {
          throw new Error('Failed to create temporary order - no rows returned');
        }

        orderNumber = tempOrderResult.rows[0].order_number;
        console.log('✅ Temporary order created with order_number:', orderNumber);

        if (!orderNumber || typeof orderNumber !== 'string') {
          throw new Error(`Invalid order number returned: ${orderNumber} (type: ${typeof orderNumber})`);
        }
      } catch (orderError) {
        console.error('❌ Error creating temporary order:', orderError);
        const errorMessage = orderError instanceof Error ? orderError.message : 'Unknown error';
        throw new Error(`Failed to create temporary order: ${errorMessage}`);
      }

      console.log('✅ Creating payment transaction with order_number:', orderNumber);

      // Store transaction in database with correct columns
      try {
        await client.query(
          `INSERT INTO payment_transactions (
            transaction_id, order_id, user_id, gateway_type, amount, currency, status, gateway_response
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            tx_ref,
            orderNumber, // Use order_number (string) instead of id (integer)
            session.user.id,
            'flutterwave',
            amount,
            currency,
            'pending',
            JSON.stringify(result),
          ]
        );
        console.log('✅ Payment transaction created successfully');
      } catch (transactionError) {
        console.error('❌ Error creating payment transaction:', transactionError);
        // Try to clean up the temporary order if transaction fails
        try {
          await client.query('DELETE FROM orders WHERE order_number = $1', [orderNumber]);
          console.log('🧹 Cleaned up temporary order after transaction failure');
        } catch (cleanupError) {
          console.error('❌ Error cleaning up temporary order:', cleanupError);
        }
        const errorMessage = transactionError instanceof Error ? transactionError.message : 'Unknown error';
        throw new Error(`Failed to create payment transaction: ${errorMessage}`);
      }

      return NextResponse.json({
        success: true,
        data: result.data,
        authorization_url: result.data.link,
        reference: tx_ref,
        order_id: orderNumber,
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error initializing Flutterwave payment:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid API key')) {
        return NextResponse.json(
          { error: 'Flutterwave configuration error' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('amount_too_small')) {
        return NextResponse.json(
          { error: 'Amount is too small for this currency' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to initialize payment' },
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