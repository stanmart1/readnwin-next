/**
 * Checkout Integration Utilities
 * Handles integration between checkout flow and existing e-commerce components
 */

export interface CheckoutRedirectOptions {
  paymentMethod: 'flutterwave' | 'bank_transfer';
  orderId: number;
  orderNumber: string;
  bankTransferId?: number;
  paymentUrl?: string;
  userId: number;
}

/**
 * Handles post-checkout redirects based on payment method and order status
 */
export function handlePostCheckoutRedirect(options: CheckoutRedirectOptions): string {
  const { paymentMethod, orderId, bankTransferId, paymentUrl } = options;

  switch (paymentMethod) {
    case 'flutterwave':
      if (paymentUrl) {
        // Redirect to Flutterwave payment page
        return paymentUrl;
      }
      // Fallback to order confirmation if no payment URL
      return `/order-confirmation-enhanced/${orderId}`;

    case 'bank_transfer':
      if (bankTransferId) {
        // Redirect to bank transfer page with order tracking
        return `/payment/bank-transfer/${bankTransferId}?orderId=${orderId}`;
      }
      // Fallback to order confirmation
      return `/order-confirmation-enhanced/${orderId}`;

    default:
      return `/order-confirmation-enhanced/${orderId}`;
  }
}

/**
 * Determines the next steps after order creation based on order contents
 */
export interface OrderAnalysis {
  hasEbooks: boolean;
  hasPhysicalBooks: boolean;
  isEbookOnly: boolean;
  isPhysicalOnly: boolean;
  isMixedCart: boolean;
  nextSteps: string[];
  redirectPath: string;
}

export function analyzeOrderNextSteps(
  orderId: number,
  orderItems: any[],
  paymentMethod: string,
  paymentStatus: string
): OrderAnalysis {
  const hasEbooks = orderItems.some(item => 
    item.format === 'ebook' || item.format === 'both'
  );
  
  const hasPhysicalBooks = orderItems.some(item => 
    item.format === 'physical' || item.format === 'both'
  );

  const isEbookOnly = hasEbooks && !hasPhysicalBooks;
  const isPhysicalOnly = hasPhysicalBooks && !hasEbooks;
  const isMixedCart = hasEbooks && hasPhysicalBooks;

  const nextSteps: string[] = [];
  let redirectPath = `/order-confirmation-enhanced/${orderId}`;

  // Determine next steps based on order contents and payment status
  if (paymentStatus === 'paid' || paymentStatus === 'confirmed') {
    if (hasEbooks) {
      nextSteps.push('Access your eBooks in your digital library');
      redirectPath = `/dashboard/library?highlight=recent`;
    }
    if (hasPhysicalBooks) {
      nextSteps.push('Track your physical book shipment');
      if (!hasEbooks) {
        redirectPath = `/order/${orderId}/tracking`;
      }
    }
  } else if (paymentMethod === 'bank_transfer') {
    nextSteps.push('Upload proof of payment to complete your order');
    nextSteps.push('Order will be processed after payment verification');
  } else {
    nextSteps.push('Complete payment to access your order');
  }

  return {
    hasEbooks,
    hasPhysicalBooks,
    isEbookOnly,
    isPhysicalOnly,
    isMixedCart,
    nextSteps,
    redirectPath
  };
}

/**
 * Handles cart cleanup after successful order
 */
export async function handlePostOrderCartCleanup(userId: number): Promise<void> {
  try {
    const response = await fetch('/api/cart/clear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      console.warn('Failed to clear cart after order completion');
    }
  } catch (error) {
    console.error('Error clearing cart after order:', error);
  }
}

/**
 * Handles eBook library integration after successful payment
 */
export async function triggerEbookLibraryUpdate(orderId: number): Promise<void> {
  try {
    const response = await fetch(`/api/orders/${orderId}/process-ebooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Failed to process eBooks for library update');
    }
  } catch (error) {
    console.error('Error processing eBooks for library:', error);
  }
}

/**
 * Integrates with existing order management system
 */
export interface OrderIntegrationData {
  orderId: number;
  userId: number;
  paymentMethod: string;
  paymentStatus: string;
  orderItems: any[];
}

export async function integrateWithOrderManagement(data: OrderIntegrationData): Promise<void> {
  const { orderId, userId, paymentMethod, paymentStatus, orderItems } = data;

  try {
    // 1. Handle eBook library integration
    const hasEbooks = orderItems.some(item => 
      item.format === 'ebook' || item.format === 'both'
    );

    if (hasEbooks && (paymentStatus === 'paid' || paymentStatus === 'confirmed')) {
      await triggerEbookLibraryUpdate(orderId);
    }

    // 2. Handle cart cleanup
    await handlePostOrderCartCleanup(userId);

    // 3. Send order confirmation notification
    await fetch('/api/orders/send-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId }),
    });

    // 4. Update user's purchase history cache if needed
    await fetch(`/api/users/${userId}/refresh-purchase-history`, {
      method: 'POST',
    });

  } catch (error) {
    console.error('Error in order management integration:', error);
  }
}

/**
 * Payment method specific integration handlers
 */
export const PaymentIntegrationHandlers = {
  flutterwave: {
    onSuccess: async (orderId: number, paymentData: any) => {
      console.log('Flutterwave payment successful for order:', orderId);
      // Handle Flutterwave-specific success logic
      await integrateWithOrderManagement({
        orderId,
        userId: paymentData.userId,
        paymentMethod: 'flutterwave',
        paymentStatus: 'paid',
        orderItems: paymentData.orderItems || []
      });
    },
    
    onFailure: async (orderId: number, error: any) => {
      console.error('Flutterwave payment failed for order:', orderId, error);
      // Handle payment failure
    }
  },

  bank_transfer: {
    onInitiated: async (orderId: number, bankTransferId: number) => {
      console.log('Bank transfer initiated for order:', orderId);
      // Update order status to payment_processing
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          payment_status: 'payment_processing',
          notes: 'Bank transfer initiated, waiting for proof upload'
        }),
      });
    },

    onProofUploaded: async (orderId: number, bankTransferId: number) => {
      console.log('Payment proof uploaded for order:', orderId);
      // Notify admins about proof upload for verification
      await fetch('/api/admin/notifications/payment-proof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, bankTransferId }),
      });
    },

    onVerified: async (orderId: number, paymentData: any) => {
      console.log('Bank transfer verified for order:', orderId);
      // Handle bank transfer verification
      await integrateWithOrderManagement({
        orderId,
        userId: paymentData.userId,
        paymentMethod: 'bank_transfer',
        paymentStatus: 'paid',
        orderItems: paymentData.orderItems || []
      });
    }
  }
};

/**
 * Guest cart to user conversion integration
 */
export async function handleGuestCartConversion(guestCartData: any, userId: number): Promise<void> {
  try {
    const response = await fetch('/api/cart/convert-guest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        guestCartData,
        userId
      }),
    });

    if (!response.ok) {
      console.warn('Failed to convert guest cart to user cart');
    }
  } catch (error) {
    console.error('Error converting guest cart:', error);
  }
} 