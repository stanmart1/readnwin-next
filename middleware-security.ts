// Enhanced Security Middleware
import { NextRequest, NextResponse } from 'next/server';
import { securityHeaders, validateFilePath, createRateLimit } from './security-patch';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map();

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Apply security headers to all responses
  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Block suspicious paths
  if (pathname.includes('..') || pathname.includes('%2e%2e')) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  
  // Validate file paths for upload endpoints
  if (pathname.startsWith('/api/uploads/') || pathname.startsWith('/api/payment-proofs/')) {
    const pathSegments = pathname.split('/').slice(3);
    if (pathSegments.some(segment => !validateFilePath(segment))) {
      return new NextResponse('Invalid file path', { status: 400 });
    }
  }
  
  // Rate limiting for sensitive endpoints
  const sensitiveEndpoints = [
    '/api/auth/register',
    '/api/auth/login', 
    '/api/auth/forgot-password',
    '/api/auth/reset-password'
  ];
  
  if (sensitiveEndpoints.some(endpoint => pathname.startsWith(endpoint))) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const key = `${ip}:${pathname}`;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 5;
    
    const requests = rateLimitStore.get(key) || [];
    const validRequests = requests.filter((time: number) => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return new NextResponse('Too many requests', { status: 429 });
    }
    
    validRequests.push(now);
    rateLimitStore.set(key, validRequests);
  }
  
  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
    '/dashboard/:path*'
  ]
};