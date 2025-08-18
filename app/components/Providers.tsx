'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from '@/contexts/CartContextNew';
import { GuestCartProvider } from '@/contexts/GuestCartContext';
import { NotificationContainer } from '@/components/ui/Notification';
import { ClientOnly } from '@/components/ui/ClientOnly';
import AuthWrapper from '@/components/AuthWrapper';

interface ProvidersProps {
  children: ReactNode;
  session: any;
}

export default function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider 
      session={session} 
      refetchInterval={15 * 60} // Increased to 15 minutes to reduce frequency
      refetchOnWindowFocus={false} // Disabled to prevent unnecessary refreshes during login
      refetchWhenOffline={false}
    >
      <CartProvider>
        <GuestCartProvider>
          <AuthWrapper>
            {children}
          </AuthWrapper>
          <Toaster position="top-right" />
          <ClientOnly>
            <NotificationContainer />
          </ClientOnly>
        </GuestCartProvider>
      </CartProvider>
    </SessionProvider>
  );
} 