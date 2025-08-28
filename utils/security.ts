// Security utilities for sanitization
export class SecurityUtils {
  // Sanitize HTML content to prevent XSS
  static sanitizeHTML(html: string): string {
    if (typeof window === 'undefined') return html;
    
    // Create a temporary div to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Remove script tags and event handlers
    const scripts = temp.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // Remove dangerous attributes
    const allElements = temp.querySelectorAll('*');
    allElements.forEach(element => {
      const dangerousAttrs = ['onload', 'onerror', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'];
      dangerousAttrs.forEach(attr => {
        if (element.hasAttribute(attr)) {
          element.removeAttribute(attr);
        }
      });
      
      // Remove javascript: URLs
      ['href', 'src', 'action'].forEach(attr => {
        const value = element.getAttribute(attr);
        if (value && value.toLowerCase().startsWith('javascript:')) {
          element.removeAttribute(attr);
        }
      });
    });
    
    return temp.innerHTML;
  }
  
  // Sanitize log input to prevent log injection
  static sanitizeLogInput(input: any): string {
    if (typeof input !== 'string') {
      input = String(input);
    }
    
    // Remove newlines and carriage returns that could break log format
    return input.replace(/[\r\n\t]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  
  // Sanitize database input to prevent injection
  static sanitizeDBInput(input: any): any {
    if (typeof input === 'string') {
      // Basic sanitization - remove potential SQL/NoSQL injection patterns
      return input.replace(/['"\\;]/g, '').trim();
    }
    return input;
  }
  
  // Validate and sanitize book ID
  static validateBookId(bookId: any): string | null {
    if (typeof bookId !== 'string') return null;
    
    // Only allow alphanumeric characters and hyphens
    const sanitized = bookId.replace(/[^a-zA-Z0-9-]/g, '');
    return sanitized.length > 0 ? sanitized : null;
  }
}

// Export individual functions for backward compatibility
export const sanitizeForLog = SecurityUtils.sanitizeLogInput;
export const sanitizeHtml = SecurityUtils.sanitizeHTML;

export function sanitizeInt(value: any, defaultValue: number = 0): number {
  if (typeof value === 'number') return Math.floor(value);
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

export function safeJsonParse(jsonString: string, defaultValue: any = null): any {
  try {
    return JSON.parse(jsonString);
  } catch {
    return defaultValue;
  }
}