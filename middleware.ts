import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { addSecurityHeaders, validateRequestHeaders } from './lib/security-headers';

export function middleware(request: NextRequest) {
  // Validate request headers for security
  if (!validateRequestHeaders(request)) {
    return new NextResponse('Invalid request', { status: 400 });
  }

  // Set timezone header for Nigerian timezone
  const response = NextResponse.next();
  response.headers.set('X-Timezone', 'Africa/Lagos');
  
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 