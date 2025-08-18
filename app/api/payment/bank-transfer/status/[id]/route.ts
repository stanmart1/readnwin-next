import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { bankTransferService } from '@/utils/bank-transfer-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const bankTransferId = parseInt(params.id);
    if (isNaN(bankTransferId)) {
      return NextResponse.json(
        { error: 'Invalid bank transfer ID' },
        { status: 400 }
      );
    }

    // Get bank transfer details
    const bankTransfer = await bankTransferService.getBankTransfer(bankTransferId);
    if (!bankTransfer) {
      return NextResponse.json(
        { error: 'Bank transfer not found' },
        { status: 404 }
      );
    }

    // Check if user owns this bank transfer or is admin
    if (bankTransfer.user_id !== parseInt(session.user.id) && 
        session.user.role !== 'admin' && 
        session.user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get payment proofs
    const proofs = await bankTransferService.getPaymentProofs(bankTransferId);

    // Get default bank account details
    const bankAccount = await bankTransferService.getDefaultBankAccount();

    // Get order details
    const { query } = await import('@/utils/database');
    
    const orderResult = await query(`
      SELECT order_number, total_amount, payment_status, created_at
      FROM orders 
      WHERE id = $1
    `, [bankTransfer.order_id]);

    const order = orderResult.rows[0] || {};

    return NextResponse.json({
      success: true,
      bankTransfer: {
        id: bankTransfer.id,
        transaction_reference: bankTransfer.transaction_reference,
        amount: bankTransfer.amount,
        currency: bankTransfer.currency,
        status: bankTransfer.status,
        expires_at: bankTransfer.expires_at,
        created_at: bankTransfer.created_at,
        admin_notes: bankTransfer.admin_notes,
        verified_at: bankTransfer.verified_at
      },
      order: {
        order_number: order.order_number,
        total_amount: order.total_amount,
        payment_status: order.payment_status,
        created_at: order.created_at
      },
      proofs: proofs.map(proof => ({
        id: proof.id,
        file_name: proof.file_name,
        file_path: proof.file_path,
        upload_date: proof.upload_date,
        is_verified: proof.is_verified
      })),
      bankAccount: bankAccount ? {
        bank_name: bankAccount.bank_name,
        account_number: bankAccount.account_number,
        account_name: bankAccount.account_name
      } : null,
      isExpired: new Date() > new Date(bankTransfer.expires_at),
      timeRemaining: Math.max(0, new Date(bankTransfer.expires_at).getTime() - new Date().getTime())
    });

  } catch (error) {
    console.error('Error getting bank transfer status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 