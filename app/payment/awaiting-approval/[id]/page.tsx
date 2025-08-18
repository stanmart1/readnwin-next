'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import { Clock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

interface BankTransferData {
  id: number;
  transaction_reference: string;
  amount: number;
  currency: string;
  status: string;
  expires_at: string;
  created_at: string;
}

interface OrderData {
  order_number: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
}

export default function PaymentAwaitingApprovalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const bankTransferId = params.id as string;

  const [bankTransfer, setBankTransfer] = useState<BankTransferData | null>(null);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    if (bankTransferId) {
      fetchBankTransferDetails();
    }
  }, [session, status, router, bankTransferId]);

  const fetchBankTransferDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/payment/bank-transfer/status/${bankTransferId}`);
      
      if (response.ok) {
        const data = await response.json();
        setBankTransfer(data.bankTransfer);
        setOrder(data.order);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load payment details');
      }
    } catch (error) {
      setError('Failed to load payment details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrder = () => {
    if (order) {
      router.push(`/order/success/${bankTransfer?.id}`);
    }
  };

  const handleContactSupport = () => {
    // You can implement this to open a contact form or redirect to support
    window.open('mailto:support@readnwin.com?subject=Payment%20Verification%20Query', '_blank');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  if (error || !bankTransfer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The payment you are looking for does not exist.'}</p>
            <button
              onClick={handleGoToDashboard}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const timeRemaining = Math.max(0, new Date(bankTransfer.expires_at).getTime() - new Date().getTime());
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const isExpired = timeRemaining <= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Awaiting Approval
          </h1>
          <p className="text-gray-600 text-lg">
            Your bank transfer has been received and is being verified by our team.
          </p>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500">Transaction Reference</p>
              <p className="font-mono text-gray-900">{bankTransfer.transaction_reference}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="font-semibold text-gray-900">₦{bankTransfer.amount.toLocaleString()}</p>
            </div>
            {order && (
              <>
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-semibold text-gray-900">{order.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
            Awaiting Verification
          </div>
        </div>

        {/* Time Remaining */}
        {!isExpired && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Time Remaining</h2>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {hoursRemaining}h {minutesRemaining}m
              </div>
              <p className="text-gray-600">Complete your transfer before this expires</p>
            </div>
          </div>
        )}

        {/* What Happens Next */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">What Happens Next?</h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <div>
                <p className="text-blue-900 font-medium">Payment Verification</p>
                <p className="text-blue-700 text-sm">Our team will verify your bank transfer within 24 hours</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <div>
                <p className="text-blue-900 font-medium">Order Confirmation</p>
                <p className="text-blue-700 text-sm">You'll receive an email confirmation once payment is verified</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">3</span>
              </div>
              <div>
                <p className="text-blue-900 font-medium">E-book Access</p>
                <p className="text-blue-700 text-sm">Your e-books will be available in your library immediately after verification</p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <i className="ri-mail-line text-gray-600 text-lg"></i>
              </div>
              <div>
                <p className="text-gray-900 font-medium">Contact Support</p>
                <p className="text-gray-600 text-sm">Email us at support@readnwin.com for assistance</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <i className="ri-time-line text-gray-600 text-lg"></i>
              </div>
              <div>
                <p className="text-gray-900 font-medium">Response Time</p>
                <p className="text-gray-600 text-sm">We typically respond within 2-4 hours during business hours</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <i className="ri-information-line text-gray-600 text-lg"></i>
              </div>
              <div>
                <p className="text-gray-900 font-medium">Business Hours</p>
                <p className="text-gray-600 text-sm">Monday - Friday: 9:00 AM - 6:00 PM (WAT)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleViewOrder}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>View Order Details</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleContactSupport}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium flex items-center justify-center space-x-2"
          >
            <span>Contact Support</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
} 