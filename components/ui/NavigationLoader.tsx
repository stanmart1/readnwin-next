'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NavigationLoader() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    // Listen for route changes
    const originalPush = router.push;
    router.push = (...args) => {
      handleStart();
      return originalPush.apply(router, args).finally(handleComplete);
    };

    return () => {
      router.push = originalPush;
    };
  }, [router]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-blue-200">
        <div className="h-full bg-blue-600 animate-pulse" style={{ width: '30%' }}></div>
      </div>
    </div>
  );
}