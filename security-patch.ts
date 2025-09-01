// Security Patch for ReadnWin Application
// This patch addresses critical security vulnerabilities

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import rateLimit from 'express-rate-limit';

// 1. Input Validation & Sanitization
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .substring(0, 1000); // Limit length
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Password must contain uppercase, lowercase, and number' };
  }
  return { valid: true };
};

// 2. Path Traversal Protection
export const validateFilePath = (path: string): boolean => {
  if (!path) return false;
  const normalizedPath = path.replace(/\\/g, '/');
  return !normalizedPath.includes('../') && 
         !normalizedPath.includes('..\\') &&
         !normalizedPath.startsWith('/') &&
         !/[<>:"|?*]/.test(normalizedPath);
};

// 3. SQL Injection Protection (Enhanced)
export const validateSqlParams = (params: unknown[]): boolean => {
  return params.every(param => {
    if (typeof param === 'string') {
      return !param.includes('--') && 
             !param.includes(';') && 
             !param.includes('/*') &&
             !param.includes('*/') &&
             !param.includes('xp_') &&
             !param.includes('sp_');
    }
    return true;
  });
};

// 4. Rate Limiting Configuration
export const createRateLimit = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// 5. Authentication & Authorization Middleware
export const requireAuth = async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session;
};

export const requireAdmin = async (request: NextRequest) => {
  const session = await requireAuth(request);
  if (session instanceof NextResponse) return session;
  
  if (!['admin', 'super_admin'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  return session;
};

// 6. File Upload Security
export const validateFileUpload = (file: File): { valid: boolean; message?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/epub+zip'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, message: 'Invalid file type' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, message: 'File too large (max 10MB)' };
  }
  
  // Check for malicious file names
  if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
    return { valid: false, message: 'Invalid file name' };
  }
  
  return { valid: true };
};

// 7. CSRF Protection
export const validateCSRFToken = (request: NextRequest): boolean => {
  const token = request.headers.get('x-csrf-token');
  const sessionToken = request.headers.get('x-session-token');
  return token === sessionToken;
};

// 8. Content Security Policy Headers
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; frame-ancestors 'none';",
};

// 9. Secure Response Helper
export const secureResponse = (data: unknown, status: number = 200) => {
  return NextResponse.json(data, { 
    status,
    headers: securityHeaders
  });
};

// 10. Error Handling (Prevent Information Disclosure)
export const handleSecureError = (error: unknown, isDevelopment: boolean = false) => {
  console.error('Security Error:', error);
  
  if (isDevelopment) {
    return secureResponse({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
  
  return secureResponse({ 
    error: 'Internal server error' 
  }, 500);
};

// 11. Database Query Security Wrapper
export const secureQuery = async (query: (text: string, params: unknown[]) => Promise<unknown>, text: string, params: unknown[] = []) => {
  // Validate parameters
  if (!validateSqlParams(params)) {
    throw new Error('Invalid SQL parameters detected');
  }
  
  // Log query for monitoring
  console.log('Executing secure query:', { 
    query: text.substring(0, 100) + '...',
    paramCount: params.length 
  });
  
  return await query(text, params);
};

// 12. Session Security
export const validateSession = (session: { user?: { id?: string; status?: string }; expires?: string }): boolean => {
  if (!session?.user?.id) return false;
  
  // Check session expiry
  const now = new Date();
  const sessionTime = new Date(session.expires);
  if (now > sessionTime) return false;
  
  // Validate user status
  if (!['active', 'verified'].includes(session.user.status)) return false;
  
  return true;
};

// 13. API Endpoint Security Wrapper
export const secureEndpoint = (handler: Function) => {
  return async (request: NextRequest, context?: unknown) => {
    try {
      // Add security headers
      const response = await handler(request, context);
      
      if (response instanceof NextResponse) {
        Object.entries(securityHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      }
      
      return response;
    } catch (error) {
      return handleSecureError(error, process.env.NODE_ENV === 'development');
    }
  };
};

// 14. Password Security
export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = require('bcryptjs');
  return await bcrypt.hash(password, 12); // Increased salt rounds
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(password, hash);
};

// 15. Audit Logging
export const logSecurityEvent = async (
  userId: number | undefined,
  action: string,
  resource: string,
  details: Record<string, unknown>,
  ip?: string,
  userAgent?: string
) => {
  try {
    const { query } = require('@/utils/database');
    await query(`
      INSERT INTO audit_logs (user_id, action, resource, details, ip_address, user_agent, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, [userId, action, resource, JSON.stringify(details), ip, userAgent]);
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};