'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingBag, Download, Package, AlertCircle, User, LogIn } from 'lucide-react';
import { useGuestCart } from '@/contexts/GuestCartContext';
import Header from '@/components/Header';
import './cart-mobile.css';

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Use GuestCartContext which handles both guest and authenticated users
  const {
    cartItems,
    isLoading,
    error,
    analytics,
    updateQuantity,
    removeFromCart,
    isEbookOnly,
    isPhysicalOnly,
    isMixedCart,
    getSubtotal,
    getTotalSavings,
    getTotalItems
  } = useGuestCart();

  const handleUpdateQuantity = async (bookId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateQuantity(bookId, newQuantity);
  };

  const handleRemoveItem = async (bookId: number) => {
    await removeFromCart(bookId);
  };

  const handleCheckout = async () => {
    // Check if cart has items
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items before proceeding to checkout.');
      return;
    }

    // For guest users, redirect to login/signup
    if (!session) {
      // Store current path to redirect back after login
      localStorage.setItem('redirectAfterLogin', '/checkout-new');
      router.push('/login?redirect=/checkout-new');
      return;
    }

    // For authenticated users, redirect to checkout-new
    router.push('/checkout-new');
  };

  const handleGuestLogin = () => {
    localStorage.setItem('redirectAfterLogin', '/checkout-new');
    router.push('/login?redirect=/checkout-new');
  };

  const handleGuestSignup = () => {
    localStorage.setItem('redirectAfterLogin', '/checkout-new');
    router.push('/register?redirect=/checkout-new');
  };

  // Get cart type message
  const cartTypeInfo = useMemo(() => {
    if (cartItems.length === 0) {
      return {
        title: "Empty Cart",
        message: "Your cart is empty. Add some books to get started!",
        icon: ShoppingBag,
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200"
      };
    } else if (isEbookOnly()) {
      return {
        title: "Digital Books Only",
        message: "Your cart contains only digital books. No shipping required!",
        icon: Download,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
      };
    } else if (isPhysicalOnly()) {
      return {
        title: "Physical Books Only",
        message: "Your cart contains only physical books. Shipping address required.",
        icon: Package,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200"
      };
    } else {
      return {
        title: "Mixed Cart",
        message: "Your cart contains both digital and physical books.",
        icon: ShoppingBag,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200"
      };
    }
  }, [cartItems.length, isEbookOnly, isPhysicalOnly]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex space-x-4">
                    <div className="w-20 h-24 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 cart-container">
      <Header />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        {/* Guest User Login/Signup Prompt */}
        {!session && cartItems.length > 0 && (
          <div className="mb-4 sm:mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start">
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 mb-2 sm:mb-0 sm:mr-3 sm:mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-medium text-yellow-900 mb-2">
                  Sign in to Continue
                </h3>
                <p className="text-sm sm:text-base text-yellow-800 mb-3 sm:mb-4">
                  To proceed with checkout and manage your orders, please sign in to your account or create a new one.
                </p>
                <div className="flex flex-col gap-2 sm:gap-3">
                  <button
                    onClick={handleGuestLogin}
                    className="inline-flex items-center justify-center px-4 py-2.5 sm:py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </button>
                  <button
                    onClick={handleGuestSignup}
                    className="inline-flex items-center justify-center px-4 py-2.5 sm:py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Create Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cart Type Info - Only show when cart has items */}
        {cartItems.length > 0 && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border ${cartTypeInfo.bgColor} ${cartTypeInfo.borderColor}`}>
            <div className="flex items-start sm:items-center">
              <cartTypeInfo.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${cartTypeInfo.color} mr-2 sm:mr-3 mt-0.5 sm:mt-0 flex-shrink-0`} />
              <div className="min-w-0">
                <h3 className={`text-sm sm:text-base font-medium ${cartTypeInfo.color}`}>{cartTypeInfo.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{cartTypeInfo.message}</p>
              </div>
            </div>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <ShoppingBag className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            <h3 className="mt-2 text-base sm:text-lg font-medium text-gray-900">Your cart is empty</h3>
            <p className="mt-1 text-sm text-gray-500">Start shopping to add items to your cart.</p>
            <div className="mt-4 sm:mt-6">
              <Link
                href="/books"
                className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 w-full sm:w-auto justify-center"
              >
                Browse Books
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Cart Items</h2>
                  <div className="space-y-3 sm:space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 border border-gray-200 rounded-lg">
                        {/* Mobile Layout: Book Cover and Details */}
                        <div className="flex items-start space-x-3 sm:space-x-4">
                          {/* Book Cover */}
                          <div className="flex-shrink-0">
                            <img
                              src={item.book?.cover_image_url?.startsWith('/api/images/secure/') 
                                ? item.book.cover_image_url 
                                : item.book?.cover_image_url?.startsWith('/api/images/covers/') 
                                  ? item.book.cover_image_url 
                                  : `/api/images/covers/${item.book?.cover_image_url?.split('/').pop() || 'placeholder.jpg'}`}
                              alt={item.book?.title}
                              className="w-12 h-16 sm:w-16 sm:h-20 cart-item-image rounded"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-book.jpg';
                              }}
                            />
                          </div>

                          {/* Book Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-medium text-gray-900 line-clamp-2">
                              {item.book?.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                              by {item.book?.author_name}
                            </p>
                            <div className="flex items-center mt-1 sm:mt-2">
                              <span className={`inline-flex items-center px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                                item.book?.format === 'ebook' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {item.book?.format === 'ebook' ? (
                                  <>
                                    <Download className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                    Digital
                                  </>
                                ) : (
                                  <>
                                    <Package className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                    Physical
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Mobile Layout: Price, Quantity, and Actions */}
                        <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                          {/* Price */}
                          <div className="text-left sm:text-right cart-price">
                            <p className="text-sm sm:text-base font-medium text-gray-900">
                              ₦{(item.book?.price || 0).toLocaleString()}
                            </p>
                            {item.book?.original_price && item.book.original_price > (item.book?.price || 0) && (
                              <p className="text-xs sm:text-sm text-gray-500 line-through">
                                ₦{item.book.original_price.toLocaleString()}
                              </p>
                            )}
                          </div>

                          {/* Quantity Controls and Remove Button */}
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-1 sm:space-x-2 bg-gray-50 rounded-lg p-1">
                              <button
                                onClick={() => handleUpdateQuantity(item.book_id, item.quantity - 1)}
                                className="p-1 sm:p-1.5 rounded-md hover:bg-gray-200 transition-colors cart-quantity-control"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                              </button>
                              <span className="text-sm font-medium text-gray-900 w-6 sm:w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleUpdateQuantity(item.book_id, item.quantity + 1)}
                                className="p-1 sm:p-1.5 rounded-md hover:bg-gray-200 transition-colors cart-quantity-control"
                                disabled={item.book?.format === 'physical' && (item.book?.stock_quantity || 0) <= item.quantity}
                              >
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => handleRemoveItem(item.book_id)}
                              className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cart-button"
                            >
                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:sticky lg:top-8">
                <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Order Summary</h2>
                
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({getTotalItems()} items)</span>
                    <span className="font-medium">₦{getSubtotal().toLocaleString()}</span>
                  </div>
                  
                  {getTotalSavings() > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Savings</span>
                      <span className="font-medium text-green-600">-₦{getTotalSavings().toLocaleString()}</span>
                    </div>
                  )}

                  {!isEbookOnly() && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-xs sm:text-sm">
                        {session ? 'Calculated at checkout' : 'Sign in to calculate'}
                      </span>
                    </div>
                  )}

                  <div className="border-t pt-2 sm:pt-3">
                    <div className="flex justify-between text-sm sm:text-base font-medium">
                      <span>Total</span>
                      <span>₦{getSubtotal().toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {isEbookOnly() 
                        ? 'No shipping required' 
                        : session 
                          ? 'Shipping calculated at checkout'
                          : 'Sign in to see final total'
                      }
                    </p>
                  </div>
                </div>

                {session ? (
                  <button
                    onClick={handleCheckout}
                    disabled={cartItems.length === 0}
                    className="w-full mt-4 sm:mt-6 bg-blue-600 text-white py-3 px-4 rounded-md text-sm sm:text-base font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                ) : (
                  <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                    <button
                      onClick={handleGuestLogin}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-md text-sm sm:text-base font-medium hover:bg-blue-700 transition-colors"
                    >
                      Sign In to Checkout
                    </button>
                    <button
                      onClick={handleGuestSignup}
                      className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-md text-sm sm:text-base font-medium hover:bg-gray-200 transition-colors"
                    >
                      Create Account
                    </button>
                  </div>
                )}

                <div className="mt-3 sm:mt-4 text-center">
                  <Link
                    href="/books"
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 