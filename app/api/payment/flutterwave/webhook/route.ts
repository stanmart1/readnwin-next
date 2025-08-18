import { NextRequest, NextResponse } from 'next/server';
import { FlutterwaveService } from '@/utils/flutterwave-service';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('verif-hash');
    
    if (!signature) {
      console.error('Flutterwave webhook: Missing signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
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
        console.error('Flutterwave webhook: Gateway not configured');
        return NextResponse.json(
          { error: 'Gateway not configured' },
          { status: 400 }
        );
      }

      const gateway = gatewayResult.rows[0];
      
      // Create Flutterwave service instance using environment variables
      const flutterwaveService = new FlutterwaveService();

      // Validate webhook signature (webhook secret is optional)
      const isValid = gateway.webhook_secret 
        ? flutterwaveService.validateWebhookSignature(payload, signature, gateway.webhook_secret)
        : true; // Skip validation if no webhook secret is configured

      if (!isValid) {
        console.error('Flutterwave webhook: Invalid signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        );
      }

      // Parse webhook payload
      const webhookData = JSON.parse(payload);
      console.log('Flutterwave webhook received:', webhookData);

      // Store webhook event
      await client.query(
        `INSERT INTO payment_webhooks (
          gateway_id, event_id, event_type, payload, processed
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          'flutterwave',
          webhookData.id || Date.now().toString(),
          webhookData.event || 'payment.completed',
          JSON.stringify(webhookData),
          false,
        ]
      );

      // Process the webhook based on event type
      if (webhookData.event === 'charge.completed' || webhookData.event === 'payment.completed') {
        const transactionData = webhookData.data;
        
        // Update transaction status
        await client.query(
          `UPDATE payment_transactions 
           SET status = $1, gateway_response = $2, updated_at = NOW()
           WHERE transaction_id = $3`,
          [
            transactionData.status === 'successful' ? 'completed' : 'failed',
            JSON.stringify(transactionData),
            transactionData.tx_ref,
          ]
        );

        // If payment is successful, process the order
        if (transactionData.status === 'successful') {
          // Get transaction details
          const transactionResult = await client.query(
            'SELECT * FROM payment_transactions WHERE transaction_id = $1',
            [transactionData.tx_ref]
          );

          if (transactionResult.rows.length > 0) {
            const transaction = transactionResult.rows[0];
            
            // Here you would typically:
            // 1. Update order status
            // 2. Send confirmation email
        
            // 4. Create invoice
            console.log('Processing successful payment for transaction:', transactionData.tx_ref);
          }
        }
      }

      // Mark webhook as processed
      await client.query(
        `UPDATE payment_webhooks 
         SET processed = true 
         WHERE event_id = $1`,
        [webhookData.id || Date.now().toString()]
      );

      return NextResponse.json({ success: true });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error processing Flutterwave webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
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