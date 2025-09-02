'use client';

import { useGuestCart } from '@/contexts/GuestCartContext';
import Header from '@/components/Header';
import Link from 'next/link';

export default function CartPage() {
  const { cartItems, getTotalItems, removeFromCart, clearCart } = useGuestCart();

  const total = cartItems.reduce((sum, item) => sum + ((item.book?.price || 0) * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart ({getTotalItems()} items)</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <Link href="/books" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Browse Books
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{item.book?.title || 'Unknown Title'}</h3>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                  <p className="text-blue-600 font-medium">₦{(item.book?.price || 0).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => removeFromCart(item.book_id)}
                  className="text-red-600 hover:text-red-800 px-3 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-bold">Total: ₦{total.toLocaleString()}</span>
                <button 
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-800"
                >
                  Clear Cart
                </button>
              </div>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}