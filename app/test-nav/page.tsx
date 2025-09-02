'use client';

import Header from '@/components/Header';
import Link from 'next/link';

export default function TestNav() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Navigation Test</h1>
        <div className="space-y-4">
          <Link href="/" className="block p-4 bg-white rounded shadow hover:bg-gray-50">
            Home
          </Link>
          <Link href="/books" className="block p-4 bg-white rounded shadow hover:bg-gray-50">
            Books
          </Link>
          <Link href="/cart-new" className="block p-4 bg-white rounded shadow hover:bg-gray-50">
            Cart
          </Link>
          <Link href="/dashboard" className="block p-4 bg-white rounded shadow hover:bg-gray-50">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}