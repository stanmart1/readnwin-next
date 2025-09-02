'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function DebugPage() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('Current pathname:', pathname);
    console.log('Router:', router);
  }, [router, pathname]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      <p>Current path: {pathname}</p>
      <div className="mt-4 space-y-2">
        <a href="/" className="block p-2 bg-blue-100 hover:bg-blue-200">Home (href)</a>
        <button onClick={() => router.push('/')} className="block p-2 bg-green-100 hover:bg-green-200">Home (router.push)</button>
        <a href="/books" className="block p-2 bg-blue-100 hover:bg-blue-200">Books (href)</a>
        <button onClick={() => router.push('/books')} className="block p-2 bg-green-100 hover:bg-green-200">Books (router.push)</button>
      </div>
    </div>
  );
}