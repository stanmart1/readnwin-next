'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSecureCart } from '@/contexts/SecureCartContext';
import { safeLog } from '@/utils/security';

/**
 * Hook to handle cart integration with other systems
 * - Order completion
 * - Library sync
 * - Payment processing
 */
export function useCartIntegration() {
  const { data: session } = useSession();
  const { clearCart, refreshCart } = useSecureCart();

  // Clear cart after successful order
  const clearCartAfterOrder = async (orderId: number) => {
    try {
      await clearCart();
      safeLog.info('Cart cleared after order completion', { orderId });
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('cart-cleared', { 
        detail: { orderId, reason: 'order-completed' }
      }));
    } catch (error) {
      safeLog.error('Failed to clear cart after order:', error);
    }
  };

  // Sync cart with server after login
  const syncCartAfterLogin = async () => {
    try {
      await refreshCart();
      safeLog.info('Cart synced after login');
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('cart-synced', { 
        detail: { reason: 'login' }
      }));
    } catch (error) {
      safeLog.error('Failed to sync cart after login:', error);
    }
  };

  // Handle guest cart transfer
  const transferGuestCart = async (guestCartItems: any[]) => {
    if (!session?.user?.id || guestCartItems.length === 0) {
      return;
    }

    try {
      // Transfer items from guest cart to user cart
      const response = await fetch('/api/cart/transfer-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestItems: guestCartItems })
      });

      if (response.ok) {
        await refreshCart();
        safeLog.info('Guest cart transferred successfully');
        
        // Clear guest cart from localStorage
        localStorage.removeItem('guestCart');
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('guest-cart-transferred', {
          detail: { itemCount: guestCartItems.length }
        }));
      }
    } catch (error) {
      safeLog.error('Failed to transfer guest cart:', error);
    }
  };

  // Listen for session changes to sync cart
  useEffect(() => {
    if (session?.user?.id) {
      syncCartAfterLogin();
      
      // Check for guest cart items to transfer
      const guestCartItems = localStorage.getItem('guestCart');
      if (guestCartItems) {
        try {
          const items = JSON.parse(guestCartItems);
          transferGuestCart(items);
        } catch (error) {
          safeLog.error('Failed to parse guest cart items:', error);
        }
      }
    }
  }, [session?.user?.id]);

  // Listen for cart events from other parts of the app
  useEffect(() => {
    const handleOrderCompleted = (event: CustomEvent) => {
      const { orderId } = event.detail;
      clearCartAfterOrder(orderId);
    };

    const handleCartRefresh = () => {
      refreshCart();
    };

    window.addEventListener('order-completed', handleOrderCompleted as EventListener);
    window.addEventListener('cart-refresh-requested', handleCartRefresh);

    return () => {
      window.removeEventListener('order-completed', handleOrderCompleted as EventListener);
      window.removeEventListener('cart-refresh-requested', handleCartRefresh);
    };
  }, []);

  return {
    clearCartAfterOrder,
    syncCartAfterLogin,
    transferGuestCart
  };
}