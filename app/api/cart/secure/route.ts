import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cartService } from '@/lib/cart/CartService';
import { sanitizeApiResponse, safeLog } from '@/utils/security';
import { validateAndSanitizeInput } from '@/utils/input-validation';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: true,
        items: [],
        summary: {
          totalItems: 0,
          totalValue: 0,
          totalSavings: 0,
          ebookCount: 0,
          physicalCount: 0,
          isEbookOnly: false,
          isPhysicalOnly: false,
          isMixedCart: false
        }
      });
    }

    const userId = parseInt(session.user.id);
    const [items, summary] = await Promise.all([
      cartService.getCartItems(userId),
      cartService.getCartSummary(userId)
    ]);

    return NextResponse.json(sanitizeApiResponse({
      success: true,
      items,
      summary
    }));

  } catch (error) {
    safeLog.error('Error fetching secure cart:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch cart',
      items: [],
      summary: {
        totalItems: 0,
        totalValue: 0,
        totalSavings: 0,
        ebookCount: 0,
        physicalCount: 0,
        isEbookOnly: false,
        isPhysicalOnly: false,
        isMixedCart: false
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { bookId, quantity = 1 } = body;
    
    if (!bookId || (typeof bookId !== 'number' && typeof bookId !== 'string')) {
      return NextResponse.json(
        { success: false, error: 'Valid bookId is required' },
        { status: 400 }
      );
    }
    
    const numericBookId = typeof bookId === 'string' ? parseInt(bookId) : bookId;
    const numericQuantity = typeof quantity === 'string' ? parseInt(quantity) : quantity;
    
    if (isNaN(numericBookId) || numericBookId < 1) {
      return NextResponse.json(
        { success: false, error: 'Valid bookId is required' },
        { status: 400 }
      );
    }
    
    if (isNaN(numericQuantity) || numericQuantity < 1 || numericQuantity > 99) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be between 1 and 99' },
        { status: 400 }
      );
    }
    
    const userId = parseInt(session.user.id);
    if (isNaN(userId) || userId < 1) {
      return NextResponse.json(
        { success: false, error: 'Invalid user session' },
        { status: 401 }
      );
    }

    const cartItem = await cartService.addToCart(userId, numericBookId, numericQuantity);

    return NextResponse.json(sanitizeApiResponse({
      success: true,
      message: 'Item added to cart successfully',
      item: cartItem
    }));

  } catch (error) {
    safeLog.error('Error adding to secure cart:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart';
    const statusCode = errorMessage.includes('not found') ? 404 : 500;

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookId, quantity } = body;
    
    if (!bookId || (typeof bookId !== 'number' && typeof bookId !== 'string')) {
      return NextResponse.json(
        { success: false, error: 'Valid bookId is required' },
        { status: 400 }
      );
    }
    
    const numericBookId = typeof bookId === 'string' ? parseInt(bookId) : bookId;
    const numericQuantity = typeof quantity === 'string' ? parseInt(quantity) : quantity;
    
    if (isNaN(numericBookId) || numericBookId < 1) {
      return NextResponse.json(
        { success: false, error: 'Valid bookId is required' },
        { status: 400 }
      );
    }
    
    if (isNaN(numericQuantity) || numericQuantity < 1 || numericQuantity > 99) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be between 1 and 99' },
        { status: 400 }
      );
    }
    const userId = parseInt(session.user.id);

    const cartItem = await cartService.updateQuantity(userId, numericBookId, numericQuantity);

    return NextResponse.json(sanitizeApiResponse({
      success: true,
      message: 'Cart updated successfully',
      item: cartItem
    }));

  } catch (error) {
    safeLog.error('Error updating secure cart:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to update cart';
    const statusCode = errorMessage.includes('not found') ? 404 :
                      errorMessage.includes('stock') ? 400 : 500;

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bookIdParam = searchParams.get('bookId');
    const userId = parseInt(session.user.id);

    if (bookIdParam) {
      // Remove specific item
      const numericBookId = parseInt(bookIdParam);
      
      if (isNaN(numericBookId) || numericBookId < 1) {
        return NextResponse.json(
          { success: false, error: 'Invalid book ID' },
          { status: 400 }
        );
      }

      await cartService.removeFromCart(userId, numericBookId);
      
      return NextResponse.json({
        success: true,
        message: 'Item removed from cart successfully'
      });
    } else {
      // Clear entire cart
      await cartService.clearCart(userId);
      
      return NextResponse.json({
        success: true,
        message: 'Cart cleared successfully'
      });
    }

  } catch (error) {
    safeLog.error('Error deleting from secure cart:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove item from cart';
    const statusCode = errorMessage.includes('not found') ? 404 : 500;

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}