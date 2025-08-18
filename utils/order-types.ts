// Order Status Management Types

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PAYMENT_PROCESSING = 'payment_processing',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PAYMENT_FAILED = 'payment_failed',
  CANCELED = 'canceled'
}

export interface OrderStatusTransition {
  from: OrderStatus;
  to: OrderStatus;
  allowed: boolean;
  requiresNote?: boolean;
  requiresPayment?: boolean;
}

export interface OrderStatusHistory {
  id: number;
  order_id: number;
  status: OrderStatus;
  notes?: string;
  created_at: Date;
  created_by?: number;
}

export interface OrderNote {
  id: number;
  order_id: number;
  user_id?: number;
  note: string;
  is_internal: boolean;
  note_type: string;
  created_at: Date;
}



// Order Status Transition Rules
export const ORDER_STATUS_TRANSITIONS: OrderStatusTransition[] = [
  // Initial state
  { from: OrderStatus.PENDING, to: OrderStatus.CONFIRMED, allowed: true },
  { from: OrderStatus.PENDING, to: OrderStatus.CANCELLED, allowed: true, requiresNote: true },
  
  // Confirmed state - can move to payment processing
  { from: OrderStatus.CONFIRMED, to: OrderStatus.PAYMENT_PROCESSING, allowed: true },
  { from: OrderStatus.CONFIRMED, to: OrderStatus.CANCELLED, allowed: true, requiresNote: true },
  
  // Payment processing state
  { from: OrderStatus.PAYMENT_PROCESSING, to: OrderStatus.PAID, allowed: true },
  { from: OrderStatus.PAYMENT_PROCESSING, to: OrderStatus.CANCELLED, allowed: true, requiresNote: true },
  
  // Paid state - can move to processing
  { from: OrderStatus.PAID, to: OrderStatus.PROCESSING, allowed: true },
  { from: OrderStatus.PAID, to: OrderStatus.CANCELLED, allowed: true, requiresNote: true },
  
  // Processing state
  { from: OrderStatus.PROCESSING, to: OrderStatus.SHIPPED, allowed: true, requiresNote: true },
  { from: OrderStatus.PROCESSING, to: OrderStatus.CANCELLED, allowed: true, requiresNote: true },
  
  // Shipped state
  { from: OrderStatus.SHIPPED, to: OrderStatus.DELIVERED, allowed: true },
  { from: OrderStatus.SHIPPED, to: OrderStatus.CANCELLED, allowed: true, requiresNote: true },
  
  // Final states (no further transitions)
  { from: OrderStatus.DELIVERED, to: OrderStatus.REFUNDED, allowed: true, requiresNote: true },
  { from: OrderStatus.CANCELLED, to: OrderStatus.REFUNDED, allowed: true, requiresNote: true },
];

// Order Status Display Names
export const ORDER_STATUS_DISPLAY_NAMES: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pending',
  [OrderStatus.CONFIRMED]: 'Confirmed',
  [OrderStatus.PAYMENT_PROCESSING]: 'Payment Processing',
  [OrderStatus.PAID]: 'Paid',
  [OrderStatus.PROCESSING]: 'Processing',
  [OrderStatus.SHIPPED]: 'Shipped',
  [OrderStatus.DELIVERED]: 'Delivered',
  [OrderStatus.CANCELLED]: 'Cancelled',
  [OrderStatus.REFUNDED]: 'Refunded',
  [OrderStatus.PAYMENT_FAILED]: 'Payment Failed',
  [OrderStatus.CANCELED]: 'Canceled'
};

// Order Status Colors (for UI)
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
  [OrderStatus.PAYMENT_PROCESSING]: 'bg-orange-100 text-orange-800',
  [OrderStatus.PAID]: 'bg-green-100 text-green-800',
  [OrderStatus.PROCESSING]: 'bg-purple-100 text-purple-800',
  [OrderStatus.SHIPPED]: 'bg-indigo-100 text-indigo-800',
  [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
  [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
  [OrderStatus.REFUNDED]: 'bg-gray-100 text-gray-800',
  [OrderStatus.PAYMENT_FAILED]: 'bg-red-100 text-red-800',
  [OrderStatus.CANCELED]: 'bg-red-100 text-red-800'
};

// Order Status Icons (for UI)
export const ORDER_STATUS_ICONS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: '⏳',
  [OrderStatus.CONFIRMED]: '✅',
  [OrderStatus.PAYMENT_PROCESSING]: '💳',
  [OrderStatus.PAID]: '💰',
  [OrderStatus.PROCESSING]: '⚙️',
  [OrderStatus.SHIPPED]: '📦',
  [OrderStatus.DELIVERED]: '🎉',
  [OrderStatus.CANCELLED]: '❌',
  [OrderStatus.REFUNDED]: '💸',
  [OrderStatus.PAYMENT_FAILED]: '❌',
  [OrderStatus.CANCELED]: '❌'
};

// Helper functions
export function isValidStatusTransition(from: OrderStatus, to: OrderStatus): boolean {
  const transition = ORDER_STATUS_TRANSITIONS.find(t => t.from === from && t.to === to);
  return transition?.allowed || false;
}

export function getStatusTransitions(currentStatus: OrderStatus): OrderStatus[] {
  return ORDER_STATUS_TRANSITIONS
    .filter(t => t.from === currentStatus && t.allowed)
    .map(t => t.to);
}

export function requiresNoteForTransition(from: OrderStatus, to: OrderStatus): boolean {
  const transition = ORDER_STATUS_TRANSITIONS.find(t => t.from === from && t.to === to);
  return transition?.requiresNote || false;
}

export function requiresPaymentForTransition(from: OrderStatus, to: OrderStatus): boolean {
  const transition = ORDER_STATUS_TRANSITIONS.find(t => t.from === from && t.to === to);
  return transition?.requiresPayment || false;
}

 