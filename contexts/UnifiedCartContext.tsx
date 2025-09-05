'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { CartItem, Book } from '@/types/ecommerce';

interface UnifiedCartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  error: string | null;
  addToCart: (book: Book, quantity?: number) => Promise<void>;
  updateQuantity: (bookId: number, quantity: number) => Promise<void>;
  removeFromCart: (bookId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getSubtotal: () => number;
  getTotalItems: () => number;
  refreshCart: () => Promise<void>;
}

const UnifiedCartContext = createContext<UnifiedCartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'readnwin_unified_cart';

export function UnifiedCartProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cart on session change
  useEffect(() => {
    if (session?.user?.id) {
      loadAuthenticatedCart();
    } else {
      loadGuestCart();
    }
  }, [session?.user?.id]);

  const loadGuestCart = () => {
    try {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      setCartItems(stored ? JSON.parse(stored) : []);
    } catch (error) {
      console.error('Error loading guest cart:', error);
      setCartItems([]);
    }
  };

  const saveGuestCart = (items: CartItem[]) => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving guest cart:', error);
    }
  };

  const loadAuthenticatedCart = async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      // First, transfer any guest cart items
      const guestCart = localStorage.getItem(GUEST_CART_KEY);
      if (guestCart) {
        const guestItems = JSON.parse(guestCart);
        if (guestItems.length > 0) {
          await transferGuestCart(guestItems);
          localStorage.removeItem(GUEST_CART_KEY);
        }
      }

      // Load authenticated cart
      const response = await fetch('/api/cart/secure');
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
      }
    } catch (error) {
      console.error('Error loading authenticated cart:', error);
      setError('Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  };

  const transferGuestCart = async (guestItems: CartItem[]) => {
    try {
      await fetch('/api/cart/transfer-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_cart_items: guestItems.map(item => ({
            book_id: item.book_id,
            quantity: item.quantity
          }))
        })
      });
    } catch (error) {
      console.error('Error transferring guest cart:', error);
    }
  };

  const addToCart = async (book: Book, quantity: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      if (session?.user?.id) {
        // Authenticated user - use API
        const response = await fetch('/api/cart/secure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId: book.id, quantity })
        });
        
        if (response.ok) {
          await loadAuthenticatedCart();
        } else {
          throw new Error('Failed to add to cart');
        }
      } else {
        // Guest user - use localStorage
        setCartItems(prev => {
          const existingItem = prev.find(item => item.book_id === book.id);
          let newItems: CartItem[];

          if (existingItem) {
            newItems = prev.map(item => 
              item.book_id === book.id 
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            const newItem: CartItem = {
              id: Date.now(),
              user_id: 0,
              book_id: book.id,
              quantity,
              added_at: new Date().toISOString(),
              book: {
                id: book.id,
                title: book.title,
                author_name: book.author_name || 'Unknown Author',
                price: book.price,
                original_price: book.original_price,
                cover_image_url: book.cover_image_url,
                category_name: book.category_name,
                format: book.format,
                author_id: book.author_id,
                category_id: book.category_id,
                language: book.language,
                stock_quantity: book.stock_quantity,
                low_stock_threshold: book.low_stock_threshold,
                is_featured: book.is_featured,
                is_bestseller: book.is_bestseller,
                is_new_release: book.is_new_release,
                status: book.status,
                view_count: book.view_count,
                created_at: book.created_at,
                updated_at: book.updated_at
              }
            };
            newItems = [...prev, newItem];
          }

          saveGuestCart(newItems);
          return newItems;
        });
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (bookId: number, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(bookId);
      return;
    }

    try {
      if (session?.user?.id) {
        // Update state immediately for better UX
        setCartItems(prev => 
          prev.map(item => 
            item.book_id === bookId ? { ...item, quantity } : item
          )
        );

        // Update on server in background
        const response = await fetch('/api/cart/secure', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId, quantity })
        });
        
        if (!response.ok) {
          // Revert on error
          await loadAuthenticatedCart();
          throw new Error('Failed to update quantity');
        }
      } else {
        setCartItems(prev => {
          const newItems = prev.map(item => 
            item.book_id === bookId ? { ...item, quantity } : item
          );
          saveGuestCart(newItems);
          return newItems;
        });
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError('Failed to update quantity');
    }
  };

  const removeFromCart = async (bookId: number) => {
    try {
      if (session?.user?.id) {
        // Update state immediately for better UX
        setCartItems(prev => prev.filter(item => item.book_id !== bookId));

        // Update on server in background
        const response = await fetch('/api/cart/secure', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId })
        });
        
        if (!response.ok) {
          // Revert on error
          await loadAuthenticatedCart();
          throw new Error('Failed to remove item');
        }
      } else {
        setCartItems(prev => {
          const newItems = prev.filter(item => item.book_id !== bookId);
          saveGuestCart(newItems);
          return newItems;
        });
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      setError('Failed to remove item');
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      if (session?.user?.id) {
        await fetch('/api/cart/clear', { method: 'POST' });
      } else {
        localStorage.removeItem(GUEST_CART_KEY);
      }
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError('Failed to clear cart');
    } finally {
      setIsLoading(false);
    }
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.book?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const refreshCart = async () => {
    if (session?.user?.id) {
      await loadAuthenticatedCart();
    } else {
      loadGuestCart();
    }
  };

  const value: UnifiedCartContextType = {
    cartItems,
    isLoading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getSubtotal,
    getTotalItems,
    refreshCart,
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