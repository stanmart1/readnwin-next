/**
 * Timezone utilities for Nigerian timezone (UTC+1)
 */

// Nigerian timezone
export const NIGERIA_TIMEZONE = 'Africa/Lagos';

/**
 * Get current date/time in Nigerian timezone
 */
export function getNigeriaTime(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: NIGERIA_TIMEZONE }));
}

/**
 * Convert a date to Nigerian timezone
 */
export function toNigeriaTime(date: Date | string): Date {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return new Date(date.toLocaleString('en-US', { timeZone: NIGERIA_TIMEZONE }));
}

/**
 * Format date for database storage (ensures Nigerian timezone)
 */
export function formatForDatabase(date: Date | string): string {
  const nigeriaDate = toNigeriaTime(date);
  return nigeriaDate.toISOString();
}

/**
 * Get current timestamp for database operations
 */
export function getCurrentTimestamp(): string {
  return formatForDatabase(new Date());
}

/**
 * Format date for display in Nigerian timezone
 */
export function formatForDisplay(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const nigeriaDate = toNigeriaTime(date);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: NIGERIA_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  };
  return nigeriaDate.toLocaleString('en-US', defaultOptions);
}

/**
 * Get date range for analytics (ensures Nigerian timezone)
 */
export function getDateRange(period: 'day' | 'week' | 'month' | 'year' = 'week') {
  const now = getNigeriaTime();
  const startDate = new Date(now);
  
  switch (period) {
    case 'day':
      startDate.setDate(now.getDate() - 1);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  return {
    startDate: formatForDatabase(startDate),
    endDate: formatForDatabase(now)
  };
} 