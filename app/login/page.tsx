import { Suspense } from 'react';
import LoginContent from './LoginContent';

// Force dynamic rendering to prevent prerender errors
export const dynamic = 'force-dynamic';

function LoginFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-purple-100/20 to-blue-50/40"></div>
      <div className="text-center relative z-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  );
} 