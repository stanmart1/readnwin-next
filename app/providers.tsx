'use client';

import { SessionProvider } from 'next-auth/react';
import { GuestCartProvider } from '@/contexts/GuestCartContext';
import { SecureCartProvider } from '@/contexts/SecureCartContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <GuestCartProvider>
        <SecureCartProvider>
          {children}
        </SecureCartProvider>
      </GuestCartProvider>
    </SessionProvider>
  );
}