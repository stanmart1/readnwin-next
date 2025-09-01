import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const RATE_LIMIT_MAP = new Map<string, number[]>();

const rateLimit = (ip: string, limit: number = 100, window: number = 60000) => {
  const now = Date.now();
  const windowStart = now - window;
  
  if (!RATE_LIMIT_MAP.has(ip)) {
    RATE_LIMIT_MAP.set(ip, []);
  }
  
  const requests = (RATE_LIMIT_MAP.get(ip) || []).filter((time: number) => time > windowStart);
  
  if (requests.length >= limit) {
    return false;
  }
  
  requests.push(now);
  RATE_LIMIT_MAP.set(ip, requests);
  return true;
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Handle direct uploads requests by redirecting to API
  if (pathname.startsWith('/uploads/')) {
    const apiPath = pathname.replace('/uploads/', '/api/uploads/');
    return NextResponse.redirect(new URL(apiPath, request.url));
  }
  
  // HTTPS enforcement in production
  if (process.env.NODE_ENV === 'production' && request.headers.get('x-forwarded-proto') !== 'https') {
    return NextResponse.redirect(`https://${request.headers.get('host')}${request.nextUrl.pathname}${request.nextUrl.search}`, 301);
  }
  
  // Rate limiting
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(ip, 100, 60000)) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  
  // Security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.flutterwave.com https://js.paystack.co https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; connect-src 'self' https://api.flutterwave.com https://api.paystack.co https://checkout.flutterwave.com https://picsum.photos https://fastly.picsum.photos https://images.unsplash.com https://images-na.ssl-images-amazon.com; frame-src 'self' https://checkout.flutterwave.com https://checkout-v3-ui-prod.f4b-flutterwave.com https://*.flutterwave.com; child-src 'self' https://checkout.flutterwave.com https://*.flutterwave.com;");
  
  // Admin routes protection
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = await getToken({ req: request });
    
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    if (!['admin', 'super_admin'].includes(token.role as string)) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
};