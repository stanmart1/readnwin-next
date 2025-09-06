import { Suspense } from 'react';
import PaymentVerifyContent from './PaymentVerifyContent';
import Header from '@/components/Header';

// Force dynamic rendering to prevent prerender errors
export const dynamic = 'force-dynamic';

function PaymentVerifyFallback() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying payment...</p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentVerificationPage() {
  return (
    <Suspense fallback={<PaymentVerifyFallback />}>
      <PaymentVerifyContent />
    </Suspense>
  );
} 