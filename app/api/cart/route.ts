import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ecommerceService } from '@/utils/ecommerce-service-new';
import { validateInput, sanitizeInput, requireAuth, validateId } from '@/utils/security-middleware';
import { handleApiError } from '@/utils/error-handler';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const userId = parseInt(auth.user.id);
    const cartItems = await ecommerceService.getCartItems(userId);
    const analytics = await ecommerceService.getCartAnalytics(userId);

    return NextResponse.json({
      success: true,
      cartItems,
      analytics
    });

  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { book_id, quantity = 1, guest_cart_items } = body;

    // Input validation
    const validation = validateInput(body, {
      book_id: { required: true, type: 'number' },
      quantity: { type: 'number' }
    });

    if (!validation.isValid) {
      return NextResponse.json({ error: 'Validation failed', details: validation.errors }, { status: 400 });
    }

    const validBookId = validateId(book_id.toString());
    if (!validBookId) {
      return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 });
    }

    if (quantity < 1 || quantity > 99) {
      return NextResponse.json({ error: 'Quantity must be between 1 and 99' }, { status: 400 });
    }

    // Check if book exists and has stock
    const book = await ecommerceService.getBookById(book_id);
    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    if (book.stock_quantity < quantity) {
      return NextResponse.json(
        { error: `Only ${book.stock_quantity} copies available` },
        { status: 400 }
      );
    }

    // Handle guest cart merging if provided
    if (guest_cart_items && Array.isArray(guest_cart_items) && guest_cart_items.length > 0) {
      for (const guestItem of guest_cart_items) {
        try {
          await ecommerceService.addToCart(
            parseInt(auth.user.id),
            guestItem.book_id,
            guestItem.quantity
          );
        } catch (error) {
          console.error('Error merging guest cart item:', error);
        }
      }
    }

    const cartItem = await ecommerceService.addToCart(
      parseInt(auth.user.id),
      validBookId,
      quantity
    );

    return NextResponse.json({
      success: true,
      cartItem,
      message: guest_cart_items ? 'Cart merged and item added successfully' : 'Item added to cart successfully'
    });

  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { book_id, quantity } = body;

    // Enhanced validation
    if (!book_id || quantity === undefined) {
      return NextResponse.json(
        { error: 'Book ID and quantity are required' },
        { status: 400 }
      );
    }

    if (quantity < 0 || quantity > 99) {
      return NextResponse.json(
        { error: 'Quantity must be between 0 and 99' },
        { status: 400 }
      );
    }

    // Check stock availability if quantity > 0
    if (quantity > 0) {
      const book = await ecommerceService.getBookById(book_id);
      if (!book) {
        return NextResponse.json(
          { error: 'Book not found' },
          { status: 404 }
        );
      }

      // Only check stock for physical books with inventory tracking
      if (book.format === 'physical' && book.stock_quantity > 0 && book.stock_quantity < quantity) {
        return NextResponse.json(
          { error: `Only ${book.stock_quantity} copies available` },
          { status: 400 }
        );
      }
    }

    const validBookId = validateId(book_id.toString());
    if (!validBookId) {
      return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 });
    }

    const cartItem = await ecommerceService.updateCartItemQuantity(
      parseInt(auth.user.id),
      validBookId,
      quantity
    );

    return NextResponse.json({
      success: true,
      cartItem,
      message: quantity > 0 ? 'Cart updated successfully' : 'Item removed from cart'
    });

  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const book_id = searchParams.get('book_id');

    if (book_id) {
      // Remove specific item
      await ecommerceService.removeFromCart(
        parseInt(session.user.id),
        parseInt(book_id)
      );

      return NextResponse.json({
        success: true,
        message: 'Item removed from cart'
      });
    } else {
      // Clear entire cart
      await ecommerceService.clearCart(parseInt(session.user.id));

      return NextResponse.json({
        success: true,
        message: 'Cart cleared successfully'
      });
    }

  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 