'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { sanitizeForXSS } from '@/utils/security';
import { useToast } from '@/components/ui/Toast';
import { ShoppingBag, Download, Package, AlertCircle, Lock, User, Mail } from 'lucide-react';
import { useUnifiedCart } from '@/contexts/UnifiedCartContext';
import Header from '@/components/Header';
import SafeImage from '@/components/ui/SafeImage';

interface CheckoutStep {
  id: number;
  title: string;
  description: string;
  required: boolean;
}



export default function GuestCheckoutEnhanced() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const {
    cartItems,
    isLoading: cartLoading,
    error: cartError,
    getSubtotal,
    getTotalItems,
    updateQuantity,
    removeFromCart
  } = useUnifiedCart();
  
  const isEbookOnly = () => cartItems.every(item => item.book?.format === 'ebook');
  const isPhysicalOnly = () => cartItems.every(item => item.book?.format === 'physical');
  const getTotalSavings = () => 0;
  
  const [currentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  






  // Simplified checkout steps - only account required
  const getCheckoutSteps = (): CheckoutStep[] => {
    return [{
      id: 1,
      title: 'Account & Payment',
      description: 'Sign up or sign in to complete purchase',
      required: true
    }];
  };

  const steps = getCheckoutSteps();

  // Redirect authenticated users to regular checkout
  useEffect(() => {
    if (status === 'loading') return;

    if (session) {
      router.push('/checkout');
      return;
    }

    if (cartItems.length === 0 && !cartLoading) {
      router.push('/cart');
      return;
    }
  }, [session, status, router, cartItems, cartLoading, transferCartToUser]);



  const handleContinueToAuth = () => {
    router.push('/login?redirect=/checkout');
  };

  const handleSignUp = () => {
    router.push('/register?redirect=/checkout');
  };



  if (status === 'loading' || cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800">{cartError}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (session) {
    return null; // Will redirect to regular checkout
  }

  // Immediate check for empty cart to prevent form flash
  if (cartItems.length === 0 && !cartLoading) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {steps.map((stepData, index) => (
              <div key={stepData.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= stepData.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > stepData.id ? <Check className="w-4 h-4" /> : stepData.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > stepData.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 space-x-12">
            {steps.map((stepData) => (
              <span key={stepData.id} className={`text-sm ${currentStep >= stepData.id ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                {stepData.title}
              </span>
            ))}
          </div>
        </div>

        {/* Cart Type Indicator */}
        {cartItems.length > 0 && (
          <div className="mb-6 p-4 rounded-lg border bg-blue-50 border-blue-200">
            <div className="flex items-center">
              {isEbookOnly() ? (
                <Download className="h-5 w-5 text-green-600 mr-2" />
              ) : isPhysicalOnly() ? (
                <Package className="h-5 w-5 text-blue-600 mr-2" />
              ) : (
                <ShoppingBag className="h-5 w-5 text-purple-600 mr-2" />
              )}
              <div>
                <h3 className="font-medium text-blue-600">
                  {isEbookOnly() ? 'Digital Books Only' : isPhysicalOnly() ? 'Physical Books Only' : 'Mixed Cart'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isEbookOnly() 
                    ? 'Your cart contains only digital books. No shipping required!' 
                    : isPhysicalOnly() 
                    ? 'Your cart contains physical books. Please provide shipping details.'
                    : 'Your cart contains both digital and physical books.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Steps */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Account Required */}
              {
                <div className="space-y-6">
                  <div className="text-center">
                    <Lock className="mx-auto h-16 w-16 text-blue-600 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Required</h2>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      To complete your purchase and access your digital books, you need to create an account or sign in to your existing account.
                    </p>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Sign Up Option */}
                    <div className="bg-white border-2 border-blue-200 rounded-lg p-6 text-center hover:border-blue-300 transition-colors">
                      <User className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Account</h3>
                      <p className="text-gray-600 mb-4">
                        Sign up for a new account to complete your purchase and access your digital library.
                      </p>
                      <button
                        onClick={handleSignUp}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        Sign Up
                      </button>
                    </div>

                    {/* Sign In Option */}
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center hover:border-gray-300 transition-colors">
                      <Mail className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign In</h3>
                      <p className="text-gray-600 mb-4">
                        Already have an account? Sign in to complete your purchase.
                      </p>
                      <button
                        onClick={handleContinueToAuth}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        Sign In
                      </button>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-500">
                      Your cart items will be saved and transferred to your account.
                    </p>
                  </div>
                </div>
              }
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
                <button
                  onClick={() => router.push('/cart')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Edit Cart
                </button>
              </div>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-2 border border-gray-100 rounded">
                    <SafeImage
                      src={item.book?.cover_image_url ? `/api/images/covers/${item.book.cover_image_url.split('/').pop()}` : null}
                      alt={item.book?.title || 'Book cover'}
                      bookTitle={item.book?.title}
                      width={48}
                      height={64}
                      className="w-12 h-16 object-cover rounded"
                      fallbackSrc="/placeholder-book.jpg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.book?.title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <button
                          onClick={() => updateQuantity(item.book_id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.book_id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.book_id)}
                          className="ml-2 text-red-500 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ₦{((item.book?.price || 0) * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>



              {/* Order Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">₦{getSubtotal().toLocaleString()}</span>
                </div>
                {getTotalSavings() > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Savings</span>
                    <span className="text-green-600">-₦{getTotalSavings().toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">₦{getSubtotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Guest Notice */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-800">
                    Guest checkout - account required to complete purchase
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ToastContainer />
    </div>
  );
} 