'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContextNew';
import { useFlutterwaveInline } from '@/hooks/useFlutterwaveInline';
import Header from '@/components/Header';
import NewCheckoutFlow from '@/components/checkout/NewCheckoutFlow';

export default function EnhancedCheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cartItems, isLoading, error, getTotalItems } = useCart();
  
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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      // Store current path to redirect back after login
      localStorage.setItem('redirectAfterLogin', '/checkout-enhanced');
      router.push('/login?redirect=/checkout-enhanced');
      return;
    }
  }, [session, status, router]);

  // Redirect to cart if no items
  useEffect(() => {
    if (!isLoading && cartItems.length === 0 && session) {
      router.push('/cart-new');
      return;
    }
  }, [cartItems, isLoading, session, router]);

  const handleCheckoutComplete = async (orderData: any) => {
    try {
      setIsProcessing(true);
      setCheckoutError(null);
      
      console.log('Checkout completed:', orderData);
      
      if (orderData.success && orderData.order) {
        // Handle different payment methods
        if (orderData.payment?.payment_url && orderData.order.payment_method === 'flutterwave') {
          // Use inline payment for Flutterwave
          await handleInlinePayment(orderData);
        } else if (orderData.order.payment_method === 'bank_transfer') {
          // Redirect to bank transfer instructions
          router.push(`/order-confirmation/${orderData.order.id}?payment=bank_transfer`);
        } else {
          // Direct redirect to order confirmation
          router.push(`/order-confirmation/${orderData.order.id}`);
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
    router.push('/cart-new');
  };

  // Loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16">
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
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to continue with your purchase.</p>
          <button
            onClick={() => router.push('/login?redirect=/checkout-enhanced')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Add some books to your cart before proceeding to checkout.</p>
          <button
            onClick={() => router.push('/books')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mr-3"
          >
            Browse Books
          </button>
          <button
            onClick={() => router.push('/cart-new')}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            View Cart
          </button>
        </div>
      </div>
    );
  }

  // Cart error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cart Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mr-3"
          >
            Retry
          </button>
          <button
            onClick={() => router.push('/cart-new')}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  // Processing/Redirecting state
  if (isProcessing || isRedirecting) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isRedirecting ? 'Redirecting to Payment...' : 'Processing Your Order...'}
            </h3>
            <p className="text-gray-600">
              {isRedirecting 
                ? 'Please wait while we redirect you to complete your payment.'
                : 'Please wait while we process your order. This may take a few moments.'
              }
            </p>
            {isRedirecting && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> You will be redirected to our secure payment partner to complete your transaction.
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
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Checkout Error */}
        {checkoutError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <div>
                <h4 className="text-red-800 font-medium">Checkout Error</h4>
                <p className="text-red-700 text-sm mt-1">{checkoutError}</p>
              </div>
            </div>
            <button
              onClick={() => setCheckoutError(null)}
              className="mt-3 text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Back to Cart */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/cart-new')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart ({getTotalItems()} items)
          </button>
        </div>

        {/* Secure Checkout Indicator */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <h4 className="text-green-800 font-medium">Secure Checkout</h4>
              <p className="text-green-700 text-sm">
                Your payment information is encrypted and secure. We never store your payment details.
              </p>
            </div>
          </div>
        </div>

        {/* Main Checkout Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <NewCheckoutFlow
              cartItems={cartItems}
              onComplete={handleCheckoutComplete}
              onCancel={handleCancel}
            />
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <OrderSummarySidebar cartItems={cartItems} />
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
  const subtotal = cartItems.reduce((sum, item) => sum + ((item.book?.price || 0) * item.quantity), 0);
  
  // Use the same shipping calculation logic as the backend
  // Default to Express Shipping (ID 2) if no method selected, matching backend behavior
  const shipping = isEbookOnly ? 0 : 3000; // ₦3,000 base cost for Express Shipping
  const tax = Math.round(subtotal * 0.075); // 7.5% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
      
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