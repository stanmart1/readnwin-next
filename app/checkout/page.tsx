'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
// Using RemixIcon classes instead of Lucide icons
import { useGuestCart } from '@/contexts/GuestCartContext';
import { useSecureCart } from '@/contexts/SecureCartContext';
import { useFlutterwaveInline } from '@/hooks/useFlutterwaveInline';
import Header from '@/components/Header';
import NewCheckoutFlow from '@/components/checkout/NewCheckoutFlow';

export default function EnhancedCheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const guestCart = useGuestCart();
  const secureCart = useSecureCart();
  
  // Use appropriate cart based on authentication status
  const { items: cartItems, isLoading, error } = session ? secureCart : guestCart;
  const getTotalItems = () => session ? secureCart.totalItems : guestCart.getTotalItems();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Flutterwave inline payment hook
  const { initializePayment, isLoading: isPaymentLoading, error: paymentError } = useFlutterwaveInline({
    onSuccess: (response) => {
      console.log('Payment successful:', response);
      // Handle successful payment
      if (response.status === 'successful') {
        router.push(`/order-confirmation/${response.meta?.order_id || 'success'}`);
      }
    },
    onClose: () => {
      console.log('Payment modal closed');
      // User closed the payment modal
    },
    onError: (error) => {
      console.error('Payment error:', error);
      setCheckoutError('Payment failed. Please try again.');
    }
  });

  // No automatic redirect - allow both guest and authenticated checkout

  // Redirect to cart if no items
  useEffect(() => {
    if (!isLoading && cartItems && cartItems.length === 0) {
      router.push(session ? '/cart/secure' : '/cart-new');
      return;
    }
  }, [cartItems, isLoading, session, router]);

  const handleCheckoutComplete = async (orderData: any) => {
    try {
      setIsProcessing(true);
      setCheckoutError(null);
      
      console.log('Checkout completed:', orderData);
      
      if (orderData.success && orderData.order) {
        const orderId = orderData.order.id || orderData.order.order_number;
        console.log('Order ID for redirect:', orderId);
        
        if (!orderId) {
          throw new Error('Order ID not found in response');
        }
        
        // Handle different payment methods
        if (orderData.paymentMethod === 'flutterwave' && orderData.inlinePaymentData) {
          // Use inline payment for Flutterwave
          await handleInlinePayment(orderData);
        } else if (orderData.paymentMethod === 'bank_transfer') {
          // Redirect to bank transfer instructions
          router.push(`/order-confirmation/${orderId}?payment=bank_transfer`);
        } else {
          // Direct redirect to order confirmation
          router.push(`/order-confirmation/${orderId}`);
        }
      } else {
        throw new Error(orderData.error || 'Checkout failed');
      }
    } catch (error) {
      console.error('Checkout completion error:', error);
      setCheckoutError(error instanceof Error ? error.message : 'An error occurred during checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInlinePayment = async (orderData: any) => {
    try {
      // Extract payment data from order
      const paymentData = {
        amount: orderData.order.total_amount,
        currency: 'NGN',
        email: session?.user?.email || '',
        phone_number: orderData.order.shipping_address?.phone || '',
        tx_ref: orderData.order.order_number,
        customizations: {
          title: 'ReadnWin Payment',
          description: `Payment for order ${orderData.order.order_number}`,
          logo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.png`,
        },
        meta: {
          order_id: orderData.order.id,
          user_id: session?.user?.id,
          order_number: orderData.order.order_number,
        }
      };

      // Initialize inline payment
      await initializePayment(paymentData);
    } catch (error) {
      console.error('Inline payment error:', error);
      setCheckoutError('Failed to initialize payment. Please try again.');
    }
  };

  const handleCancel = () => {
    router.push(session ? '/cart/secure' : '/cart-new');
  };

  // Loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg text-gray-600">Loading checkout...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-alert-line text-white text-2xl"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Please sign in to continue with your purchase and access secure checkout.</p>
          <button
            onClick={() => router.push('/login?redirect=/checkout')}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <i className="ri-login-box-line"></i>
            <span>Sign In</span>
          </button>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-shopping-cart-line text-white text-3xl"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Discover amazing books and add them to your cart before proceeding to checkout.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/books')}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <i className="ri-book-line"></i>
              <span>Browse Books</span>
            </button>
            <button
              onClick={() => router.push(session ? '/cart/secure' : '/cart-new')}
              className="btn-secondary inline-flex items-center space-x-2"
            >
              <i className="ri-shopping-cart-line"></i>
              <span>View Cart</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Cart error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-alert-line text-white text-2xl"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Cart Error</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">{error}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <i className="ri-refresh-line"></i>
              <span>Retry</span>
            </button>
            <button
              onClick={() => router.push(session ? '/cart/secure' : '/cart-new')}
              className="btn-secondary inline-flex items-center space-x-2"
            >
              <i className="ri-arrow-left-line"></i>
              <span>Back to Cart</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Processing/Redirecting state
  if (isProcessing || isRedirecting) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="card p-8 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-loader-4-line text-white text-2xl animate-spin"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {isRedirecting ? 'Redirecting to Payment...' : 'Processing Your Order...'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isRedirecting 
                ? 'Please wait while we redirect you to complete your payment.'
                : 'Please wait while we process your order. This may take a few moments.'
              }
            </p>
            {isRedirecting && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <i className="ri-shield-check-line text-blue-600 mr-2"></i>
                  <span className="font-medium text-blue-800">Secure Payment</span>
                </div>
                <p className="text-sm text-blue-700">
                  You will be redirected to our secure payment partner to complete your transaction.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main checkout interface
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Checkout Error */}
        {checkoutError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <i className="ri-alert-line text-red-600 text-xl mr-3"></i>
              <div className="flex-1">
                <h4 className="text-red-800 font-medium">Checkout Error</h4>
                <p className="text-red-700 text-sm mt-1">{checkoutError}</p>
              </div>
              <button
                onClick={() => setCheckoutError(null)}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
          </div>
        )}

        {/* Back to Cart */}
        <div className="mb-6">
          <button
            onClick={() => router.push(session ? '/cart/secure' : '/cart-new')}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            Back to Cart ({getTotalItems()} items)
          </button>
        </div>

        {/* Secure Checkout Indicator */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <i className="ri-shield-check-line text-green-600 text-xl mr-3"></i>
            <div>
              <h4 className="text-green-800 font-medium">Secure Checkout</h4>
              <p className="text-green-700 text-sm mt-1">
                Your payment information is encrypted and secure. We never store your payment details.
              </p>
            </div>
          </div>
        </div>

        {/* Main Checkout Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 relative z-10">
            <NewCheckoutFlow
              cartItems={cartItems || []}
              onComplete={handleCheckoutComplete}
              onCancel={handleCancel}
            />
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="lg:sticky lg:top-8">
              <OrderSummarySidebar cartItems={cartItems || []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Order Summary Sidebar Component
function OrderSummarySidebar({ cartItems }: { cartItems: any[] }) {
  // Calculate cart analytics
  const ebooks = cartItems.filter(item => 
    item.book?.format === 'ebook' || item.book?.format === 'both'
  );
  const physicalBooks = cartItems.filter(item => 
    item.book?.format === 'physical' || item.book?.format === 'both'
  );

  const isEbookOnly = ebooks.length > 0 && physicalBooks.length === 0;
  const subtotal = cartItems.reduce((sum, item) => {
    const price = parseFloat(item.book?.price || 0);
    const quantity = parseInt(item.quantity || 0);
    return sum + (price * quantity);
  }, 0);
  
  // Use the same shipping calculation logic as the backend
  const shipping = isEbookOnly ? 0 : 3000; // ₦3,000 base cost for Express Shipping
  const tax = Math.round(subtotal * 0.075); // 7.5% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="card p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span>Subtotal ({cartItems.length} items)</span>
          <span>₦{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{isEbookOnly ? 'Free' : `₦${shipping.toLocaleString()}`}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax (7.5%)</span>
          <span>₦{tax.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>₦{total.toLocaleString()}</span>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mt-2">
        {isEbookOnly ? 'Ebook orders ship instantly via email' : 'Physical books ship within 2-3 business days'}
      </p>
    </div>
  );
} 