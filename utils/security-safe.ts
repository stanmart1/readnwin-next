// Safe security utilities with backwards compatibility
import crypto from 'crypto';

// Safe log sanitization - removes newlines and control characters
export function sanitizeLogInput(input: any): string {
  if (input === null || input === undefined) return 'null';
  
  const str = typeof input === 'string' ? input : JSON.stringify(input);
  return str.replace(/[\r\n\t\x00-\x1f\x7f-\x9f]/g, ' ').substring(0, 1000);
}

// Safe HTML sanitization for display
export function sanitizeHtmlSafe(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Time-safe string comparison
export function timeSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  
  const bufferA = Buffer.from(a, 'utf8');
  const bufferB = Buffer.from(b, 'utf8');
  
  return crypto.timingSafeEqual(bufferA, bufferB);
}

// Safe path validation
export function validatePath(filePath: string, allowedDir: string): boolean {
  const path = require('path');
  const resolvedPath = path.resolve(filePath);
  const resolvedAllowedDir = path.resolve(allowedDir);
  
  return resolvedPath.startsWith(resolvedAllowedDir);
}

// Basic input validation
export function validateInput(value: any, type: 'string' | 'number' | 'email' | 'id'): boolean {
  if (value === null || value === undefined) return false;
  
  switch (type) {
    case 'string':
      return typeof value === 'string' && value.length > 0 && value.length < 10000;
    case 'number':
      return typeof value === 'number' && !isNaN(value) && isFinite(value);
    case 'email':
      return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    case 'id':
      return Number.isInteger(Number(value)) && Number(value) > 0;
    default:
      return false;
  }
}