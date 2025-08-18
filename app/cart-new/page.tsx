'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingBag, Download, Package, AlertCircle, User, LogIn } from 'lucide-react';
import { useCart } from '@/contexts/CartContextNew';
import { useGuestCart } from '@/contexts/GuestCartContext';
import Header from '@/components/Header';

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Use appropriate cart context based on authentication status
  const { 
    cartItems: authCartItems, 
    isLoading: authIsLoading, 
    error: authError,
    analytics: authAnalytics,
    updateQuantity: authUpdateQuantity, 
    removeFromCart: authRemoveFromCart,
    isEbookOnly: authIsEbookOnly,
    isPhysicalOnly: authIsPhysicalOnly,
    isMixedCart: authIsMixedCart,
    getSubtotal: authGetSubtotal,
    getTotalSavings: authGetTotalSavings,
    getTotalItems: authGetTotalItems
  } = useCart();

  const {
    cartItems: guestCartItems,
    isLoading: guestIsLoading,
    error: guestError,
    analytics: guestAnalytics,
    updateQuantity: guestUpdateQuantity,
    removeFromCart: guestRemoveFromCart,
    isEbookOnly: guestIsEbookOnly,
    isPhysicalOnly: guestIsPhysicalOnly,
    isMixedCart: guestIsMixedCart,
    getSubtotal: guestGetSubtotal,
    getTotalSavings: guestGetTotalSavings,
    getTotalItems: guestGetTotalItems
  } = useGuestCart();

  // Use appropriate cart data based on session status
  const cartItems = session ? authCartItems : guestCartItems;
  const isLoading = session ? authIsLoading : guestIsLoading;
  const error = session ? authError : guestError;
  const analytics = session ? authAnalytics : guestAnalytics;
  const updateQuantity = session ? authUpdateQuantity : guestUpdateQuantity;
  const removeFromCart = session ? authRemoveFromCart : guestRemoveFromCart;
  const isEbookOnly = session ? authIsEbookOnly : guestIsEbookOnly;
  const isPhysicalOnly = session ? authIsPhysicalOnly : guestIsPhysicalOnly;
  const isMixedCart = session ? authIsMixedCart : guestIsMixedCart;
  const getSubtotal = session ? authGetSubtotal : guestGetSubtotal;
  const getTotalSavings = session ? authGetTotalSavings : guestGetTotalSavings;
  const getTotalItems = session ? authGetTotalItems : guestGetTotalItems;

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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        {/* Guest User Login/Signup Prompt */}
        {!session && cartItems.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start">
              <User className="h-6 w-6 text-yellow-600 mr-3 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-yellow-900 mb-2">
                  Sign in to Continue
                </h3>
                <p className="text-yellow-800 mb-4">
                  To proceed with checkout and manage your orders, please sign in to your account or create a new one.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleGuestLogin}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </button>
                  <button
                    onClick={handleGuestSignup}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className={`mb-6 p-4 rounded-lg border ${cartTypeInfo.bgColor} ${cartTypeInfo.borderColor}`}>
            <div className="flex items-center">
              <cartTypeInfo.icon className={`h-5 w-5 ${cartTypeInfo.color} mr-2`} />
              <div>
                <h3 className={`font-medium ${cartTypeInfo.color}`}>{cartTypeInfo.title}</h3>
                <p className="text-sm text-gray-600">{cartTypeInfo.message}</p>
              </div>
            </div>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
            <p className="mt-1 text-sm text-gray-500">Start shopping to add items to your cart.</p>
            <div className="mt-6">
              <Link
                href="/books"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Browse Books
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Cart Items</h2>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        {/* Book Cover */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.book?.cover_image_url || '/placeholder-book.png'}
                            alt={item.book?.title}
                            className="w-16 h-20 object-cover rounded"
                          />
                        </div>

                        {/* Book Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {item.book?.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            by {item.book?.author_name}
                          </p>
                          <div className="flex items-center mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              item.book?.format === 'ebook' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {item.book?.format === 'ebook' ? (
                                <>
                                  <Download className="h-3 w-3 mr-1" />
                                  Digital
                                </>
                              ) : (
                                <>
                                  <Package className="h-3 w-3 mr-1" />
                                  Physical
                                </>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ₦{(item.book?.price || 0).toLocaleString()}
                          </p>
                          {item.book?.original_price && item.book.original_price > (item.book?.price || 0) && (
                            <p className="text-sm text-gray-500 line-through">
                              ₦{item.book.original_price.toLocaleString()}
                            </p>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.book_id, item.quantity - 1)}
                            className="p-1 rounded-full hover:bg-gray-100"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4 text-gray-500" />
                          </button>
                          <span className="text-sm font-medium text-gray-900 w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.book_id, item.quantity + 1)}
                            className="p-1 rounded-full hover:bg-gray-100"
                            disabled={item.book?.format === 'physical' && (item.book?.stock_quantity || 0) <= item.quantity}
                          >
                            <Plus className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.book_id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                
                <div className="space-y-3">
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
                      <span className="font-medium">
                        {session ? 'Calculated at checkout' : 'Sign in to calculate'}
                      </span>
                    </div>
                  )}

                  <div className="border-t pt-3">
                    <div className="flex justify-between text-base font-medium">
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
                    className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                ) : (
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={handleGuestLogin}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
                    >
                      Sign In to Checkout
                    </button>
                    <button
                      onClick={handleGuestSignup}
                      className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-md font-medium hover:bg-gray-200 transition-colors"
                    >
                      Create Account
                    </button>
                  </div>
                )}

                <div className="mt-4 text-center">
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