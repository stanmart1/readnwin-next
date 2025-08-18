import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ecommerceService } from '@/utils/ecommerce-service';
import { rbacService } from '@/utils/rbac-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId, cartItems } = await request.json();

    if (!userId || !cartItems || !Array.isArray(cartItems)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Verify the user ID matches the session user
    if (parseInt(session.user.id) !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permission
    const hasPermission = await rbacService.hasPermission(
      userId,
      'cart.manage'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Transfer each cart item to the user's account
    const transferredItems = [];
    const errors = [];

    for (const item of cartItems) {
      try {
        // Check if item already exists in user's cart
        const existingCart = await ecommerceService.getCartItems(userId);
        const existingItem = existingCart.find((cartItem: any) => cartItem.book_id === item.book_id);

        if (existingItem) {
          // Update quantity if item already exists
          await ecommerceService.updateCartItemQuantity(userId, item.book_id, existingItem.quantity + item.quantity);
        } else {
          // Add new item to cart
          await ecommerceService.addToCart(userId, item.book_id, item.quantity);
        }

        transferredItems.push(item);
      } catch (error) {
        console.error(`Error transferring cart item ${item.book_id}:`, error);
        errors.push({
          book_id: item.book_id,
          error: 'Failed to transfer item'
        });
      }
    }

    // Log audit event
    await rbacService.logAuditEvent(
      userId,
      'cart.transfer_guest_cart',
      'cart',
      userId,
      { 
        transferred_items: transferredItems.length,
        errors: errors.length,
        total_items: cartItems.length
      },
      request.headers.get('x-forwarded-for') || request.ip || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      message: `Successfully transferred ${transferredItems.length} items to your cart`,
      transferredItems,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Error transferring guest cart:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 