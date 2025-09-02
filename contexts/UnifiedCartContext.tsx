'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { useCart } from '@/contexts/CartContextNew';
import { useGuestCart } from '@/contexts/GuestCartContext';
import { Book } from '@/types/ecommerce';

interface UnifiedCartContextType {
  // State
  cartItems: any[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addToCart: (bookIdOrBook: number | Book, quantity?: number) => Promise<void>;
  updateQuantity: (bookId: number, quantity: number) => Promise<void>;
  removeFromCart: (bookId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  
  // Computed values
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotalSavings: () => number;
  
  // Guest-specific
  transferCartToUser?: (userId: number) => Promise<boolean>;
}

const UnifiedCartContext = createContext<UnifiedCartContextType | undefined>(undefined);

export function UnifiedCartProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const authenticatedCart = useCart();
  const guestCart = useGuestCart();

  // Use authenticated cart if user is logged in, otherwise use guest cart
  const activeCart = session ? authenticatedCart : guestCart;

  const addToCart = async (bookIdOrBook: number | Book, quantity: number = 1) => {
    if (session) {
      // User is authenticated - use regular cart
      const bookId = typeof bookIdOrBook === 'number' ? bookIdOrBook : bookIdOrBook.id;
      await authenticatedCart.addToCart(bookId, quantity);
    } else {
      // User is guest - use guest cart
      if (typeof bookIdOrBook === 'number') {
        throw new Error('Guest cart requires full book object');
      }
      await guestCart.addToCart(bookIdOrBook, quantity);
    }
  };

  const value: UnifiedCartContextType = {
    cartItems: activeCart.cartItems,
    isLoading: activeCart.isLoading,
    error: activeCart.error,
    addToCart,
    updateQuantity: activeCart.updateQuantity,
    removeFromCart: activeCart.removeFromCart,
    clearCart: activeCart.clearCart,
    refreshCart: activeCart.refreshCart,
    getTotalItems: activeCart.getTotalItems,
    getSubtotal: activeCart.getSubtotal,
    getTotalSavings: activeCart.getTotalSavings,
    transferCartToUser: session ? undefined : guestCart.transferCartToUser
  };

  return (
    <UnifiedCartContext.Provider value={value}>
      {children}
    </UnifiedCartContext.Provider>
  );
}

export function useUnifiedCart() {
  const context = useContext(UnifiedCartContext);
  if (context === undefined) {
    throw new Error('useUnifiedCart must be used within a UnifiedCartProvider');
  }
  return context;
}