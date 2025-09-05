'use client';

import { useUnifiedCart } from '@/contexts/UnifiedCartContext';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import SafeImage from '@/components/ui/SafeImage';

export default function CartPage() {
  const { data: session } = useSession();
  const {
    cartItems,
    isLoading,
    error,
    updateQuantity,
    removeFromCart,
    clearCart,
    getSubtotal,
    getTotalItems
  } = useUnifiedCart();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <i className="ri-shopping-cart-line text-6xl text-gray-400 mb-4"></i>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some books to get started!</p>
            <Link
              href="/books"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Books
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Shopping Cart ({getTotalItems()} items)
          </h1>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Clear Cart
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm">
          <div className="divide-y divide-gray-200">
            {cartItems.map((item) => (
              <div key={item.id} className="p-6 flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <SafeImage
                    src={item.book?.cover_image_url}
                    alt={item.book?.title || 'Book cover'}
                    width={80}
                    height={120}
                    className="rounded-lg"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {item.book?.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    by {item.book?.author_name}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {item.book?.format} • {item.book?.category_name}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.book_id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      <i className="ri-subtract-line text-sm"></i>
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.book_id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                    >
                      <i className="ri-add-line text-sm"></i>
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      ₦{((item.book?.price || 0) * item.quantity).toLocaleString()}
                    </p>
                    {item.book?.original_price && item.book.original_price > (item.book.price || 0) && (
                      <p className="text-sm text-gray-500 line-through">
                        ₦{(item.book.original_price * item.quantity).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => removeFromCart(item.book_id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    <i className="ri-delete-bin-line text-lg"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 p-6">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total: ₦{getSubtotal().toLocaleString()}</span>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <Link
                href="/books"
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg text-center hover:bg-gray-200 transition-colors"
              >
                Continue Shopping
              </Link>
              <Link
                href="/checkout"
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg text-center hover:bg-blue-700 transition-colors"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}