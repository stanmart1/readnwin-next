'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { CartItem, CartAnalytics, Book } from '@/types/ecommerce';

interface CartContextType {
  // Cart state
  cartItems: CartItem[];
  isLoading: boolean;
  error: string | null;
  
  // Cart analytics
  analytics: CartAnalytics;
  
  // Cart type helpers
  isEbookOnly: () => boolean;
  isPhysicalOnly: () => boolean;
  isMixedCart: () => boolean;
  
  // Cart actions
  addToCart: (bookId: number, quantity?: number) => Promise<void>;
  updateQuantity: (bookId: number, quantity: number) => Promise<void>;
  removeFromCart: (bookId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Cart calculations
  getSubtotal: () => number;
  getTotalSavings: () => number;
  getTotalItems: () => number;
  
  // Refresh cart
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<CartAnalytics>({
    totalItems: 0,
    totalValue: 0,
    totalSavings: 0,
    itemCount: 0,
    averageItemValue: 0,
    ebookCount: 0,
    physicalCount: 0,
    isEbookOnly: true,
    isPhysicalOnly: false,
    isMixedCart: false
  });

  // Load cart items when user session changes
  useEffect(() => {
    if (status === 'loading') return;
    
    if (session?.user?.id) {
      loadCartItems();
    } else {
      // Clear cart when user logs out
      setCartItems([]);
      setAnalytics({
        totalItems: 0,
        totalValue: 0,
        totalSavings: 0,
        itemCount: 0,
        averageItemValue: 0,
        ebookCount: 0,
        physicalCount: 0,
        isEbookOnly: true,
        isPhysicalOnly: false,
        isMixedCart: false
      });
    }
  }, [session?.user?.id, status]);

  // Listen for cart refresh events (e.g., after guest cart transfer)
  useEffect(() => {
    const handleCartRefresh = () => {
      console.log('🔄 Cart refresh event received, reloading cart items...');
      if (session?.user?.id) {
        loadCartItems();
      }
    };

    window.addEventListener('cart-refresh', handleCartRefresh);
    
    return () => {
      window.removeEventListener('cart-refresh', handleCartRefresh);
    };
  }, [session?.user?.id]);

  const loadCartItems = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('/api/cart-new', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn('Cart API returned non-OK status:', response.status);
        // Don't throw error, just use empty cart
        setCartItems([]);
        setAnalytics({
          totalItems: 0,
          totalValue: 0,
          totalSavings: 0,
          itemCount: 0,
          averageItemValue: 0,
          ebookCount: 0,
          physicalCount: 0,
          isEbookOnly: true,
          isPhysicalOnly: false,
          isMixedCart: false
        });
        return;
      }

      const data = await response.json();
      setCartItems(data.cartItems || []);
      setAnalytics(data.analytics || {
        totalItems: 0,
        totalValue: 0,
        totalSavings: 0,
        itemCount: 0,
        averageItemValue: 0,
        ebookCount: 0,
        physicalCount: 0,
        isEbookOnly: true,
        isPhysicalOnly: false,
        isMixedCart: false
      });
    } catch (err) {
      console.warn('Cart loading failed, using empty cart:', err);
      // Don't set error state, just use empty cart to prevent UI breaking
      setCartItems([]);
      setAnalytics({
        totalItems: 0,
        totalValue: 0,
        totalSavings: 0,
        itemCount: 0,
        averageItemValue: 0,
        ebookCount: 0,
        physicalCount: 0,
        isEbookOnly: true,
        isPhysicalOnly: false,
        isMixedCart: false
      });
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  const addToCart = useCallback(async (bookId: number, quantity: number = 1) => {
    if (!session?.user?.id) {
      setError('Please log in to add items to cart');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cart-new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ book_id: bookId, quantity }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add item to cart');
      }

      // Reload cart to get updated data
      await loadCartItems();
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to add item to cart');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, loadCartItems]);

  const updateQuantity = useCallback(async (bookId: number, quantity: number) => {
    if (!session?.user?.id) {
      setError('Please log in to update cart');
      return;
    }

    if (quantity < 1) {
      await removeFromCart(bookId);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cart-new', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ book_id: bookId, quantity }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update cart');
      }

      // Reload cart to get updated data
      await loadCartItems();
    } catch (err) {
      console.error('Error updating cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to update cart');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, loadCartItems]);

  const removeFromCart = useCallback(async (bookId: number) => {
    if (!session?.user?.id) {
      setError('Please log in to remove items from cart');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/cart-new?book_id=${bookId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove item from cart');
      }

      // Reload cart to get updated data
      await loadCartItems();
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove item from cart');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, loadCartItems]);

  const clearCart = useCallback(async () => {
    if (!session?.user?.id) {
      setError('Please log in to clear cart');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cart-new', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to clear cart');
      }

      setCartItems([]);
      setAnalytics({
        totalItems: 0,
        totalValue: 0,
        totalSavings: 0,
        itemCount: 0,
        averageItemValue: 0,
        ebookCount: 0,
        physicalCount: 0,
        isEbookOnly: true,
        isPhysicalOnly: false,
        isMixedCart: false
      });
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear cart');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  // Cart type helpers
  const isEbookOnly = useCallback(() => {
    return analytics.isEbookOnly;
  }, [analytics.isEbookOnly]);

  const isPhysicalOnly = useCallback(() => {
    return analytics.isPhysicalOnly;
  }, [analytics.isPhysicalOnly]);

  const isMixedCart = useCallback(() => {
    return analytics.isMixedCart;
  }, [analytics.isMixedCart]);

  // Cart calculations
  const getSubtotal = useCallback(() => {
    return analytics.totalValue;
  }, [analytics.totalValue]);

  const getTotalSavings = useCallback(() => {
    return analytics.totalSavings;
  }, [analytics.totalSavings]);

  const getTotalItems = useCallback(() => {
    try {
      return analytics?.totalItems || 0;
    } catch (error) {
      console.error('Error getting total items:', error);
      return 0;
    }
  }, [analytics?.totalItems]);

  const refreshCart = useCallback(async () => {
    await loadCartItems();
  }, [loadCartItems]);

  const value: CartContextType = {
    cartItems,
    isLoading,
    error,
    analytics,
    isEbookOnly,
    isPhysicalOnly,
    isMixedCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getSubtotal,
    getTotalSavings,
    getTotalItems,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    console.warn('useCart called outside CartProvider, returning fallback');
    return {
      cartItems: [],
      isLoading: false,
      error: null,
      analytics: {
        totalItems: 0,
        totalValue: 0,
        totalSavings: 0,
        itemCount: 0,
        averageItemValue: 0,
        ebookCount: 0,
        physicalCount: 0,
        isEbookOnly: true,
        isPhysicalOnly: false,
        isMixedCart: false
      },
      isEbookOnly: () => true,
      isPhysicalOnly: () => false,
      isMixedCart: () => false,
      addToCart: async () => {},
      updateQuantity: async () => {},
      removeFromCart: async () => {},
      clearCart: async () => {},
      getSubtotal: () => 0,
      getTotalSavings: () => 0,
      getTotalItems: () => 0,
      refreshCart: async () => {}
    };
  }
  return context;
} 