import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ecommerceService } from '@/utils/ecommerce-service-new';
import { FlutterwaveService } from '@/utils/flutterwave-service';
import { CheckoutFormData, OrderResponse } from '@/types/ecommerce';
import { query } from '@/utils/database';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Checkout API called');
    
    const session = await getServerSession(authOptions);
    console.log('🔍 Session:', JSON.stringify(session, null, 2));
    
    if (!session?.user?.id) {
      console.log('❌ No session or user ID');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: CheckoutFormData | { formData: CheckoutFormData } = await request.json();
    console.log('🔍 Request body:', JSON.stringify(body, null, 2));
    
    // Handle nested formData structure from frontend
    const requestData = 'formData' in body ? body : { formData: body as CheckoutFormData };
    const { formData } = requestData;
    
    console.log('🔍 Form data:', JSON.stringify(formData, null, 2));
    console.log('🔍 Form data shipping:', JSON.stringify(formData.shipping, null, 2));
    console.log('🔍 Form data billing:', JSON.stringify(formData.billing, null, 2));
    console.log('🔍 Form data payment:', JSON.stringify(formData.payment, null, 2));
    
    const userId = parseInt(session.user.id);
    console.log('🔍 User ID:', userId);

    // Validate cart has items
    console.log('🔍 Getting cart items...');
    const cartItems = await ecommerceService.getCartItems(userId);
    console.log('🔍 Cart items count:', cartItems.length);
    
    if (cartItems.length === 0) {
      console.log('❌ Cart is empty');
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Get cart analytics to determine checkout flow
    console.log('🔍 Getting cart analytics...');
    const analytics = await ecommerceService.getCartAnalytics(userId);
    console.log('🔍 Analytics:', JSON.stringify(analytics, null, 2));
    
    const isEbookOnly = analytics.isEbookOnly;
    console.log('🔍 Is ebook only:', isEbookOnly);

    // Handle shipping addresses based on cart type
    let shippingAddress = formData.shipping;
    let billingAddress = formData.billing;

    if (isEbookOnly) {
      console.log('🔍 Creating default addresses for e-books...');
      // For e-books, use default digital delivery addresses
              const userFirstName = session.user.firstName || 'User';
        const userLastName = session.user.lastName || 'Name';
      const userEmail = session.user.email || '';
      
      console.log('🔍 User details:', { userFirstName, userLastName, userEmail });
      
      shippingAddress = {
        first_name: formData.shipping?.first_name || userFirstName,
        last_name: formData.shipping?.last_name || userLastName,
        email: formData.shipping?.email || userEmail,
        phone: formData.shipping?.phone || '+2340000000000',
        address: 'Digital Delivery',
        city: 'Digital',
        state: 'Digital',
        zip_code: '00000',
        country: 'NG'
      };

      billingAddress = {
        sameAsShipping: true,
        first_name: formData.billing?.first_name || userFirstName,
        last_name: formData.billing?.last_name || userLastName,
        address: 'Digital Delivery',
        city: 'Digital',
        state: 'Digital',
        zip_code: '00000',
        country: 'NG'
      };
      
      console.log('🔍 Created addresses for ebook-only order:', { shippingAddress, billingAddress });
    } else {
      // For physical books, validate shipping address is required
      if (!formData.shipping || !formData.shipping.first_name || !formData.shipping.address) {
        console.log('❌ Shipping address required for physical books');
        return NextResponse.json(
          { error: 'Shipping address is required for physical books' },
          { status: 400 }
        );
      }
      console.log('✅ Shipping address provided for physical books');
    }

    // Validate payment method
    if (!formData.payment?.method) {
      console.log('❌ Payment method required');
      return NextResponse.json(
        { error: 'Payment method is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Payment method:', formData.payment.method);

    // Create order
    console.log('🔍 Creating order...');
    const order = await ecommerceService.createOrder(
      userId,
      cartItems,
      shippingAddress,
      billingAddress,
      formData.shippingMethod?.id,
      formData.discountCode
    );
    console.log('🔍 Order created:', JSON.stringify(order, null, 2));
    
    if (!order || !order.id) {
      console.error('❌ Order creation failed - no order ID returned');
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // Add eBooks to user library immediately after successful order creation
    // Check if cart has any ebooks by examining cart items
    const hasEbooks = cartItems.some(item => 
      item.book?.format === 'ebook' || item.book?.format === 'both'
    );
    
    if (hasEbooks) {
      console.log('📚 Adding eBooks to user library...');
      try {
        for (const item of cartItems) {
          if (item.book?.format === 'ebook' || item.book?.format === 'both') {
            await ecommerceService.addToUserLibrary(userId, item.book_id, order.id);
            console.log(`✅ Added eBook "${item.book.title}" to user library`);
          }
        }
        console.log('✅ All eBooks added to user library successfully');
      } catch (libraryError) {
        console.error('❌ Error adding eBooks to library:', libraryError);
        // Don't fail the entire checkout for library issues - this can be retried later
      }
    }

    // Send order confirmation email
    try {
      const { sendOrderConfirmationEmail } = await import('@/utils/email');
      const userResult = await query('SELECT first_name, last_name, email FROM users WHERE id = $1', [userId]);
      const user = userResult.rows[0];
      
      if (user?.email) {
        const orderDetails = {
          orderId: order.order_number,
          orderNumber: order.order_number,
          total: order.total_amount,
          items: cartItems.map(item => ({
            title: item.book?.title || 'Unknown Book',
            author: item.book?.author_name || 'Unknown Author',
            quantity: item.quantity,
            price: item.book?.price || 0
          }))
        };

        const userName = user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : (user.first_name || user.last_name || 'Customer');
        const emailResult = await sendOrderConfirmationEmail(user.email, orderDetails, userName);
        if (emailResult.success) {
          console.log('✅ Order confirmation email sent');
        } else {
          console.warn('⚠️ Order confirmation email failed:', emailResult.error);
        }
      }
    } catch (emailError) {
      console.error('❌ Error sending order confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

    // Generate transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    console.log('🔍 Transaction ID:', transactionId);

    // Create payment transaction record
    console.log('🔍 Creating payment transaction...');
    let paymentTransactionCreated = false;
    try {
      await ecommerceService.createPaymentTransaction(
        order.order_number,
        formData.payment.method,
        userId,
        order.total_amount,
        transactionId
      );
      console.log('🔍 Payment transaction created');
      paymentTransactionCreated = true;
    } catch (error) {
      console.error('❌ Error creating payment transaction:', error);
      console.warn('⚠️ Payment transaction creation failed, but continuing with checkout');
      // Continue without payment transaction record
    }

    // Update order with payment method
    console.log('🔍 Updating order with payment method...');
    try {
      await ecommerceService.updateOrderPaymentMethod(order.id, formData.payment.method, transactionId);
      console.log('🔍 Order payment method updated');
    } catch (error) {
      console.error('❌ Error updating order payment method:', error);
      console.warn('⚠️ Order payment method update failed, but continuing with checkout');
      // Don't throw error here as the order was created successfully
    }

    // Handle different payment methods
    if (formData.payment.method === 'bank_transfer') {
      console.log('🔍 Processing bank transfer...');
      
      // Import bank transfer service
      let bankTransferService;
      try {
        const { bankTransferService: importedService } = await import('@/utils/bank-transfer-service');
        bankTransferService = importedService;
      } catch (importError) {
        console.error('❌ Error importing bank transfer service:', importError);
        return NextResponse.json(
          { error: 'Bank transfer service not available' },
          { status: 500 }
        );
      }
      
      // Create bank transfer record
      const bankTransfer = await bankTransferService.createBankTransfer(
        order.id,
        userId,
        order.total_amount,
        'NGN'
      );
      
      console.log('🔍 Bank transfer record created:', bankTransfer.id);
      
      // Update order payment status to payment_processing (waiting for proof)
      await query(`
        UPDATE orders 
        SET payment_status = 'payment_processing', updated_at = CURRENT_TIMESTAMP 
        WHERE id = $1
      `, [order.id]);
      console.log('🔍 Order payment status updated to payment_processing');
      
      // Get default bank account details
      const defaultBankAccount = await bankTransferService.getDefaultBankAccount();
      
      // Return bank transfer details
      const bankTransferDetails = {
        bank_name: defaultBankAccount?.bank_name || 'ReadnWin Bank',
        account_number: defaultBankAccount?.account_number || '1234567890',
        account_name: defaultBankAccount?.account_name || 'ReadnWin Bookstore',
        amount: order.total_amount,
        reference: bankTransfer.transaction_reference,
        expires_at: bankTransfer.expires_at
      };

      console.log('✅ Bank transfer processed successfully');
      console.log('🔍 Bank transfer ID:', bankTransfer.id);
      console.log('🔍 Bank transfer details:', bankTransferDetails);
      
      return NextResponse.json({
        success: true,
        order: { ...order, payment_status: 'payment_processing' },
        paymentMethod: 'bank_transfer',
        bankTransferId: bankTransfer.id,
        bankTransferDetails,
        message: 'Order created successfully. Please complete bank transfer and upload proof.'
      });

    } else if (formData.payment.method === 'flutterwave') {
      console.log('🔍 Processing Flutterwave payment...');
      // Initialize Flutterwave payment
      try {
        const gateway = await getPaymentGateway('flutterwave');
        console.log('🔍 Payment gateway:', gateway ? 'Found' : 'Not found');
        
        if (!gateway || !gateway.enabled) {
          console.log('❌ Flutterwave payment not available');
          return NextResponse.json(
            { error: 'Flutterwave payment is not available' },
            { status: 400 }
          );
        }

        console.log('🔍 Gateway config:', {
          hasSecretKey: !!gateway.secret_key,
          hasPublicKey: !!gateway.public_key,
          hasHash: !!gateway.hash,
          testMode: gateway.test_mode
        });

        const flutterwaveService = new FlutterwaveService();

        const paymentData = {
          amount: Number(order.total_amount), // Ensure amount is a number
          currency: 'NGN',
          email: shippingAddress.email,
          phone_number: shippingAddress.phone || '',
          tx_ref: transactionId,
          redirect_url: `${process.env.NEXTAUTH_URL || 'https://readnwin.com'}/payment/verify`,
          customer: {
            email: shippingAddress.email,
            phone_number: shippingAddress.phone || '',
            name: `${shippingAddress.first_name || ''} ${shippingAddress.last_name || ''}`.trim() || shippingAddress.email,
          },
          customizations: {
            title: 'ReadnWin Payment',
            description: `Payment for order ${order.order_number}`,
            logo: `${process.env.NEXTAUTH_URL || 'https://readnwin.com'}/logo.png`,
          },
          meta: {
            order_id: order.id,
            user_id: userId,
            order_number: order.order_number,
            is_ebook_only: isEbookOnly,
          },
        };

        console.log('🔍 Payment data:', JSON.stringify(paymentData, null, 2));
        console.log('🔍 Flutterwave service config:', {
          baseUrl: flutterwaveService['baseUrl'],
          testMode: flutterwaveService['testMode'],
          hasSecretKey: !!gateway.secret_key,
          hasPublicKey: !!gateway.public_key,
          hasHash: !!gateway.hash
        });
        console.log('🔍 Initializing Flutterwave payment...');
        
        const result = await flutterwaveService.initializePayment(paymentData);
        console.log('✅ Flutterwave payment initialized:', JSON.stringify(result, null, 2));

        return NextResponse.json({
          success: true,
          order: order,
          paymentMethod: 'flutterwave',
          paymentUrl: result.data.link, // Keep for backward compatibility
          inlinePaymentData: flutterwaveService.prepareInlinePaymentData(paymentData),
          reference: transactionId,
          message: 'Inline Flutterwave payment ready...'
        } as OrderResponse);

      } catch (error) {
        console.error('❌ Flutterwave payment error:', error);
        console.error('❌ Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack trace'
        });
        return NextResponse.json(
          { error: 'Failed to initialize Flutterwave payment' },
          { status: 500 }
        );
      }
    }

    console.log('❌ Invalid payment method');
    return NextResponse.json(
      { error: 'Invalid payment method' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Error processing checkout:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof Error) {
      if (error.message.includes('Insufficient stock')) {
        return NextResponse.json(
          { error: 'Some items are out of stock' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    );
  }
}

// Helper function to get all payment gateways
async function getPaymentGateways() {
  try {
    const { query } = await import('@/utils/database');
    const result = await query(`
      SELECT * FROM payment_gateways 
      WHERE enabled = true
    `);
    return result.rows;
  } catch (error) {
    console.error('Error getting payment gateways:', error);
    return [];
  }
}

// Helper function to get payment gateway configuration
async function getPaymentGateway(gatewayId: string) {
  try {
    const { query } = await import('@/utils/database');
    const result = await query(`
      SELECT * FROM payment_gateways 
      WHERE gateway_id = $1 AND enabled = true
    `, [gatewayId]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting payment gateway:', error);
    return null;
  }
}

// Get checkout summary
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const shippingMethodId = searchParams.get('shipping_method_id');
    const discountCode = searchParams.get('discount_code');

    const userId = parseInt(session.user.id);
    
    // Validate cart has items
    const cartItems = await ecommerceService.getCartItems(userId);
    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Get checkout summary
    const summary = await ecommerceService.getCheckoutSummary(
      userId,
      shippingMethodId ? parseInt(shippingMethodId) : undefined,
      discountCode || undefined
    );

    // Get available shipping methods
    const shippingMethods = await ecommerceService.getShippingMethods();

    return NextResponse.json({
      success: true,
      summary,
      shippingMethods,
      cartItems
    });

  } catch (error) {
    console.error('Error getting checkout summary:', error);
    return NextResponse.json(
      { error: 'Failed to get checkout summary' },
      { status: 500 }
    );
  }
} 