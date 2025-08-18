'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CartItem } from '@/types/ecommerce';

const GUEST_CART_KEY = 'readnwin_guest_cart';
const GUEST_SHIPPING_KEY = 'readnwin_guest_shipping';
const GUEST_SHIPPING_METHOD_KEY = 'readnwin_guest_shipping_method';

export function useGuestCartTransfer() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const hasTransferred = useRef(false);
  const hasCheckedGuestCart = useRef(false);
  const lastSessionId = useRef<string | null>(null);

  const getGuestCartItems = useCallback((): CartItem[] => {
    try {
      if (typeof window === 'undefined') return [];
      
      // Only check localStorage if we haven't checked before
      if (!hasCheckedGuestCart.current) {
        hasCheckedGuestCart.current = true;
        const stored = localStorage.getItem(GUEST_CART_KEY);
        
        // Only log if there's actual data to transfer
        if (stored && stored !== 'null' && stored !== '[]') {
          console.log('📦 Found guest cart data:', stored);
          const items = JSON.parse(stored);
          console.log('✅ Parsed guest cart items:', items);
          return items;
        }
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error reading guest cart:', error);
      return [];
    }
  }, []);

  const clearGuestCart = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      console.log('🗑️ Clearing guest cart from localStorage');
      localStorage.removeItem(GUEST_CART_KEY);
      console.log('✅ Guest cart cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing guest cart:', error);
    }
  }, []);

  const getGuestShippingData = useCallback(() => {
    try {
      if (typeof window === 'undefined') return { address: null, method: null };
      const address = localStorage.getItem(GUEST_SHIPPING_KEY);
      const method = localStorage.getItem(GUEST_SHIPPING_METHOD_KEY);
      return {
        address: address ? JSON.parse(address) : null,
        method: method ? JSON.parse(method) : null
      };
    } catch (error) {
      console.error('Error reading guest shipping data:', error);
      return { address: null, method: null };
    }
  }, []);

  const clearGuestShippingData = useCallback(() => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(GUEST_SHIPPING_KEY);
      localStorage.removeItem(GUEST_SHIPPING_METHOD_KEY);
    } catch (error) {
      console.error('Error clearing guest shipping data:', error);
    }
  }, []);

  const transferGuestCartToUser = useCallback(async (): Promise<boolean> => {
    if (!session?.user?.id) {
      return false;
    }

    const guestItems = getGuestCartItems();
    if (guestItems.length === 0) {
      return true; // Nothing to transfer
    }

    try {
      // Transfer each item to the user's cart
      for (const item of guestItems) {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            book_id: item.book_id,
            quantity: item.quantity,
            guest_cart_items: guestItems // Send all guest items for merging
          }),
        });

        if (!response.ok) {
          console.error('Failed to transfer cart item:', item);
          continue; // Continue with other items even if one fails
        }
      }

      // Clear guest cart after successful transfer
      clearGuestCart();
      return true;
    } catch (error) {
      console.error('Error transferring guest cart:', error);
      return false;
    }
  }, [session, getGuestCartItems, clearGuestCart]);

  const transferCartOnAuth = useCallback(async () => {
    if (status === 'loading') return;
    
    const currentSessionId = session?.user?.id;
    
    // Only run transfer logic when:
    // 1. User is authenticated
    // 2. We haven't transferred yet
    // 3. Session ID has changed (new login)
    if (currentSessionId && !hasTransferred.current && currentSessionId !== lastSessionId.current) {
      lastSessionId.current = currentSessionId;
      
      const guestItems = getGuestCartItems();
      
      if (guestItems.length > 0) {
        console.log('🔄 Transferring guest cart items to user:', guestItems);
        hasTransferred.current = true; // Mark as transferred to prevent multiple transfers
        
        // Add a delay to prevent blocking the login redirect
        setTimeout(async () => {
          try {
            const shippingData = getGuestShippingData();
            console.log('📦 Shipping data:', shippingData);
            
            // Use the bulk transfer API
            const response = await fetch('/api/cart/transfer-guest', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                guest_cart_items: guestItems,
                shipping_address: shippingData.address,
                shipping_method: shippingData.method
              }),
            });

            if (response.ok) {
              const result = await response.json();
              console.log('✅ Guest cart transfer successful:', result);
              clearGuestCart();
              clearGuestShippingData();
              
              // Trigger a refresh of the main cart context to update the UI
              console.log('🔄 Triggering cart refresh to update UI...');
              setTimeout(() => {
                // Dispatch a custom event to trigger cart refresh
                window.dispatchEvent(new CustomEvent('cart-refresh'));
              }, 100);
              
              // Check if user was in checkout flow
              const checkoutStep = sessionStorage.getItem('guestCheckoutStep');
              const checkoutData = sessionStorage.getItem('guestCheckoutData');
              
              if (checkoutStep || checkoutData) {
                sessionStorage.removeItem('guestCheckoutStep');
                sessionStorage.removeItem('guestCheckoutData');
                sessionStorage.setItem('transferredShippingData', JSON.stringify(shippingData));
                router.push('/checkout-new');
              }
            } else {
              console.error('❌ Failed to transfer guest cart');
              hasTransferred.current = false; // Reset flag on failure
            }
          } catch (error) {
            console.error('❌ Error transferring guest cart:', error);
            hasTransferred.current = false; // Reset flag on error
          }
        }, 2000); // 2 second delay to allow login redirect to complete first
      }
    }
  }, [session, status, getGuestCartItems, clearGuestCart, router]);

  // Reset transfer flag when user logs out
  useEffect(() => {
    if (!session?.user?.id) {
      hasTransferred.current = false;
      hasCheckedGuestCart.current = false;
      lastSessionId.current = null;
    }
  }, [session?.user?.id]);

  // Auto-transfer cart when user logs in - with delay to prevent blocking
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      // Add a small delay to ensure login redirect happens first
      const timeoutId = setTimeout(() => {
        transferCartOnAuth();
      }, 1000); // 1 second delay
      
      return () => clearTimeout(timeoutId);
    }
  }, [session, status, transferCartOnAuth]);

  return {
    transferGuestCartToUser,
    getGuestCartItems,
    clearGuestCart,
    hasGuestCartItems: typeof window !== 'undefined' && getGuestCartItems().length > 0
  };
} 