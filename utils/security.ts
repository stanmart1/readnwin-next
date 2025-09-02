import path from 'path';
import { createHash } from 'crypto';

/**
 * Security utilities for XSS prevention, path traversal protection, and log sanitization
 */

// XSS Protection
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Alias for sanitizeHtml
export const sanitizeForXSS = sanitizeHtml;
export const sanitizeLogInput = sanitizeLog;

export function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeHtml(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}

export function sanitizeApiObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    // Don't sanitize URLs or file paths
    if (obj.startsWith('/') || obj.startsWith('http') || obj.includes('uploads/')) {
      return obj;
    }
    return sanitizeHtml(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeApiObject);
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Don't sanitize URL fields
      if (key.includes('url') || key.includes('path') || key.includes('image')) {
        sanitized[key] = value;
      } else {
        sanitized[key] = sanitizeApiObject(value);
      }
    }
    return sanitized;
  }
  
  return obj;
}

// Path Traversal Protection
export function sanitizePath(filename: string, allowedDir?: string): string {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Invalid filename');
  }
  
  // Remove path traversal sequences
  const sanitized = path.basename(filename.replace(/\.\./g, ''));
  
  if (!sanitized || sanitized === '.' || sanitized === '..') {
    throw new Error('Invalid filename');
  }
  
  if (allowedDir) {
    const fullPath = path.resolve(allowedDir, sanitized);
    const normalizedAllowedDir = path.resolve(allowedDir);
    
    if (!fullPath.startsWith(normalizedAllowedDir + path.sep) && fullPath !== normalizedAllowedDir) {
      throw new Error('Path traversal detected');
    }
  }
  
  return sanitized;
}

export function validateFilePath(filePath: string, baseDir: string): string {
  const resolvedPath = path.resolve(baseDir, filePath);
  const normalizedBase = path.resolve(baseDir);
  
  if (!resolvedPath.startsWith(normalizedBase + path.sep) && resolvedPath !== normalizedBase) {
    throw new Error('Invalid file path');
  }
  
  return resolvedPath;
}

// Log Injection Protection
export function sanitizeLog(input: any): string {
  if (input === null || input === undefined) return 'null';
  
  let logString: string;
  
  if (input instanceof Error) {
    logString = JSON.stringify({
      message: input.message,
      stack: input.stack,
      name: input.name
    });
  } else if (typeof input === 'object') {
    try {
      logString = JSON.stringify(input);
    } catch (e) {
      // Handle circular references or non-serializable objects
      logString = String(input);
    }
  } else {
    logString = String(input);
  }
  
  // Remove or encode dangerous characters
  return logString
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t')
    .replace(/[\x00-\x1f\x7f-\x9f]/g, ''); // Remove control characters
}

// Safe logging wrapper
export const safeLog = {
  info: (message: string, data?: any) => {
    console.log(sanitizeLog(message), data ? sanitizeLog(data) : '');
  },
  error: (message: string, error?: any) => {
    if (error instanceof Error) {
      console.error(sanitizeLog(message), {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    } else {
      console.error(sanitizeLog(message), error ? sanitizeLog(error) : '');
    }
  },
  warn: (message: string, data?: any) => {
    console.warn(sanitizeLog(message), data ? sanitizeLog(data) : '');
  },
  debug: (message: string, data?: any) => {
    console.debug(sanitizeLog(message), data ? sanitizeLog(data) : '');
  }
};

// Input validation helpers
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateId(id: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(id) && id.length <= 50;
}

export function sanitizeInt(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  const parsed = parseInt(String(value), 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Response sanitization for API endpoints
export function sanitizeApiResponse(data: any): any {
  return sanitizeApiObject(data);
}

// SecurityUtils object for compatibility
export const SecurityUtils = {
  sanitizeHtml,
  sanitizeForXSS,
  sanitizeLogInput,
  sanitizeObject,
  sanitizePath,
  validateFilePath,
  sanitizeLog,
  safeLog,
  validateEmail,
  validateId,
  sanitizeInt,
  sanitizeApiResponse
};