import { useMemo } from 'react';
import { CartItem, ShippingMethod } from '@/types/ecommerce';

interface CartAnalytics {
  hasEbooks: boolean;
  hasPhysicalBooks: boolean;
  isEbookOnly: boolean;
  isPhysicalOnly: boolean;
  isMixedCart: boolean;
  totalItems: number;
  subtotal: number;
  estimatedShipping: number;
  tax: number;
  total: number;
}

export function useCartAnalytics(cartItems: CartItem[], selectedShippingMethod?: ShippingMethod): CartAnalytics {
  return useMemo(() => {
    if (!cartItems || cartItems.length === 0) {
      return {
        hasEbooks: false,
        hasPhysicalBooks: false,
        isEbookOnly: false,
        isPhysicalOnly: false,
        isMixedCart: false,
        totalItems: 0,
        subtotal: 0,
        estimatedShipping: 0,
        tax: 0,
        total: 0
      };
    }

    const ebooks = cartItems.filter(item => 
      item.book?.format === 'ebook' || item.book?.format === 'both'
    );
    const physicalBooks = cartItems.filter(item => 
      item.book?.format === 'physical' || item.book?.format === 'both'
    );

    const hasEbooks = ebooks.length > 0;
    const hasPhysicalBooks = physicalBooks.length > 0;
    const isEbookOnly = hasEbooks && !hasPhysicalBooks;
    const isPhysicalOnly = hasPhysicalBooks && !hasEbooks;
    const isMixedCart = hasEbooks && hasPhysicalBooks;

    const subtotal = cartItems.reduce((sum, item) => {
      return sum + ((parseFloat(item.book?.price || 0)) * parseInt(item.quantity || 0));
    }, 0);

    const estimatedShipping = isEbookOnly ? 0 : parseFloat(selectedShippingMethod?.base_cost || 0);
    const tax = Math.round(subtotal * 0.075); // 7.5% VAT
    const total = parseFloat(subtotal) + parseFloat(estimatedShipping) + parseFloat(tax);

    return {
      hasEbooks,
      hasPhysicalBooks,
      isEbookOnly,
      isPhysicalOnly,
      isMixedCart,
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      estimatedShipping,
      tax,
      total
    };
  }, [cartItems, selectedShippingMethod]);
}