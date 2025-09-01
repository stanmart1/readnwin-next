'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

export default function ReadingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard library as this is now the primary library interface
    router.replace('/dashboard?tab=library');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <i className="ri-book-line text-2xl text-blue-600"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirecting to Library...</h2>
          <p className="text-gray-600">Taking you to your dashboard library</p>
        </div>
      </div>
    </div>
  );
}