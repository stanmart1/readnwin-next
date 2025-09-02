'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { CartItem, CartSummary } from '@/lib/cart/CartService';
import { safeLog } from '@/utils/security';

interface CartContextType {
  // State
  items: CartItem[];
  summary: CartSummary;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addItem: (bookId: number, quantity?: number) => Promise<void>;
  updateQuantity: (bookId: number, quantity: number) => Promise<void>;
  removeItem: (bookId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  
  // Computed values
  isEmpty: boolean;
  totalItems: number;
  totalValue: number;
  totalSavings: number;
}

const defaultSummary: CartSummary = {
  totalItems: 0,
  totalValue: 0,
  totalSavings: 0,
  ebookCount: 0,
  physicalCount: 0,
  isEbookOnly: false,
  isPhysicalOnly: false,
  isMixedCart: false
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function SecureCartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary>(defaultSummary);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    if (!session?.user?.id) {
      setItems([]);
      setSummary(defaultSummary);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cart/secure', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();
      setItems(data.items || []);
      setSummary(data.summary || defaultSummary);
    } catch (err) {
      safeLog.error('Error fetching cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to load cart');
      setItems([]);
      setSummary(defaultSummary);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  const addItem = useCallback(async (bookId: number, quantity: number = 1) => {
    if (!session?.user?.id) {
      setError('Please log in to add items to cart');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cart/secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, quantity })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add item to cart');
      }

      await fetchCart();
      // Dispatch cart refresh event
      window.dispatchEvent(new CustomEvent('cart-refresh'));
    } catch (err) {
      safeLog.error('Error adding to cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to add item to cart');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, fetchCart]);

  const updateQuantity = useCallback(async (bookId: number, quantity: number) => {
    if (!session?.user?.id) {
      setError('Please log in to update cart');
      return;
    }

    if (quantity < 1) {
      // Handle removal directly instead of calling removeItem to avoid circular dependency
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/cart/secure?bookId=${bookId}`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to remove item from cart');
        }
        await fetchCart();
        window.dispatchEvent(new CustomEvent('cart-refresh'));
      } catch (err) {
        safeLog.error('Error removing from cart:', err);
        setError(err instanceof Error ? err.message : 'Failed to remove item from cart');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cart/secure', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, quantity })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update cart');
      }

      await fetchCart();
      // Dispatch cart refresh event
      window.dispatchEvent(new CustomEvent('cart-refresh'));
    } catch (err) {
      safeLog.error('Error updating cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to update cart');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, fetchCart]);

  const removeItem = useCallback(async (bookId: number) => {
    if (!session?.user?.id) {
      setError('Please log in to remove items from cart');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/cart/secure?bookId=${bookId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove item from cart');
      }

      await fetchCart();
      // Dispatch cart refresh event
      window.dispatchEvent(new CustomEvent('cart-refresh'));
    } catch (err) {
      safeLog.error('Error removing from cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove item from cart');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, fetchCart]);

  const clearCart = useCallback(async () => {
    if (!session?.user?.id) {
      setError('Please log in to clear cart');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cart/secure', {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to clear cart');
      }

      setItems([]);
      setSummary(defaultSummary);
      // Dispatch cart refresh event
      window.dispatchEvent(new CustomEvent('cart-refresh'));
    } catch (err) {
      safeLog.error('Error clearing cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear cart');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  const refreshCart = useCallback(async () => {
    await fetchCart();
  }, [fetchCart]);

  // Load cart when session changes and handle guest cart transfer
  useEffect(() => {
    if (status === 'loading') return;
    
    if (session?.user?.id) {
      // Check for guest cart and transfer if exists
      const guestCartKey = 'readnwin_guest_cart';
      const guestCart = localStorage.getItem(guestCartKey);
      
      if (guestCart) {
        try {
          const guestItems = JSON.parse(guestCart);
          if (guestItems.length > 0) {
            // Transfer guest cart
            fetch('/api/cart/transfer-guest', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                guest_cart_items: guestItems.map((item: any) => ({
                  book_id: item.book_id,
                  quantity: item.quantity
                }))
              })
            }).then(() => {
              localStorage.removeItem(guestCartKey);
              fetchCart();
            }).catch(err => {
              safeLog.error('Failed to transfer guest cart:', err);
              fetchCart();
            });
          } else {
            fetchCart();
          }
        } catch (err) {
          safeLog.error('Error parsing guest cart:', err);
          fetchCart();
        }
      } else {
        fetchCart();
      }
    } else {
      fetchCart();
    }
  }, [status, session?.user?.id, fetchCart]);

  // Listen for cart refresh events
  useEffect(() => {
    const handleCartRefresh = () => {
      fetchCart();
    };

    window.addEventListener('cart-refresh', handleCartRefresh);
    return () => window.removeEventListener('cart-refresh', handleCartRefresh);
  }, [fetchCart]);

  const value: CartContextType = {
    items,
    summary,
    isLoading,
    error,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
    isEmpty: items.length === 0,
    totalItems: summary.totalItems,
    totalValue: summary.totalValue,
    totalSavings: summary.totalSavings
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useSecureCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useSecureCart must be used within a SecureCartProvider');
  }
  return context;
}