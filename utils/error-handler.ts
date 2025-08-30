import { NextResponse } from 'next/server';

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
  details?: any;
}

export const createApiError = (message: string, statusCode: number = 500, code?: string, details?: any): ApiError => ({
  message: sanitizeErrorMessage(message),
  code,
  statusCode,
  details: process.env.NODE_ENV === 'development' ? details : undefined
});

export const sanitizeErrorMessage = (message: string): string => {
  // Remove sensitive information from error messages
  return message
    .replace(/password/gi, '[REDACTED]')
    .replace(/secret/gi, '[REDACTED]')
    .replace(/key/gi, '[REDACTED]')
    .replace(/token/gi, '[REDACTED]')
    .replace(/\b\d{4,}\b/g, '[REDACTED]') // Remove numbers that might be IDs
    .substring(0, 200); // Limit message length
};

export const handleApiError = (error: any): NextResponse => {
  console.error('API Error:', {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    timestamp: new Date().toISOString()
  });

  if (error.code === '23505') { // PostgreSQL unique violation
    return NextResponse.json(
      { error: 'Resource already exists', code: 'DUPLICATE_RESOURCE' },
      { status: 409 }
    );
  }

  if (error.code === '23503') { // PostgreSQL foreign key violation
    return NextResponse.json(
      { error: 'Referenced resource not found', code: 'INVALID_REFERENCE' },
      { status: 400 }
    );
  }

  if (error.code === '23502') { // PostgreSQL not null violation
    return NextResponse.json(
      { error: 'Required field missing', code: 'MISSING_FIELD' },
      { status: 400 }
    );
  }

  // Default error response
  return NextResponse.json(
    { 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    },
    { status: 500 }
  );
};