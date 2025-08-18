'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface CartItem {
  id: number;
  book_id: number;
  quantity: number;
  book?: {
    id: number;
    title: string;
    author_name: string;
    price: number;
    original_price?: number;
    cover_image_url: string;
    category_name?: string;
    format?: 'ebook' | 'physical' | 'audiobook' | 'both';
  };
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  isLoading: boolean;
  // Cart type detection functions
  hasPhysicalBooks: () => boolean;
  hasEbooks: () => boolean;
  isEbookOnly: () => boolean;
  isPhysicalOnly: () => boolean;
  isMixedCart: () => boolean;
  // Cart analytics
  getCartAnalytics: () => {
    totalItems: number;
    totalValue: number;
    totalSavings: number;
    ebookCount: number;
    physicalCount: number;
    cartType: 'ebook-only' | 'physical-only' | 'mixed' | 'empty';
  };
  loadCart: () => Promise<void>;
  addToCart: (bookId: number, quantity?: number) => Promise<boolean>;
  updateQuantity: (bookId: number, quantity: number) => Promise<boolean>;
  removeFromCart: (bookId: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const { data: session, status } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Cart type detection functions
  const hasPhysicalBooks = useCallback(() => {
    return cartItems.some(item => 
      item.book?.format === 'physical' || 
      item.book?.format === 'both'
    );
  }, [cartItems]);

  const hasEbooks = useCallback(() => {
    return cartItems.some(item => 
      item.book?.format === 'ebook' || 
      item.book?.format === 'both'
    );
  }, [cartItems]);

  const isEbookOnly = useCallback(() => {
    return hasEbooks() && !hasPhysicalBooks();
  }, [hasEbooks, hasPhysicalBooks]);

  const isPhysicalOnly = useCallback(() => {
    return hasPhysicalBooks() && !hasEbooks();
  }, [hasPhysicalBooks, hasEbooks]);

  const isMixedCart = useCallback(() => {
    return hasEbooks() && hasPhysicalBooks();
  }, [hasEbooks, hasPhysicalBooks]);

  const getCartAnalytics = useCallback(() => {
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    const totalValue = cartItems.reduce((total, item) => {
      const price = item.book?.price || 0;
      return total + (price * item.quantity);
    }, 0);
    
    const totalSavings = cartItems.reduce((total, item) => {
      const book = item.book;
      if (book?.original_price && typeof book.original_price === 'number' && book.original_price > book.price) {
        return total + ((book.original_price - book.price) * item.quantity);
      }
      return total;
    }, 0);

    const ebookCount = cartItems.reduce((total, item) => {
      if (item.book?.format === 'ebook' || item.book?.format === 'both') {
        return total + item.quantity;
      }
      return total;
    }, 0);

    const physicalCount = cartItems.reduce((total, item) => {
      if (item.book?.format === 'physical' || item.book?.format === 'both') {
        return total + item.quantity;
      }
      return total;
    }, 0);

    let cartType: 'ebook-only' | 'physical-only' | 'mixed' | 'empty' = 'empty';
    if (cartItems.length === 0) {
      cartType = 'empty';
    } else if (isEbookOnly()) {
      cartType = 'ebook-only';
    } else if (isPhysicalOnly()) {
      cartType = 'physical-only';
    } else {
      cartType = 'mixed';
    }

    return {
      totalItems,
      totalValue,
      totalSavings,
      ebookCount,
      physicalCount,
      cartType
    };
  }, [cartItems, isEbookOnly, isPhysicalOnly]);

  const loadCart = useCallback(async () => {
    if (!session?.user || status !== 'authenticated') {
      setCartItems([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/cart');
      
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cartItems || []);
      } else {
        console.error('Failed to load cart items');
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error loading cart items:', error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user, status]);

  const addToCart = async (bookId: number, quantity: number = 1): Promise<boolean> => {
    if (!session?.user) {
      return false;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          book_id: bookId,
          quantity: quantity
        }),
      });

      if (response.ok) {
        // Optimistically update the cart count immediately
        const newItem = { id: Date.now(), book_id: bookId, quantity: quantity };
        setCartItems(prev => {
          const existingItem = prev.find(item => item.book_id === bookId);
          if (existingItem) {
            return prev.map(item => 
              item.book_id === bookId 
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            return [...prev, newItem];
          }
        });
        
        // Then refresh from server to get complete data
        await loadCart();
        return true;
      } else {
        const errorData = await response.json();
        console.error('Failed to add to cart:', errorData.error);
        return false;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const updateQuantity = async (bookId: number, quantity: number): Promise<boolean> => {
    if (!session?.user) {
      return false;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          book_id: bookId,
          quantity: quantity
        }),
      });

      if (response.ok) {
        // Optimistically update the cart immediately
        setCartItems(prev => {
          if (quantity === 0) {
            return prev.filter(item => item.book_id !== bookId);
          } else {
            return prev.map(item => 
              item.book_id === bookId 
                ? { ...item, quantity: quantity }
                : item
            );
          }
        });
        
        // Then refresh from server to get complete data
        await loadCart();
        return true;
      } else {
        const errorData = await response.json();
        console.error('Failed to update cart:', errorData.error);
        return false;
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      return false;
    }
  };

  const removeFromCart = async (bookId: number): Promise<boolean> => {
    if (!session?.user) {
      return false;
    }

    try {
      const response = await fetch(`/api/cart?book_id=${bookId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Optimistically update the cart immediately
        setCartItems(prev => prev.filter(item => item.book_id !== bookId));
        
        // Then refresh from server to get complete data
        await loadCart();
        return true;
      } else {
        console.error('Failed to remove from cart');
        return false;
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  };

  const clearCart = async (): Promise<boolean> => {
    if (!session?.user) {
      return false;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      });

      if (response.ok) {
        setCartItems([]);
        return true;
      } else {
        console.error('Failed to clear cart');
        return false;
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  };

  const refreshCart = useCallback(async () => {
    await loadCart();
  }, [loadCart]);

  // Load cart when session changes
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      loadCart();
    } else {
      // Clear cart for unauthenticated users or loading state
      setCartItems([]);
    }
  }, [session, status, loadCart]);

  // Periodic refresh to keep cart in sync (every 30 seconds)
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const interval = setInterval(() => {
        loadCart();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [session, status, loadCart]);

  const value: CartContextType = {
    cartItems,
    cartCount,
    isLoading,
    // Cart type detection functions
    hasPhysicalBooks,
    hasEbooks,
    isEbookOnly,
    isPhysicalOnly,
    isMixedCart,
    // Cart analytics
    getCartAnalytics,
    loadCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
} 