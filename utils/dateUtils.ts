import { formatDistanceToNow, isValid, parseISO } from 'date-fns';

/**
 * Safely formats a date string to a relative time format
 * @param dateString - The date string to format
 * @param fallback - Fallback text if date is invalid
 * @returns Formatted relative time string
 */
export function safeFormatDistanceToNow(
  dateString: string | null | undefined,
  fallback: string = 'Unknown time'
): string {
  try {
    if (!dateString) return fallback;
    
    // Try parsing as ISO string first
    let date = parseISO(dateString);
    
    // If ISO parsing fails, try regular Date constructor
    if (!isValid(date)) {
      date = new Date(dateString);
    }
    
    // If still invalid, return fallback
    if (!isValid(date)) {
      return fallback;
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.warn('Error formatting date:', error, 'Date string:', dateString);
    return fallback;
  }
}

/**
 * Validates if a date string is valid
 * @param dateString - The date string to validate
 * @returns True if valid, false otherwise
 */
export function isValidDateString(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}

/**
 * Safely converts a date string to ISO format
 * @param dateString - The date string to convert
 * @returns ISO string or current date ISO string if invalid
 */
export function safeToISOString(dateString: string | null | undefined): string {
  try {
    if (!dateString) return new Date().toISOString();
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    
    return date.toISOString();
  } catch {
    return new Date().toISOString();
  }
}