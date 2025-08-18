'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
// Remix Icons are already available globally

interface Order {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  item_count: number;
  shipping_address?: any;
  tracking_number?: string;
}

export default function CustomerOrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    fetchOrders();
  }, [session]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <i className="ri-error-warning-line w-5 h-5 text-yellow-500" />;
      case 'payment_processing':
        return <i className="ri-error-warning-line w-5 h-5 text-blue-500" />;
      case 'paid':
        return <i className="ri-check-line w-5 h-5 text-green-500" />;
      case 'processing':
        return <i className="ri-box-line w-5 h-5 text-purple-500" />;
      case 'shipped':
        return <i className="ri-truck-line w-5 h-5 text-indigo-500" />;
      case 'delivered':
        return <i className="ri-check-line w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <i className="ri-error-warning-line w-5 h-5 text-red-500" />;
      case 'refunded':
        return <i className="ri-error-warning-line w-5 h-5 text-gray-500" />;
      default:
        return <i className="ri-error-warning-line w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'payment_processing':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600">View and track your order history</p>
        </div>

        {/* Orders */}
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <i className="ri-box-line w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
              <button
                onClick={() => router.push('/books')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Books
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Order #{order.order_number}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>Placed on {formatDate(order.created_at)}</span>
                        <span className="text-gray-400">•</span>
                        <span>{formatTime(order.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(order.total_amount)}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Items</p>
                    <p className="text-sm text-gray-600">{order.item_count} items</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Order Time</p>
                    <p className="text-sm text-gray-600">{formatTime(order.created_at)}</p>
                  </div>
                  {order.tracking_number && (
                    <div>
                      <p className="text-sm font-medium text-gray-900">Tracking</p>
                      <p className="text-sm text-gray-600">{order.tracking_number}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">Status</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {order.status.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/order/${order.id}/confirmation`)}
                      className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      <i className="ri-eye-line w-4 h-4 mr-1" />
                      View Details
                    </button>
                    <button
                      onClick={() => router.push(`/order/${order.id}/tracking`)}
                      className="flex items-center px-3 py-2 text-sm font-medium text-green-600 hover:text-green-700"
                    >
                      <i className="ri-truck-line w-4 h-4 mr-1" />
                      Track Order
                    </button>
                  </div>
                  
                  {order.status === 'delivered' && (
                    <button
                      onClick={() => router.push(`/books`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Order Again
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 