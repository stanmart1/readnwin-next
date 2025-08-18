import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import { query } from '@/utils/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token'); // Welcome email token
    const redirectTo = searchParams.get('redirect') || '/dashboard';
    
    console.log('🔍 Welcome link accessed:', {
      hasToken: !!token,
      redirectTo,
      timestamp: new Date().toISOString()
    });
    
    if (!token) {
      console.log('❌ No welcome token provided');
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'https://readnwin.com'}/login?callbackUrl=${encodeURIComponent(redirectTo)}`);
    }
    
    try {
      // Verify welcome token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      const userId = decoded.userId;
      const tokenType = decoded.type;
      
      console.log('🔍 Token verified:', {
        userId,
        tokenType,
        expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'no expiry'
      });
      
      if (tokenType !== 'welcome') {
        console.log('❌ Invalid token type:', tokenType);
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'https://readnwin.com'}/login?callbackUrl=${encodeURIComponent(redirectTo)}`);
      }
      
      // Check if user exists
      const userResult = await query(`
        SELECT id, email, first_name, last_name, status, email_verified
        FROM users 
        WHERE id = $1
      `, [userId]);
      
      if (userResult.rows.length === 0) {
        console.log('❌ User not found for token:', userId);
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'https://readnwin.com'}/login?callbackUrl=${encodeURIComponent(redirectTo)}`);
      }
      
      const user = userResult.rows[0];
      
      // Check if user has active session
      const session = await getServerSession(authOptions);
      
      console.log('🔍 Session check:', {
        hasSession: !!session,
        sessionUserId: session?.user?.id,
        tokenUserId: userId,
        sessionMatches: session?.user?.id === userId
      });
      
      if (session?.user?.id === userId) {
        // User is logged in, redirect to intended destination
        console.log('✅ User authenticated, redirecting to:', redirectTo);
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'https://readnwin.com'}${redirectTo}`);
      } else {
        // User not logged in, redirect to login with return URL
        console.log('🔐 User not authenticated, redirecting to login');
        const loginUrl = `${process.env.NEXTAUTH_URL || 'https://readnwin.com'}/login?callbackUrl=${encodeURIComponent(redirectTo)}`;
        return NextResponse.redirect(loginUrl);
      }
      
    } catch (jwtError) {
      console.error('❌ JWT verification failed:', jwtError);
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'https://readnwin.com'}/login?callbackUrl=${encodeURIComponent(redirectTo)}`);
    }
    
  } catch (error) {
    console.error('❌ Welcome link error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL || 'https://readnwin.com'}/login`);
  }
} 