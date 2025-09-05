'use client';

import { SessionProvider } from 'next-auth/react';
import { UnifiedCartProvider } from '@/contexts/UnifiedCartContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <UnifiedCartProvider>
        {children}
      </UnifiedCartProvider>
    </SessionProvider>
  );
}