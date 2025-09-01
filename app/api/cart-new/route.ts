import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ecommerceService } from '@/utils/ecommerce-service-new';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      // Return empty cart for unauthenticated users instead of error
      return NextResponse.json({
        success: true,
        cartItems: [],
        analytics: {
          totalItems: 0,
          totalValue: 0,
          totalSavings: 0,
          itemCount: 0,
          averageItemValue: 0,
          ebookCount: 0,
          physicalCount: 0,
          isEbookOnly: false,
          isPhysicalOnly: false,
          isMixedCart: false
        }
      });
    }

    const userId = parseInt(session.user.id);
    const cartItems = await ecommerceService.getCartItems(userId);
    const analytics = await ecommerceService.getCartAnalytics(userId);

    return NextResponse.json({
      success: true,
      cartItems,
      analytics
    });

  } catch (error) {
    console.error('Error fetching cart:', error);
    // Return empty cart on error to prevent UI breaking
    return NextResponse.json({
      success: true, // Changed to true to prevent UI errors
      cartItems: [],
      analytics: {
        totalItems: 0,
        totalValue: 0,
        totalSavings: 0,
        itemCount: 0,
        averageItemValue: 0,
        ebookCount: 0,
        physicalCount: 0,
        isEbookOnly: false,
        isPhysicalOnly: false,
        isMixedCart: false
      }
    }, { status: 200 }); // Ensure 200 status
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🛒 Cart POST API called');
    
    const session = await getServerSession(authOptions);
    console.log('Session check:', { hasSession: !!session, userId: session?.user?.id });
    
    if (!session?.user?.id) {
      console.log('❌ No session or user ID found in cart POST API');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access this resource' },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
      console.log('Request body:', body);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { book_id, quantity = 1 } = body;

    // Enhanced validation
    if (!book_id) {
      console.log('❌ Missing book_id');
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      );
    }

    if (typeof book_id !== 'number' || isNaN(book_id) || book_id <= 0) {
      console.log('❌ Invalid book_id:', book_id, typeof book_id);
      return NextResponse.json(
        { error: 'Valid book ID is required (must be a positive number)' },
        { status: 400 }
      );
    }

    if (typeof quantity !== 'number' || isNaN(quantity) || quantity < 1 || quantity > 99) {
      console.log('❌ Invalid quantity:', quantity, typeof quantity);
      return NextResponse.json(
        { error: 'Quantity must be between 1 and 99' },
        { status: 400 }
      );
    }

    const userId = parseInt(session.user.id);
    if (isNaN(userId)) {
      console.log('❌ Invalid user ID:', session.user.id);
      return NextResponse.json(
        { error: 'Invalid user session' },
        { status: 401 }
      );
    }

    console.log('✅ Validation passed, calling ecommerceService.addToCart', { userId, book_id, quantity });
    
    // Ensure cart_items table exists before proceeding
    try {
      await ecommerceService.ensureCartTableExists();
    } catch (tableError) {
      console.error('Failed to ensure cart table exists:', tableError);
      return NextResponse.json(
        { success: false, error: 'Database initialization error' },
        { status: 503 }
      );
    }
    
    const cartItem = await ecommerceService.addToCart(userId, book_id, quantity);
    console.log('✅ Cart item added successfully:', cartItem?.id);

    return NextResponse.json({
      success: true,
      message: 'Item added to cart successfully',
      cartItem
    });

  } catch (error) {
    console.error('❌ Error adding to cart:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    if (error instanceof Error) {
      // Database connection errors
      if (error.message.includes('connect') || error.message.includes('ECONNREFUSED')) {
        console.error('Database connection error');
        return NextResponse.json(
          { success: false, error: 'Database connection error' },
          { status: 503 }
        );
      }
      
      // Book not found
      if (error.message.includes('not found') || error.message.includes('Book not found')) {
        return NextResponse.json(
          { success: false, error: 'Book not found' },
          { status: 404 }
        );
      }
      
      // Stock issues
      if (error.message.includes('Insufficient stock') || error.message.includes('stock')) {
        return NextResponse.json(
          { success: false, error: 'Insufficient stock available' },
          { status: 400 }
        );
      }
      
      // Database schema issues
      if (error.message.includes('column') || error.message.includes('relation') || error.message.includes('format')) {
        console.log('Database schema issue detected:', error.message);
        return NextResponse.json(
          { success: false, error: 'Database schema issue - please contact support' },
          { status: 500 }
        );
      }
      
      // PostgreSQL specific errors
      if (error.message.includes('duplicate key') || (error as any).code === '23505') {
        return NextResponse.json(
          { success: false, error: 'Item already in cart' },
          { status: 409 }
        );
      }
      
      if ((error as any).code === '23503') {
        return NextResponse.json(
          { success: false, error: 'Invalid book reference' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ No session or user ID found in cart PUT API');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access this resource' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { book_id, quantity } = body;

    // Validation
    if (!book_id || typeof book_id !== 'number') {
      return NextResponse.json(
        { error: 'Valid book ID is required' },
        { status: 400 }
      );
    }

    if (!quantity || quantity < 1 || quantity > 99) {
      return NextResponse.json(
        { error: 'Valid quantity is required (1-99)' },
        { status: 400 }
      );
    }

    const userId = parseInt(session.user.id);
    const cartItem = await ecommerceService.updateCartItemQuantity(userId, book_id, quantity);

    return NextResponse.json({
      success: true,
      message: 'Cart updated successfully',
      cartItem
    });

  } catch (error) {
    console.error('Error updating cart:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Insufficient stock')) {
        return NextResponse.json(
          { error: 'Insufficient stock available' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('❌ No session or user ID found in cart DELETE API');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to access this resource' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('book_id');

    const userId = parseInt(session.user.id);

    if (bookId) {
      // Remove specific item
      const bookIdNum = parseInt(bookId);
      if (isNaN(bookIdNum)) {
        return NextResponse.json(
          { error: 'Invalid book ID' },
          { status: 400 }
        );
      }

      await ecommerceService.removeFromCart(userId, bookIdNum);
      
      return NextResponse.json({
        success: true,
        message: 'Item removed from cart successfully'
      });
    } else {
      // Clear entire cart
      await ecommerceService.clearCart(userId);
      
      return NextResponse.json({
        success: true,
        message: 'Cart cleared successfully'
      });
    }

  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
} 