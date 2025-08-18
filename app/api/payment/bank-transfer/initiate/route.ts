import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { bankTransferService } from '@/utils/bank-transfer-service';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Bank transfer initiate endpoint called');
    
    const session = await getServerSession(authOptions);
    console.log('🔍 Session check:', session ? 'Authenticated' : 'Not authenticated');
    console.log('🔍 Session details:', session ? {
      userId: session.user?.id,
      email: session.user?.email,
      role: session.user?.role
    } : 'No session');
    
    if (!session?.user?.id) {
      console.log('❌ Authentication required but not provided');
      return NextResponse.json(
        { 
          error: 'Authentication required',
          details: 'Please log in to continue with payment',
          session: session ? 'Session exists but no user ID' : 'No session found'
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('🔍 Request body:', JSON.stringify(body, null, 2));
    
    const { order_id, amount, currency = 'NGN' } = body;

    // Validate required fields
    if (!order_id || !amount) {
      console.log('❌ Missing required fields:', { order_id, amount });
      return NextResponse.json(
        { error: 'Order ID and amount are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Check if order exists and belongs to user
    const { query } = await import('@/utils/database');
    
    const orderResult = await query(`
      SELECT id, user_id, total_amount, payment_status 
      FROM orders 
      WHERE id = $1 AND user_id = $2
    `, [order_id, session.user.id]);

      if (orderResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Order not found or does not belong to user' },
          { status: 404 }
        );
      }

      const order = orderResult.rows[0];
      
      if (order.payment_status === 'paid') {
        return NextResponse.json(
          { error: 'Order has already been paid' },
          { status: 400 }
        );
      }

      // Check if amount matches order total
      if (Math.abs(order.total_amount - amount) > 0.01) {
        return NextResponse.json(
          { error: 'Amount does not match order total' },
          { status: 400 }
        );
      }

      // Check if bank transfer already exists for this order
      const existingTransfer = await query(`
        SELECT id, status FROM bank_transfers 
        WHERE order_id = $1 AND status IN ('pending', 'verified')
      `, [order_id]);

      if (existingTransfer.rows.length > 0) {
        return NextResponse.json(
          { error: 'Bank transfer already exists for this order' },
          { status: 400 }
        );
      }

      // Create bank transfer
      const bankTransfer = await bankTransferService.createBankTransfer(
        order_id,
        parseInt(session.user.id),
        amount,
        currency
      );

      // Get bank account details
      const bankAccount = await bankTransferService.getDefaultBankAccount();

      return NextResponse.json({
        success: true,
        bankTransfer: {
          id: bankTransfer.id,
          transaction_reference: bankTransfer.transaction_reference,
          amount: bankTransfer.amount,
          currency: bankTransfer.currency,
          expires_at: bankTransfer.expires_at,
          status: bankTransfer.status
        },
        bankAccount: bankAccount ? {
          bank_name: bankAccount.bank_name,
          account_number: bankAccount.account_number,
          account_name: bankAccount.account_name
        } : null,
        instructions: [
          'Transfer the exact amount to the provided bank account',
          'Use the transaction reference as payment description',
          'Upload proof of payment after completing the transfer',
          'Payment expires in 24 hours'
        ]
      });

  } catch (error) {
    console.error('❌ Error initiating bank transfer:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    if (error instanceof Error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        return NextResponse.json(
          { error: 'Database configuration error. Please contact support.' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('connection')) {
        return NextResponse.json(
          { error: 'Database connection error. Please try again.' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to initiate bank transfer. Please try again.' },
      { status: 500 }
    );
  }
} 