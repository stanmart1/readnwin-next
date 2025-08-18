/**
 * Currency formatting utilities for Nigerian Naira
 */

/**
 * Format a number as Nigerian Naira currency
 * @param amount - The amount to format
 * @param options - Optional formatting options
 * @returns Formatted currency string
 */
export const formatNaira = (
  amount: number, 
  options: {
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
) => {
  const {
    showSymbol = true,
    minimumFractionDigits = 0,
    maximumFractionDigits = 0
  } = options;

  if (showSymbol) {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);
  } else {
    return new Intl.NumberFormat('en-NG', {
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);
  }
};

/**
 * Format a number as Nigerian Naira with symbol only (no decimals)
 * @param amount - The amount to format
 * @returns Formatted currency string with ₦ symbol
 */
export const formatNairaSimple = (amount: number): string => {
  return `₦${amount.toLocaleString('en-NG')}`;
};

/**
 * Parse a Naira amount string back to a number
 * @param amountString - The formatted amount string
 * @returns The numeric amount
 */
export const parseNaira = (amountString: string): number => {
  // Remove currency symbol and commas, then parse
  const cleanString = amountString.replace(/[₦,\s]/g, '');
  return parseFloat(cleanString) || 0;
};

/**
 * Calculate VAT (Value Added Tax) for Nigeria (7.5%)
 * @param amount - The base amount
 * @returns The VAT amount
 */
export const calculateVAT = (amount: number): number => {
  return amount * 0.075;
};

/**
 * Calculate total with VAT included
 * @param amount - The base amount
 * @returns The total amount including VAT
 */
export const calculateTotalWithVAT = (amount: number): number => {
  return amount + calculateVAT(amount);
};

/**
 * Format a price range (e.g., ₦1,000 - ₦2,000)
 * @param minAmount - Minimum amount
 * @param maxAmount - Maximum amount
 * @returns Formatted price range string
 */
export const formatPriceRange = (minAmount: number, maxAmount: number): string => {
  return `${formatNairaSimple(minAmount)} - ${formatNairaSimple(maxAmount)}`;
};

/**
 * Format a discount percentage
 * @param originalPrice - Original price
 * @param discountedPrice - Discounted price
 * @returns Formatted discount percentage
 */
export const formatDiscountPercentage = (originalPrice: number, discountedPrice: number): string => {
  const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
  return `${Math.round(discount)}% OFF`;
};

/**
 * Format savings amount
 * @param originalPrice - Original price
 * @param discountedPrice - Discounted price
 * @returns Formatted savings string
 */
export const formatSavings = (originalPrice: number, discountedPrice: number): string => {
  const savings = originalPrice - discountedPrice;
  return `Save ${formatNairaSimple(savings)}`;
}; 