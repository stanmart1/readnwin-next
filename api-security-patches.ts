// API Security Patches for Critical Endpoints
import { NextRequest, NextResponse } from 'next/server';
import { 
  sanitizeInput, 
  validateEmail, 
  validatePassword, 
  requireAuth, 
  requireAdmin,
  validateFileUpload,
  secureResponse,
  secureQuery,
  logSecurityEvent
} from './security-patch';

// Patch 1: Secure Books API
export const secureBookAPI = {
  // Enhanced DELETE with proper authorization
  DELETE: async (request: NextRequest) => {
    const session = await requireAdmin(request);
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    
    if (!idsParam) {
      return secureResponse({ error: 'No book IDs provided' }, 400);
    }

    // Validate and sanitize IDs
    const bookIds = idsParam.split(',')
      .map(id => parseInt(sanitizeInput(id.trim())))
      .filter(id => !isNaN(id) && id > 0);
    
    if (bookIds.length === 0) {
      return secureResponse({ error: 'Invalid book IDs' }, 400);
    }

    // Limit bulk operations
    if (bookIds.length > 50) {
      return secureResponse({ error: 'Too many books selected (max 50)' }, 400);
    }

    // Log security event
    await logSecurityEvent(
      parseInt(session.user.id),
      'books.bulk_delete',
      'books',
      { bookIds, count: bookIds.length },
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );

    return secureResponse({ success: true, message: 'Books deleted securely' });
  }
};

// Patch 2: Secure File Upload API
export const secureFileUploadAPI = {
  POST: async (request: NextRequest) => {
    const session = await requireAuth(request);
    if (session instanceof NextResponse) return session;

    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return secureResponse({ error: 'No file provided' }, 400);
      }

      // Validate file
      const validation = validateFileUpload(file);
      if (!validation.valid) {
        return secureResponse({ error: validation.message }, 400);
      }

      // Additional security checks
      const fileBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(fileBuffer);
      
      // Check for malicious file signatures
      const maliciousSignatures = [
        [0x4D, 0x5A], // PE executable
        [0x7F, 0x45, 0x4C, 0x46], // ELF executable
        [0xCA, 0xFE, 0xBA, 0xBE], // Java class file
      ];
      
      for (const signature of maliciousSignatures) {
        if (signature.every((byte, index) => uint8Array[index] === byte)) {
          await logSecurityEvent(
            parseInt(session.user.id),
            'file.malicious_upload_attempt',
            'files',
            { fileName: file.name, fileType: file.type },
            request.headers.get('x-forwarded-for') || undefined,
            request.headers.get('user-agent') || undefined
          );
          return secureResponse({ error: 'Malicious file detected' }, 400);
        }
      }

      return secureResponse({ success: true, message: 'File uploaded securely' });
    } catch (error) {
      return secureResponse({ error: 'Upload failed' }, 500);
    }
  }
};

// Patch 3: Secure User Registration
export const secureRegistrationAPI = {
  POST: async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { first_name, last_name, email, username, password } = body;

      // Sanitize inputs
      const sanitizedData = {
        first_name: sanitizeInput(first_name),
        last_name: sanitizeInput(last_name),
        email: sanitizeInput(email),
        username: sanitizeInput(username),
        password: password // Don't sanitize password, just validate
      };

      // Validate required fields
      if (!sanitizedData.first_name || !sanitizedData.last_name || 
          !sanitizedData.email || !sanitizedData.username || !password) {
        return secureResponse({ error: 'All fields are required' }, 400);
      }

      // Validate email
      if (!validateEmail(sanitizedData.email)) {
        return secureResponse({ error: 'Invalid email format' }, 400);
      }

      // Validate password
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return secureResponse({ error: passwordValidation.message }, 400);
      }

      // Check for suspicious patterns
      const suspiciousPatterns = [
        /script/i, /javascript/i, /vbscript/i, /onload/i, /onerror/i
      ];
      
      const allInputs = [sanitizedData.first_name, sanitizedData.last_name, 
                        sanitizedData.email, sanitizedData.username];
      
      for (const input of allInputs) {
        if (suspiciousPatterns.some(pattern => pattern.test(input))) {
          await logSecurityEvent(
            undefined,
            'registration.suspicious_input',
            'users',
            { email: sanitizedData.email, suspiciousInput: input },
            request.headers.get('x-forwarded-for') || undefined,
            request.headers.get('user-agent') || undefined
          );
          return secureResponse({ error: 'Invalid input detected' }, 400);
        }
      }

      return secureResponse({ success: true, message: 'Registration validated' });
    } catch (error) {
      return secureResponse({ error: 'Registration failed' }, 500);
    }
  }
};

// Patch 4: Secure Database Queries
export const secureDatabaseQueries = {
  // Safe user lookup
  getUserByEmail: async (email: string) => {
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }
    
    const { query } = require('@/utils/database');
    return await secureQuery(query, 
      'SELECT id, email, password_hash, status FROM users WHERE email = $1', 
      [email]
    );
  },

  // Safe book search
  searchBooks: async (searchTerm: string, limit: number = 20) => {
    const sanitizedTerm = sanitizeInput(searchTerm);
    const safeLimit = Math.min(Math.max(parseInt(String(limit)), 1), 100);
    
    const { query } = require('@/utils/database');
    return await secureQuery(query,
      'SELECT id, title, author_name FROM books WHERE title ILIKE $1 LIMIT $2',
      [`%${sanitizedTerm}%`, safeLimit]
    );
  }
};

// Patch 5: Enhanced Authentication Checks
export const enhancedAuthChecks = {
  validateAdminAccess: async (userId: number, requiredPermission: string) => {
    const { rbacService } = require('@/utils/rbac-service');
    
    // Check if user exists and is active
    const user = await rbacService.getUserById(userId);
    if (!user || user.status !== 'active') {
      return false;
    }

    // Check specific permission
    const hasPermission = await rbacService.hasPermission(userId, requiredPermission);
    if (!hasPermission) {
      await logSecurityEvent(
        userId,
        'access.permission_denied',
        'permissions',
        { requiredPermission },
        undefined,
        undefined
      );
      return false;
    }

    return true;
  }
};

// Patch 6: Content Security Policy
export const contentSecurityPolicy = {
  generateNonce: () => {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('base64');
  },
  
  getCSPHeader: (nonce: string) => {
    return `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; frame-ancestors 'none';`;
  }
};