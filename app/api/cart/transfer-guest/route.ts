import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cartService } from '@/lib/cart/CartService';
import { sanitizeApiResponse, safeLog } from '@/utils/security';
import { validateAndSanitizeInput } from '@/utils/input-validation';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { guest_cart_items } = body;

    if (!Array.isArray(guest_cart_items)) {
      return NextResponse.json(
        { success: false, error: 'Invalid guest cart data' },
        { status: 400 }
      );
    }

    const userId = parseInt(session.user.id);

    let transferredCount = 0;
    const errors = [];

    for (const item of guest_cart_items) {
      try {
        if (typeof item.book_id === 'number' && typeof item.quantity === 'number' && 
            item.book_id > 0 && item.quantity > 0 && item.quantity <= 99) {
          await cartService.addToCart(userId, item.book_id, item.quantity);
          transferredCount++;
        }
      } catch (error) {
        errors.push(`Failed to transfer item ${item.book_id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    safeLog.info('Guest cart transfer completed', { userId, transferredCount, errorCount: errors.length });

    return NextResponse.json(sanitizeApiResponse({
      success: true,
      message: `Successfully transferred ${transferredCount} items`,
      transferredCount,
      errors: errors.length > 0 ? errors : undefined
    }));

  } catch (error) {
    safeLog.error('Error transferring guest cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to transfer guest cart' },
      { status: 500 }
    );
  }
}