'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { CartItem, CartAnalytics, Book } from '@/types/ecommerce';

interface GuestCartContextType {
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
  addToCart: (book: Book, quantity?: number) => Promise<void>;
  updateQuantity: (bookId: number, quantity: number) => Promise<void>;
  removeFromCart: (bookId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Cart calculations
  getSubtotal: () => number;
  getTotalSavings: () => number;
  getTotalItems: () => number;
  
  // Refresh cart
  refreshCart: () => Promise<void>;
  
  // Transfer cart to user account
  transferCartToUser: (userId: number) => Promise<boolean>;
}

const GuestCartContext = createContext<GuestCartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'readnwin_guest_cart';

export function GuestCartProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Initialize cart from localStorage immediately for guest users
    if (typeof window !== 'undefined' && !session) {
      try {
        const storedCart = localStorage.getItem(GUEST_CART_KEY);
        return storedCart ? JSON.parse(storedCart) : [];
      } catch (error) {
        console.error('Error loading initial cart:', error);
        return [];
      }
    }
    return [];
  });
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

  // Load cart when session changes
  useEffect(() => {
    console.log('🔄 Session changed, user ID:', session?.user?.id);
    if (session?.user?.id) {
      // Transfer guest cart if exists, then load authenticated cart
      const guestCart = localStorage.getItem(GUEST_CART_KEY);
      console.log('📦 Guest cart in localStorage:', guestCart);
      if (guestCart) {
        try {
          const guestItems = JSON.parse(guestCart);
          console.log('📦 Parsed guest items:', guestItems.length, 'items');
          if (guestItems.length > 0) {
            console.log('🔄 Transferring guest cart to user...');
            // Keep showing guest items during transfer to prevent cart from appearing empty
            setCartItems(guestItems);
            transferCartToUser(parseInt(session.user.id)).then(async (success) => {
              console.log('🔄 Transfer result:', success);
              if (success) {
                console.log('✅ Transfer successful, cart items are now in database');
                // Keep current cart items visible - checkout will handle validation
              } else {
                console.log('⚠️ Transfer failed, keeping guest cart visible');
              }
            });
          } else {
            console.log('🔄 No guest items, loading authenticated cart directly...');
            loadAuthenticatedCart();
          }
        } catch (error) {
          console.error('❌ Error parsing guest cart:', error);
          loadAuthenticatedCart();
        }
      } else {
        console.log('🔄 No guest cart, loading authenticated cart...');
        loadAuthenticatedCart();
      }
    } else {
      console.log('🔄 No user session, loading guest cart from localStorage...');
      // Load guest cart from localStorage
      loadCartFromStorage();
    }
  }, [session?.user?.id]);

  // Update analytics when cart items change
  useEffect(() => {
    updateAnalytics();
  }, [cartItems]);

  const saveCartToStorage = (items: CartItem[]) => {
    try {
      console.log('🛒 Saving guest cart to localStorage:', items);
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
      console.log('✅ Guest cart saved successfully');
    } catch (error) {
      console.error('❌ Error saving guest cart to storage:', error);
    }
  };

  const loadCartFromStorage = () => {
    try {
      console.log('🛒 Loading guest cart from localStorage...');
      const storedCart = localStorage.getItem(GUEST_CART_KEY);
      console.log('📦 Stored cart data:', storedCart);
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        console.log('✅ Parsed cart items:', parsedCart);
        setCartItems(parsedCart);
      } else {
        console.log('📭 No stored cart found');
        setCartItems([]);
      }
    } catch (error) {
      console.error('❌ Error loading guest cart from storage:', error);
      setCartItems([]);
    }
  };

  const updateAnalytics = () => {
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    const totalValue = cartItems.reduce((total, item) => {
      const price = item.book?.price || 0;
      return total + (price * item.quantity);
    }, 0);
    
    const ebookCount = cartItems.reduce((total, item) => {
      if (item.book?.format === 'ebook') {
        return total + item.quantity;
      }
      return total;
    }, 0);

    const physicalCount = cartItems.reduce((total, item) => {
      if (item.book?.format === 'physical') {
        return total + item.quantity;
      }
      return total;
    }, 0);

    setAnalytics({
      totalItems,
      totalValue,
      totalSavings: 0, // Calculated in checkout
      itemCount: cartItems.length,
      averageItemValue: totalItems > 0 ? totalValue / totalItems : 0,
      ebookCount,
      physicalCount,
      isEbookOnly: ebookCount > 0 && physicalCount === 0,
      isPhysicalOnly: physicalCount > 0 && ebookCount === 0,
      isMixedCart: ebookCount > 0 && physicalCount > 0
    });
  };

  const addToCart = async (book: Book, quantity: number = 1) => {
    console.log('🛒 Adding to cart:', { book: book.title, quantity, isAuthenticated: !!session });
    setIsLoading(true);
    setError(null);

    try {
      if (session?.user?.id) {
        // For authenticated users, use API
        const response = await fetch('/api/cart/secure', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId: book.id, quantity })
        });
        
        if (response.ok) {
          // Reload cart from API
          await loadAuthenticatedCart();
        } else {
          throw new Error('Failed to add to cart');
        }
      } else {
        // For guest users, use localStorage
        setCartItems(prev => {
          console.log('📦 Current cart items:', prev);
          const existingItem = prev.find(item => item.book_id === book.id);
          let newItems: CartItem[];

          if (existingItem) {
            console.log('🔄 Updating existing item quantity');
            newItems = prev.map(item => 
              item.book_id === book.id 
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            console.log('🆕 Adding new item to cart');
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
            console.log('🆕 New cart item created:', newItem);
            newItems = [...prev, newItem];
          }

          console.log('📦 New cart items:', newItems);
          saveCartToStorage(newItems);
          return newItems;
        });
      }
    } catch (err) {
      console.error('❌ Error adding to cart:', err);
      setError('Failed to add item to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAuthenticatedCart = async (retryCount = 0) => {
    if (!session?.user?.id) return;
    
    try {
      console.log('🔄 Loading authenticated cart for user:', session.user.id, retryCount > 0 ? `(retry ${retryCount})` : '');
      const response = await fetch('/api/cart/secure', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Authenticated cart loaded:', data);
        setCartItems(data.items || []);
        setError(null);
      } else {
        console.warn('❌ Failed to load authenticated cart:', response.status, response.statusText);
        
        // Retry once if it's a 500 error and we haven't retried yet
        if (response.status === 500 && retryCount === 0) {
          console.log('🔄 Retrying authenticated cart load...');
          setTimeout(() => loadAuthenticatedCart(1), 1000);
          return;
        }
        
        // If we have items from a recent transfer, keep showing them
        if (cartItems.length === 0) {
          setCartItems([]);
        }
        setError('Failed to load cart');
      }
    } catch (error) {
      console.error('❌ Error loading authenticated cart:', error);
      
      // Retry once if we haven't retried yet
      if (retryCount === 0) {
        console.log('🔄 Retrying authenticated cart load after error...');
        setTimeout(() => loadAuthenticatedCart(1), 1000);
        return;
      }
      
      // If we have items from a recent transfer, keep showing them
      if (cartItems.length === 0) {
        setCartItems([]);
      }
      setError('Failed to load cart');
    }
  };

  const updateQuantity = async (bookId: number, quantity: number) => {
    setIsLoading(true);
    setError(null);

    try {
      if (quantity < 1) {
        await removeFromCart(bookId);
        return;
      }

      setCartItems(prev => {
        const newItems = prev.map(item => 
          item.book_id === bookId 
            ? { ...item, quantity }
            : item
        );
        saveCartToStorage(newItems);
        return newItems;
      });
    } catch (err) {
      console.error('Error updating cart:', err);
      setError('Failed to update cart');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (bookId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      setCartItems(prev => {
        const newItems = prev.filter(item => item.book_id !== bookId);
        saveCartToStorage(newItems);
        return newItems;
      });
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError('Failed to remove item from cart');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    setError(null);

    try {
      setCartItems([]);
      saveCartToStorage([]);
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Failed to clear cart');
    } finally {
      setIsLoading(false);
    }
  };

  const transferCartToUser = async (userId: number): Promise<boolean> => {
    if (cartItems.length === 0) {
      console.log('🔄 No items to transfer');
      return true;
    }

    try {
      console.log('🔄 Transferring guest cart to user:', userId, 'with', cartItems.length, 'items');
      const response = await fetch('/api/cart/transfer-guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guest_cart_items: cartItems.map(item => ({
            book_id: item.book_id,
            quantity: item.quantity
          }))
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('✅ Cart transfer successful:', result.message);
        // Add a small delay before clearing guest cart to ensure server processing is complete
        await new Promise(resolve => setTimeout(resolve, 500));
        // Clear guest cart after successful transfer
        localStorage.removeItem(GUEST_CART_KEY);
        console.log('🧹 Guest cart cleared from localStorage');
        // Clear local cart items to reflect the transfer
        setCartItems([]);
        return true;
      } else {
        console.error('❌ Cart transfer failed:', result.error);
        setError(result.error || 'Failed to transfer cart');
        return false;
      }
    } catch (err) {
      console.error('❌ Error transferring cart:', err);
      setError('Failed to transfer cart to account');
      return false;
    }
  };

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
      console.error('Error getting guest cart total items:', error);
      return 0;
    }
  }, [analytics?.totalItems]);

  const refreshCart = useCallback(async () => {
    loadCartFromStorage();
  }, []);

  const value: GuestCartContextType = {
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
    transferCartToUser,
  };

  return (
    <GuestCartContext.Provider value={value}>
      {children}
    </GuestCartContext.Provider>
  );
}

export function useGuestCart() {
  const context = useContext(GuestCartContext);
  if (context === undefined) {
    console.warn('useGuestCart called outside GuestCartProvider, returning fallback');
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
      refreshCart: async () => {},
      transferCartToUser: async () => true
    };
  }
  return context;
} 