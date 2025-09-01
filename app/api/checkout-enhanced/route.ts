import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ecommerceService } from '@/utils/ecommerce-service-new';
import { FlutterwaveService } from '@/utils/flutterwave-service';
import { CheckoutFormData, OrderResponse, CartItem, Book, ShippingMethod } from '@/types/ecommerce';
import { query } from '@/utils/database';
import { sendEmail, getOrderConfirmationEmailTemplate } from '@/utils/email';

interface ShippingAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

interface EnhancedCheckoutData {
  formData: {
    shipping: ShippingAddress;
    billing: {
      same_as_shipping: boolean;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      zip_code: string;
      country: string;
    };
    shipping_method?: ShippingMethod;
    payment: {
      gateway: string;
      method: string;
    };
  };
  cartItems: CartItem[];
  analytics: {
    hasEbooks: boolean;
    hasPhysicalBooks: boolean;
    isEbookOnly: boolean;
    isPhysicalOnly: boolean;
    isMixedCart: boolean;
    totalItems: number;
    subtotal: number;
    estimatedShipping: number;
    tax: number;
    total: number;
  };
}

export async function POST(request: NextRequest) {
  let orderId: number | null = null;
  
  try {
    console.log('🚀 Enhanced Checkout API called');
    
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('❌ Authentication required');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    console.log('✅ User authenticated:', userId);

    // Parse request body
    const body: EnhancedCheckoutData = await request.json();
    const { formData, cartItems, analytics } = body;
    
    console.log('📦 Cart Analysis:', {
      isEbookOnly: analytics.isEbookOnly,
      isPhysicalOnly: analytics.isPhysicalOnly,
      isMixedCart: analytics.isMixedCart,
      totalItems: analytics.totalItems,
      total: analytics.total
    });

    // Validate cart has items
    const dbCartItems = await ecommerceService.getCartItems(userId);
    if (dbCartItems.length === 0) {
      console.log('❌ Cart is empty');
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Validate inventory for physical books
    for (const item of dbCartItems) {
      if (item.book?.format === 'physical' || item.book?.format === 'both') {
        const book = await ecommerceService.getBookById(item.book_id);
        if (book && book.stock_quantity > 0 && book.stock_quantity < item.quantity) {
          console.log(`❌ Insufficient stock for book ${book.title}`);
          return NextResponse.json(
            { error: `Insufficient stock for "${book.title}". Only ${book.stock_quantity} available.` },
            { status: 400 }
          );
        }
      }
    }

    // Validate required data based on cart type
    if (!analytics.isEbookOnly) {
      // Physical books require shipping address
      if (!formData.shipping?.address || !formData.shipping?.city || !formData.shipping?.state) {
        console.log('❌ Shipping address required for physical books');
        return NextResponse.json(
          { error: 'Shipping address is required for physical books' },
          { status: 400 }
        );
      }
      
      if (!formData.shipping_method) {
        console.log('❌ Shipping method required for physical books');
        return NextResponse.json(
          { error: 'Shipping method is required for physical books' },
          { status: 400 }
        );
      }
    }

    // Generate order number
    const orderNumber = `RW${Date.now()}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
    console.log('📋 Generated order number:', orderNumber);

    // Calculate final amounts
    const subtotal = dbCartItems.reduce((sum, item) => {
      return sum + ((item.book?.price || 0) * item.quantity);
    }, 0);

    const shippingCost = analytics.isEbookOnly ? 0 : (Number(formData.shipping_method?.base_cost) || 500);
    const taxRate = 0.075; // 7.5% VAT for Nigeria
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + shippingCost + taxAmount;

    console.log('💰 Order calculations:', {
      subtotal,
      shippingCost,
      taxAmount,
      totalAmount
    });

    // Prepare shipping and billing addresses
    const shippingAddress = analytics.isEbookOnly ? {
      first_name: formData.shipping.first_name || session.user.firstName || 'Digital',
      last_name: formData.shipping.last_name || session.user.lastName || 'Customer',
      email: formData.shipping.email || session.user.email || '',
      phone: formData.shipping.phone || '',
      address: 'Digital Delivery',
      city: 'Digital',
      state: 'Digital',
      zip_code: '00000',
      country: 'NG'
    } : formData.shipping;

    const billingAddress = formData.billing?.same_as_shipping ? shippingAddress : formData.billing;

    // Create order record
    console.log('💾 Creating order record...');
    const orderResult = await query(`
      INSERT INTO orders (
        order_number, user_id, status, subtotal, tax_amount, 
        shipping_amount, total_amount, currency, payment_method,
        payment_status, shipping_address, billing_address,
        shipping_method, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
      RETURNING id
    `, [
      orderNumber,
      userId,
      'pending',
      subtotal,
      taxAmount,
      shippingCost,
      totalAmount,
      'NGN',
      formData.payment.gateway,
      'pending',
      JSON.stringify(shippingAddress),
      JSON.stringify(billingAddress),
      analytics.isEbookOnly ? 'Digital Download' : formData.shipping_method?.name,
      analytics.isEbookOnly ? 'Digital order - eBooks only' : null
    ]);

    orderId = orderResult.rows[0].id;
    console.log('✅ Order created with ID:', orderId);

    // Create order items
    console.log('📝 Creating order items...');
    const orderItems = [];
    for (const cartItem of dbCartItems) {
      const book = cartItem.book;
      if (!book) continue;

      const itemResult = await query(`
        INSERT INTO order_items (
          order_id, book_id, title, author_name, price, 
          quantity, total_price, format, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING *
      `, [
        orderId,
        book.id,
        book.title,
        book.author_name || 'Unknown Author',
        book.price,
        cartItem.quantity,
        book.price * cartItem.quantity,
        book.format
      ]);

      orderItems.push(itemResult.rows[0]);
    }

    console.log('✅ Created order items:', orderItems.length);

    // Process payment based on selected gateway
    let paymentResult = null;
    let paymentUrl = null;

    if (formData.payment.gateway === 'flutterwave') {
      console.log('💳 Processing Flutterwave payment...');
      
      try {
        // Get Flutterwave gateway configuration
        const gatewayResult = await query(`
          SELECT * FROM payment_gateways 
          WHERE gateway_id = $1 AND enabled = true
        `, ['flutterwave']);

        if (gatewayResult.rows.length === 0) {
          throw new Error('Flutterwave payment gateway is not configured or enabled');
        }

        const gateway = gatewayResult.rows[0];
        console.log('🔍 Gateway config loaded:', {
          hasSecretKey: !!gateway.secret_key,
          hasPublicKey: !!gateway.public_key,
          testMode: gateway.test_mode
        });

        const flutterwaveService = new FlutterwaveService();

        const paymentData = {
          amount: totalAmount,
          currency: 'NGN',
          email: shippingAddress.email,
          phone_number: shippingAddress.phone,
          tx_ref: orderNumber,
          redirect_url: `${process.env.NEXTAUTH_URL}/api/payment/verify-enhanced`,
          customer: {
            email: shippingAddress.email,
            phone_number: shippingAddress.phone,
            name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
          },
          customizations: {
            title: 'ReadnWin Payment',
            description: `Payment for order ${orderNumber}`,
            logo: `${process.env.NEXTAUTH_URL}/logo.png`,
          },
          meta: {
            order_id: orderId,
            user_id: userId,
            order_number: orderNumber,
            order_type: analytics.isEbookOnly ? 'digital' : analytics.isPhysicalOnly ? 'physical' : 'mixed',
            has_ebooks: analytics.hasEbooks,
            has_physical: analytics.hasPhysicalBooks
          }
        };

        paymentResult = await flutterwaveService.initializePayment(paymentData);

        if (paymentResult.status === 'success') {
          paymentUrl = paymentResult.data.link;
          
          // Update order with payment transaction ID
          await query(`
            UPDATE orders SET payment_transaction_id = $1, payment_status = $2 WHERE id = $3
          `, [paymentResult.data.id, 'pending_payment', orderId]);
          
          // Create payment transaction record
          await query(`
            INSERT INTO payment_transactions (
              transaction_id, order_id, user_id, gateway, amount, currency, 
              status, reference, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          `, [
            paymentResult.data.id,
            orderId,
            userId,
            'flutterwave',
            totalAmount,
            'NGN',
            'pending',
            orderNumber
          ]);
          
          console.log('✅ Flutterwave payment initialized');
        } else {
          throw new Error('Failed to initialize Flutterwave payment');
        }
      } catch (error) {
        console.error('❌ Flutterwave payment error:', error);
        throw new Error('Payment initialization failed');
      }
    } else if (formData.payment.gateway === 'bank_transfer') {
      console.log('🏦 Bank transfer payment selected');
      
      try {
        // Import bank transfer service
        const { bankTransferService } = await import('@/utils/bank-transfer-service');
        
        // Create bank transfer record
        const bankTransfer = await bankTransferService.createBankTransfer(
          orderId,
          userId,
          totalAmount,
          'NGN'
        );
        
        // Get default bank account details
        const defaultBankAccount = await bankTransferService.getDefaultBankAccount();
        
        // Update order status
        await query(`
          UPDATE orders SET payment_status = $1, notes = $2 WHERE id = $3
        `, ['pending_bank_transfer', 'Awaiting bank transfer confirmation', orderId]);
        
        paymentResult = {
          status: 'pending',
          bankTransferId: bankTransfer.id,
          message: 'Please make payment to the provided bank account and upload proof',
          bank_details: {
            bank_name: defaultBankAccount?.bank_name || 'ReadnWin Bank Account',
            account_number: defaultBankAccount?.account_number || '1234567890',
            account_name: defaultBankAccount?.account_name || 'ReadnWin Limited',
            amount: totalAmount,
            reference: bankTransfer.transaction_reference,
            expires_at: bankTransfer.expires_at
          }
        };
        
        console.log('✅ Bank transfer record created');
      } catch (error) {
        console.error('❌ Bank transfer creation error:', error);
        throw new Error('Bank transfer setup failed');
      }
    }

    // For successful payment initialization or bank transfer, handle ebooks immediately
    if (analytics.hasEbooks && orderId && (paymentResult?.status === 'success' || formData.payment.gateway === 'bank_transfer')) {
      console.log('📚 Processing ebook library additions...');
      
      try {
        // Add ebooks to user library immediately (they'll be accessible after payment confirmation)
        for (const cartItem of dbCartItems) {
          const book = cartItem.book;
          if (book && (book.format === 'ebook' || book.format === 'both')) {
            await ecommerceService.addToUserLibrary(userId, book.id, orderId);
            console.log(`✅ Added ebook ${book.title} to user library`);
          }
        }
      } catch (error) {
        console.error('❌ Error adding ebooks to library:', error);
        // Don't fail the entire order for this - can be retried later
      }
    }

    // Update inventory for physical books
    if (analytics.hasPhysicalBooks) {
      console.log('📦 Updating inventory for physical books...');
      
      for (const cartItem of dbCartItems) {
        const book = cartItem.book;
        if (book && (book.format === 'physical' || book.format === 'both')) {
          try {
            // Reserve inventory (reduce stock_quantity, increase reserved_quantity)
            await query(`
              UPDATE books 
              SET stock_quantity = stock_quantity - $1,
                  reserved_quantity = reserved_quantity + $1
              WHERE id = $2 AND stock_quantity >= $1
            `, [cartItem.quantity, book.id]);
            
            console.log(`✅ Reserved ${cartItem.quantity} units of ${book.title}`);
          } catch (error) {
            console.error(`❌ Error reserving inventory for ${book.title}:`, error);
          }
        }
      }
    }

    // Send order confirmation email
    console.log('📧 Sending order confirmation email...');
    try {
      const emailTemplate = getOrderConfirmationEmailTemplate({
        orderNumber,
        orderTotal: `₦${totalAmount.toLocaleString()}`,
        items: orderItems.map(item => ({
          title: item.title,
          author: item.author_name,
          quantity: item.quantity,
          price: `₦${item.price.toLocaleString()}`,
          total: `₦${item.total_price.toLocaleString()}`,
          format: item.format
        })),
        shippingAddress: analytics.isEbookOnly ? null : shippingAddress,
        shippingMethod: analytics.isEbookOnly ? 'Digital Download' : formData.shipping_method?.name,
        paymentMethod: formData.payment.gateway === 'flutterwave' ? 'Flutterwave' : 'Bank Transfer',
        isDigital: analytics.isEbookOnly,
        isMixed: analytics.isMixedCart
      }, `${shippingAddress.first_name} ${shippingAddress.last_name}`);

      await sendEmail(
        shippingAddress.email,
        emailTemplate.subject,
        emailTemplate.html
      );
      
      console.log('✅ Order confirmation email sent');
    } catch (error) {
      console.error('❌ Error sending confirmation email:', error);
      // Don't fail the order for email issues
    }

    // DON'T clear cart here - wait for payment confirmation
    console.log('🛒 Cart preserved until payment confirmation');

    // Prepare response
    const response: OrderResponse = {
      order: {
        id: orderId,
        order_number: orderNumber,
        status: 'pending',
        user_id: userId,
        subtotal: subtotal,
        tax_amount: taxAmount,
        shipping_amount: shippingCost,
        discount_amount: 0,
        total_amount: totalAmount,
        currency: 'NGN',
        payment_method: formData.payment.gateway,
        payment_status: 'pending' as 'pending' | 'failed' | 'paid' | 'refunded',
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        shipping_method: analytics.isEbookOnly ? 'Digital Download' : formData.shipping_method?.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: orderItems
      },
      paymentUrl: paymentUrl,
      bankTransferDetails: formData.payment.gateway === 'bank_transfer' ? {
        bank_name: paymentResult?.bank_details?.bank_name || 'ReadnWin Bank Account',
        account_number: paymentResult?.bank_details?.account_number || '1234567890',
        account_name: paymentResult?.bank_details?.account_name || 'ReadnWin Limited',
        amount: totalAmount,
        reference: paymentResult?.bank_details?.reference || 'N/A'
      } : undefined
    };

    console.log('🎉 Checkout completed successfully');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Checkout error:', error);

    // If we created an order but failed later, update it as failed
    if (orderId) {
      try {
        await query(`
          UPDATE orders SET status = 'failed', notes = $1 WHERE id = $2
        `, [`Checkout failed: ${error instanceof Error ? error.message : 'Unknown error'}`, orderId]);
      } catch (updateError) {
        console.error('❌ Error updating failed order:', updateError);
      }
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Checkout failed',
        success: false 
      },
      { status: 500 }
    );
  }
}

// Helper function to validate payment gateway configuration
async function validatePaymentGateway(gatewayId: string): Promise<boolean> {
  try {
    const result = await query(`
      SELECT enabled, status FROM payment_gateways 
      WHERE gateway_id = $1
    `, [gatewayId]);

    if (result.rows.length === 0) {
      return false;
    }

    const gateway = result.rows[0];
    return gateway.enabled && gateway.status === 'active';
  } catch (error) {
    console.error('Error validating payment gateway:', error);
    return false;
  }
} 