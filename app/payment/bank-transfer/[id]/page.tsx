'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import ProofUpload from '@/components/checkout/ProofUpload';
import { formatNaira } from '@/utils/currency';

interface BankTransferData {
  id: number;
  transaction_reference: string;
  amount: number;
  currency: string;
  status: string;
  expires_at: string;
  created_at: string;
}

interface BankAccountData {
  bank_name: string;
  account_number: string;
  account_name: string;
}

interface OrderData {
  order_number: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
}

export default function BankTransferPaymentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const bankTransferId = params.id as string;

  const [bankTransfer, setBankTransfer] = useState<BankTransferData | null>(null);
  const [bankAccount, setBankAccount] = useState<BankAccountData | null>(null);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [proofs, setProofs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    fetchBankTransferDetails();
  }, [session, status, router, bankTransferId]);

  const fetchBankTransferDetails = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Fetching bank transfer details for ID:', bankTransferId);
      
      if (!bankTransferId || bankTransferId === 'undefined') {
        setError('Invalid bank transfer ID');
        return;
      }
      
      const response = await fetch(`/api/payment/bank-transfer/status/${bankTransferId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Bank transfer details loaded:', data);
        setBankTransfer(data.bankTransfer);
        setBankAccount(data.bankAccount);
        setOrder(data.order);
        setProofs(data.proofs);
        setError(null);
      } else {
        const errorData = await response.json();
        console.error('❌ Bank transfer details error:', errorData);
        setError(errorData.error || 'Failed to load bank transfer details');
      }
    } catch (error) {
      console.error('❌ Bank transfer details fetch error:', error);
      setError('Failed to load bank transfer details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = (proof: any) => {
    setProofs(prev => [proof, ...prev]);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const handleUploadError = (error: string) => {
    setError(error);
    setTimeout(() => setError(null), 5000);
  };

  const isExpired = bankTransfer ? new Date() > new Date(bankTransfer.expires_at) : false;
  const timeRemaining = bankTransfer ? Math.max(0, new Date(bankTransfer.expires_at).getTime() - new Date().getTime()) : 0;
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

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

  if (error && !bankTransfer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-error-warning-line text-2xl text-red-600"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!bankTransfer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Bank Transfer Not Found</h1>
            <p className="text-gray-600 mb-6">The bank transfer you're looking for doesn't exist.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bank Transfer Payment</h1>
          <p className="text-gray-600">Complete your payment and upload proof</p>
        </div>

        {/* Success Message */}
        {uploadSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <i className="ri-check-line text-green-600 mr-2"></i>
              <span className="text-green-800">Proof uploaded successfully!</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <i className="ri-error-warning-line text-red-600 mr-2"></i>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
                )}

        {/* Payment Details - Hidden on Mobile */}
        <div className="mb-8 hidden md:block">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">Amount</p>
                <p className="text-xl font-bold text-blue-900">{formatNaira(bankTransfer.amount)}</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                  bankTransfer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  bankTransfer.status === 'verified' ? 'bg-green-100 text-green-800' :
                  bankTransfer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {bankTransfer.status.charAt(0).toUpperCase() + bankTransfer.status.slice(1)}
                </span>
              </div>
              {order && (
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-1">Order Number</p>
                  <p className="text-sm font-semibold text-purple-900">{order.order_number}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bank Account Details */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Bank Account Details</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                  <p className="text-gray-900 font-mono text-lg">1015830730</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                  <p className="text-gray-900 font-semibold text-lg">Zenith Bank</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                  <p className="text-gray-900 font-semibold text-lg">LAGSALE ONLINE RESOURCES</p>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-sm font-semibold text-yellow-800 mb-2">Important Instructions</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Transfer exactly <strong>{formatNaira(bankTransfer.amount)}</strong></li>
                  <li>• Use <strong>"{order?.order_number || 'ORDER'}"</strong> as payment description</li>
                  <li>• Keep your transfer receipt for proof upload</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Proof Upload */}
        <div className="mb-8">
          {bankTransfer.status === 'pending' && !isExpired ? (
            <ProofUpload
              bankTransferId={bankTransfer.id}
              amount={bankTransfer.amount}
              transactionReference={bankTransfer.transaction_reference}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              existingProofs={proofs}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Status</h2>
              {bankTransfer.status === 'verified' ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-check-line text-2xl text-green-600"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Payment Verified!</h3>
                  <p className="text-green-700 mb-4">Your payment has been verified and your order is being processed.</p>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </div>
              ) : bankTransfer.status === 'rejected' ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-close-line text-2xl text-red-600"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Payment Rejected</h3>
                  <p className="text-red-700 mb-4">Your payment was rejected. Please contact support for assistance.</p>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-time-line text-2xl text-gray-600"></i>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Expired</h3>
                  <p className="text-gray-700 mb-4">This payment has expired. Please initiate a new payment.</p>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Complete Payment CTA */}
        {bankTransfer.status === 'pending' && !isExpired && (
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                if (order) {
                  // Get order ID from search params or extract from order data
                  const urlParams = new URLSearchParams(window.location.search);
                  const orderId = urlParams.get('orderId');
                  if (orderId) {
                    router.push(`/order-confirmation-enhanced/${orderId}`);
                  } else {
                    router.push('/dashboard/orders');
                  }
                } else {
                  router.push('/dashboard/orders');
                }
              }}
              className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors font-medium text-lg"
            >
              View Order Status
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 