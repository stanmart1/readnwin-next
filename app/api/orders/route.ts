import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ecommerceService } from '@/utils/ecommerce-service-new';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const orders = await ecommerceService.getUserOrders(userId);

    return NextResponse.json({
      success: true,
      orders: orders
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      items, 
      shipping_address, 
      billing_address, 
      shipping_method,
      payment_method,
      discount_code,
      payment_intent_id,
      subtotal: providedSubtotal,
      shipping_cost: providedShippingCost,
      tax_amount: providedTaxAmount,
      discount_amount: providedDiscountAmount,
      total: providedTotal
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Order items are required' },
        { status: 400 }
      );
    }

    // Validate cart items using ecommerce service directly
    const cartItems = await ecommerceService.getCartItems(parseInt(session.user.id));
    
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Calculate totals if not provided
    let subtotal = providedSubtotal || 0;
    let shipping_cost = providedShippingCost || 0;
    let tax_amount = providedTaxAmount || 0;
    let discount_amount = providedDiscountAmount || 0;
    let total = providedTotal || 0;
    let final_shipping_method = shipping_method || 'standard';

    if (!providedSubtotal) {
      for (const item of items) {
        const book = await ecommerceService.getBookById(item.book_id);
        if (!book) {
          return NextResponse.json(
            { error: `Book with ID ${item.book_id} not found` },
            { status: 400 }
          );
        }
        subtotal += book.price * item.quantity;
      }
    }

    // Helper function to check if order contains only digital items
    const checkIfDigitalOnly = async (orderItems: Array<{ book_id: number, quantity: number }>) => {
      for (const item of orderItems) {
        const book = await ecommerceService.getBookById(item.book_id);
        if (book && book.format !== 'ebook') {
          return false; // Found a non-digital item
        }
      }
      return true; // All items are digital
    };

    // Calculate shipping if not provided
    if (!providedShippingCost && final_shipping_method && final_shipping_method !== 'Digital Download') {
      try {
        // Use the ecommerce service for proper shipping calculation
        const { ecommerceService } = await import('@/utils/ecommerce-service-new');
        
        shipping_cost = await ecommerceService.calculateShippingCost(cartItems, parseInt(final_shipping_method), parseInt(session.user.id));
      } catch (error) {
        console.error('Shipping calculation error:', error);
        shipping_cost = 0; // No hardcoded fallback
      }
    }

    // Check if order contains only digital items
    const isDigitalOnly = await checkIfDigitalOnly(items);
    if (isDigitalOnly) {
      shipping_cost = 0;
      final_shipping_method = 'Digital Download';
    }

    // Calculate tax if not provided
    if (!providedTaxAmount && shipping_address) {
      try {
        const taxRequest = {
          subtotal: subtotal + shipping_cost,
          shipping: shipping_cost,
          address: {
            state: shipping_address.state,
            country: shipping_address.country,
            zipCode: shipping_address.zipCode,
            city: shipping_address.city
          }
        };

        const taxResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/tax/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taxRequest)
        });

        if (taxResponse.ok) {
          const taxData = await taxResponse.json();
          tax_amount = taxData.taxAmount;
        }
      } catch (error) {
        console.error('Tax calculation error:', error);
        // Use default tax calculation
        tax_amount = (subtotal + shipping_cost) * 0.07; // 7% default
      }
    }

    // Validate discount code if provided
    if (discount_code && !providedDiscountAmount) {
      try {
        const discountRequest = {
          code: discount_code,
          subtotal: subtotal + shipping_cost + tax_amount
        };

        const discountResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/discounts/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(discountRequest)
        });

        if (discountResponse.ok) {
          const discountData = await discountResponse.json();
          discount_amount = discountData.discountAmount;
        }
      } catch (error) {
        console.error('Discount validation error:', error);
        discount_amount = 0;
      }
    }

    // Calculate final total
    if (!providedTotal) {
      total = subtotal + shipping_cost + tax_amount - discount_amount;
    }

    // Create order data
    const orderData = {
      user_id: parseInt(session.user.id),
      status: 'pending' as const,
      subtotal,
      tax_amount: tax_amount,
      shipping_amount: shipping_cost,
      discount_amount: discount_amount,
      total_amount: total,
              currency: 'NGN',
      payment_method: payment_method || 'stripe',
      payment_status: 'pending' as const,
      payment_transaction_id: payment_intent_id,
      shipping_address: JSON.stringify(shipping_address),
      billing_address: JSON.stringify(billing_address),
      shipping_method: final_shipping_method || 'standard'
    };

    // Create order using the new service method
    const order = await ecommerceService.createOrder(
      parseInt(session.user.id),
      cartItems,
      shipping_address || {
        first_name: 'Digital',
        last_name: 'Customer',
        email: session.user.email || '',
        phone: '',
        address: 'Digital Delivery',
        city: 'Digital',
        state: 'Digital',
        zip_code: '00000',
        country: 'NG'
      },
      billing_address || {
        first_name: 'Digital',
        last_name: 'Customer',
        email: session.user.email || '',
        phone: '',
        address: 'Digital Delivery',
        city: 'Digital',
        state: 'Digital',
        zip_code: '00000',
        country: 'NG'
      },
      shipping_method && !isNaN(parseInt(shipping_method)) ? parseInt(shipping_method) : undefined,
      discount_code
    );

    // DON'T clear cart here - wait for payment confirmation
    console.log('🛒 Cart preserved until payment confirmation');

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      total: total,
      subtotal: subtotal,
      shipping: shipping_cost,
      tax: tax_amount,
      discount: discount_amount
    });

  } catch (error) {
    console.error('Error creating order:', error);
    
    if (error instanceof Error && error.message.includes('Insufficient stock')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 