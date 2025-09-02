'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CheckCircle, AlertCircle, CreditCard, Banknote, Globe } from 'lucide-react';
import { useGuestCart } from '@/contexts/GuestCartContext';
import { useFlutterwaveInline } from '@/hooks/useFlutterwaveInline';
import Header from '@/components/Header';
import CheckoutFlow from '@/components/checkout/CheckoutFlow';
import OrderSummary from '@/components/checkout/OrderSummary';

interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  deliveryTime: string;
  description: string;
}

interface CheckoutStep {
  id: number;
  title: string;
  description: string;
  required: boolean;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Use GuestCartContext which handles both guest and authenticated users
  const {
    cartItems,
    isLoading: cartLoading,
    isEbookOnly,
    isPhysicalOnly,
    isMixedCart,
    analytics
  } = useGuestCart();
  
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutSummary, setCheckoutSummary] = useState<{
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  } | null>(null);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);

  // Flutterwave inline payment hook
  const { initializePayment } = useFlutterwaveInline({
    onSuccess: (response) => {
      console.log('Payment successful:', response);
      if (response.status === 'successful') {
        router.push(`/order-confirmation/${response.meta?.order_id || 'success'}`);
      }
    },
    onClose: () => {
      console.log('Payment modal closed');
    },
    onError: (error) => {
      console.error('Payment error:', error);
    }
  });

  // Load checkout data
  useEffect(() => {
    if (cartItems.length > 0 && !cartLoading) {
      // Add a small delay to ensure cart transfer is complete
      const timer = setTimeout(() => {
        loadCheckoutData();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [cartItems, cartLoading]);

  // Add beforeunload event listener to warn users when leaving with unsaved data
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasCheckoutData = localStorage.getItem('checkout-form-data');
      if (hasCheckoutData) {
        e.preventDefault();
        e.returnValue = 'You have unsaved checkout data. Are you sure you want to leave?';
        return 'You have unsaved checkout data. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const loadCheckoutData = async () => {
    try {
      // Load shipping methods
      const shippingResponse = await fetch('/api/shipping-methods');
      if (shippingResponse.ok) {
        const shippingData = await shippingResponse.json();
        setShippingMethods(shippingData.methods || []);
      }

      // Load checkout summary
      const summaryResponse = await fetch('/api/checkout-new');
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setCheckoutSummary(summaryData.summary);
      }
    } catch (error) {
      console.error('Error loading checkout data:', error);
    }
  };

  // Redirect to cart if no items
  useEffect(() => {
    if (status === 'loading') return;

    if (cartItems.length === 0) {
      router.push('/cart-new');
      return;
    }
  }, [status, router, cartItems]);

  const handleCheckoutComplete = async (orderData: {
    formData: Record<string, unknown>;
    total: number;
  }) => {
    try {
      setIsLoading(true);
      
      // Create order
      const orderResponse = await fetch('/api/checkout-new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: orderData.formData,
          cartItems,
          total: orderData.total
        }),
      });

      if (orderResponse.ok) {
        const result = await orderResponse.json();
        
        // Clear checkout data from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('checkout-form-data');
          localStorage.removeItem('checkout-current-step');
        }
        
        // Handle different payment methods
        if (result.paymentMethod === 'flutterwave' && result.inlinePaymentData) {
          // Use inline payment for Flutterwave
          await handleInlinePayment(result);
        } else if (result.paymentMethod === 'bank_transfer') {
          // Redirect to bank transfer instructions
          router.push(`/order-confirmation/${result.order.id}?payment=bank_transfer`);
        } else {
          // Direct redirect to order confirmation
          router.push(`/order-confirmation/${result.order.id}`);
        }
      } else {
        const error = await orderResponse.json();
        console.error('Order creation failed:', error);
        // Handle error - show error message to user
        // Don't clear checkout data on error - let user retry
      }
    } catch (error) {
      console.error('Error completing checkout:', error);
      // Handle error - show error message to user
      // Don't clear checkout data on error - let user retry
    } finally {
      setIsLoading(false);
    }
  };

  const handleInlinePayment = async (result: {
    order: {
      id: number;
      order_number: string;
      total_amount: number;
      shipping_address?: { phone?: string };
    };
  }) => {
    try {
      // Extract payment data from result
      const paymentData = {
        amount: result.order.total_amount,
        currency: 'NGN',
        email: session?.user?.email || '',
        phone_number: result.order.shipping_address?.phone || '',
        tx_ref: result.order.order_number,
        customizations: {
          title: 'ReadnWin Payment',
          description: `Payment for order ${result.order.order_number}`,
          logo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.png`,
        },
        meta: {
          order_id: result.order.id,
          user_id: session?.user?.id,
          order_number: result.order.order_number,
        }
      };

      // Initialize inline payment
      await initializePayment(paymentData);
    } catch (error) {
      console.error('Inline payment error:', error);
    }
  };

  const handleBackToCart = () => {
    // Clear checkout data when user goes back to cart
    if (typeof window !== 'undefined') {
      localStorage.removeItem('checkout-form-data');
      localStorage.removeItem('checkout-current-step');
    }
    router.push('/cart-new');
  };

  if (status === 'loading' || cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return null; // Will redirect to cart
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your purchase</p>
        </div>

        {/* Cart Type Indicator */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isEbookOnly() 
                    ? 'bg-green-100 text-green-600' 
                    : isPhysicalOnly() 
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-purple-100 text-purple-600'
                }`}>
                  {isEbookOnly() ? (
                    <Globe className="w-5 h-5" />
                  ) : isPhysicalOnly() ? (
                    <CreditCard className="w-5 h-5" />
                  ) : (
                    <Banknote className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {isEbookOnly() ? 'Digital Books Only' :
                     isPhysicalOnly() ? 'Physical Books Only' :
                     'Mixed Cart'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  ₦{analytics.totalValue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Total Value
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Checkout Flow */}
        <CheckoutFlow
          cartItems={cartItems}
          isEbookOnly={isEbookOnly}
          isPhysicalOnly={isPhysicalOnly}
          isMixedCart={isMixedCart}
          analytics={analytics}
          onComplete={handleCheckoutComplete}
          onBack={handleBackToCart}
        />
      </div>
    </div>
  );
} 