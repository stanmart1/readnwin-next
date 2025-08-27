/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitize input for logging to prevent log injection
 */
export function sanitizeForLog(input: any): string {
  if (input === null || input === undefined) return 'null';
  
  const str = String(input);
  return str
    .replace(/[\r\n]/g, ' ') // Remove newlines
    .replace(/[\x00-\x1f\x7f]/g, '') // Remove control characters
    .substring(0, 200); // Limit length
}

/**
 * Sanitize HTML output to prevent XSS
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Validate and sanitize numeric input
 */
export function sanitizeNumber(input: any, defaultValue: number = 0): number {
  const num = Number(input);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Validate and sanitize integer input
 */
export function sanitizeInt(input: any, defaultValue: number = 0): number {
  const num = parseInt(String(input), 10);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Safe JSON parse
 */
export function safeJsonParse(input: string, defaultValue: any = null): any {
  try {
    return JSON.parse(input);
  } catch {
    return defaultValue;
  }
}