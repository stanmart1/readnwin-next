'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSecureCart } from '@/contexts/SecureCartContext';
import Header from '@/components/Header';

export default function SecureCartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, summary, isLoading, error, updateQuantity, removeItem, isEmpty } = useSecureCart();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login?redirect=/cart/secure');
    }
  }, [session, status, router]);

  const handleUpdateQuantity = async (bookId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateQuantity(bookId, newQuantity);
  };

  const handleRemoveItem = async (bookId: number) => {
    await removeItem(bookId);
  };

  const handleCheckout = () => {
    if (isEmpty) {
      alert('Your cart is empty. Please add items before proceeding to checkout.');
      return;
    }
    router.push('/checkout');
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-6">
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

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-lock-line text-white text-2xl"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Please sign in to view your secure cart and manage your items.
          </p>
          <Link
            href="/login?redirect=/cart/secure"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <i className="ri-login-box-line"></i>
            <span>Sign In</span>
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <i className="ri-alert-line text-red-500 text-xl mr-3"></i>
              <div>
                <h3 className="text-red-800 font-medium">Cart Error</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
          <p className="text-gray-600 mt-2">
            {summary.totalItems} item{summary.totalItems !== 1 ? 's' : ''} in your secure cart
          </p>
        </div>

        {/* Cart Type Info */}
        {!isEmpty && (
          <div className={`mb-6 p-4 rounded-lg border ${
            summary.isEbookOnly 
              ? 'bg-green-50 border-green-200' 
              : summary.isPhysicalOnly 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-purple-50 border-purple-200'
          }`}>
            <div className="flex items-center">
              <i className={`${
                summary.isEbookOnly 
                  ? 'ri-download-line text-green-600' 
                  : summary.isPhysicalOnly 
                    ? 'ri-truck-line text-blue-600' 
                    : 'ri-shopping-bag-line text-purple-600'
              } text-xl mr-3`}></i>
              <div>
                <h3 className={`font-medium ${
                  summary.isEbookOnly 
                    ? 'text-green-800' 
                    : summary.isPhysicalOnly 
                      ? 'text-blue-800' 
                      : 'text-purple-800'
                }`}>
                  {summary.isEbookOnly 
                    ? 'Digital Books Only' 
                    : summary.isPhysicalOnly 
                      ? 'Physical Books Only' 
                      : 'Mixed Cart'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {summary.isEbookOnly 
                    ? 'No shipping required - instant delivery!' 
                    : summary.isPhysicalOnly 
                      ? 'Shipping address required for physical books' 
                      : 'Contains both digital and physical books'}
                </p>
              </div>
            </div>
          </div>
        )}

        {isEmpty ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-shopping-cart-line text-white text-3xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Discover amazing books and start building your digital library today.
            </p>
            <Link
              href="/books"
              className="btn-primary inline-flex items-center space-x-2"
            >
              <i className="ri-book-line"></i>
              <span>Browse Books</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Cart Items</h2>
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
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
                        <h3 className="font-semibold text-gray-900 line-clamp-2">
                          {item.book?.title}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          by {item.book?.author_name}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.book?.format === 'ebook' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            <i className={`${
                              item.book?.format === 'ebook' 
                                ? 'ri-download-line' 
                                : 'ri-truck-line'
                            } mr-1`}></i>
                            {item.book?.format === 'ebook' ? 'Digital' : 'Physical'}
                          </span>
                        </div>
                      </div>

                      {/* Price and Controls */}
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            ₦{item.price.toLocaleString()} each
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
                          <button
                            onClick={() => handleUpdateQuantity(item.book_id, item.quantity - 1)}
                            className="p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <i className="ri-subtract-line text-gray-500"></i>
                          </button>
                          <span className="font-medium text-gray-900 w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.book_id, item.quantity + 1)}
                            className="p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                          >
                            <i className="ri-add-line text-gray-500"></i>
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(item.book_id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({summary.totalItems} items)</span>
                    <span className="font-medium">₦{summary.totalValue.toLocaleString()}</span>
                  </div>
                  
                  {summary.totalSavings > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-600">Savings</span>
                      <span className="font-medium text-green-600">-₦{summary.totalSavings.toLocaleString()}</span>
                    </div>
                  )}

                  {!summary.isEbookOnly && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-sm text-gray-500">Calculated at checkout</span>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>₦{summary.totalValue.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {summary.isEbookOnly ? 'No shipping required' : 'Shipping calculated at checkout'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isEmpty}
                  className="w-full mt-6 btn-primary disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout
                </button>

                <div className="mt-4 text-center">
                  <Link
                    href="/books"
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
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