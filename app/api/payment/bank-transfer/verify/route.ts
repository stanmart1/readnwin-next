import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { bankTransferService } from '@/utils/bank-transfer-service';
import { ecommerceService } from '@/utils/ecommerce-service';
import { OrderStatus } from '@/utils/order-types';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'admin' && session.user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { bank_transfer_id, action, notes } = body;

    // Validate required fields
    if (!bank_transfer_id || !action) {
      return NextResponse.json(
        { error: 'Bank transfer ID and action are required' },
        { status: 400 }
      );
    }

    if (!['verify', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "verify" or "reject"' },
        { status: 400 }
      );
    }

    // Get bank transfer details
    const bankTransfer = await bankTransferService.getBankTransfer(bank_transfer_id);
    if (!bankTransfer) {
      return NextResponse.json(
        { error: 'Bank transfer not found' },
        { status: 404 }
      );
    }

    if (bankTransfer.status !== 'pending') {
      return NextResponse.json(
        { error: 'Bank transfer is not in pending status' },
        { status: 400 }
      );
    }

    // Update bank transfer status
    const newStatus = action === 'verify' ? 'verified' : 'rejected';
    const updatedTransfer = await bankTransferService.updateBankTransferStatus(
      bank_transfer_id,
      newStatus,
      parseInt(session.user.id),
      notes
    );

    if (!updatedTransfer) {
      return NextResponse.json(
        { error: 'Failed to update bank transfer status' },
        { status: 500 }
      );
    }

    // If verified, update order payment status
    if (action === 'verify') {
      try {
        // Update order payment status
        await ecommerceService.updateOrderPaymentInfo(
          bankTransfer.order_id,
          bankTransfer.transaction_reference,
          'bank_transfer',
          bankTransfer.amount
        );

        // Update order status to processing
        await ecommerceService.updateOrderStatus(
          bankTransfer.order_id,
          OrderStatus.PROCESSING,
          'Payment verified via bank transfer',
          parseInt(session.user.id)
        );

        // Add eBooks to user library if any
        const orderItems = await ecommerceService.getOrderItems(bankTransfer.order_id);
        for (const item of orderItems) {
          if (item.format === 'ebook') {
            await ecommerceService.addToLibrary(
              bankTransfer.user_id,
              item.book_id,
              bankTransfer.order_id
            );
          }
        }

        // Clear cart after successful payment verification
        try {
          await ecommerceService.clearCart(bankTransfer.user_id);
          console.log('Cart cleared after bank transfer verification');
        } catch (cartError) {
          console.error('Error clearing cart after bank transfer verification:', cartError);
          // Don't fail for cart clearing issues
        }

      } catch (error) {
        console.error('Error updating order after bank transfer verification:', error);
        // Don't fail the verification if order update fails
      }
    }

    return NextResponse.json({
      success: true,
      bankTransfer: {
        id: updatedTransfer.id,
        status: updatedTransfer.status,
        verified_at: updatedTransfer.verified_at,
        admin_notes: updatedTransfer.admin_notes
      },
      message: `Bank transfer ${action === 'verify' ? 'verified' : 'rejected'} successfully`
    });

  } catch (error) {
    console.error('Error verifying bank transfer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 