import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test auth endpoint called');
    
    // Get user session
    const session = await getServerSession(authOptions);
    console.log('🔍 Session check:', session ? 'Authenticated' : 'Not authenticated');
    console.log('🔍 Session details:', JSON.stringify(session, null, 2));
    
    if (!session?.user?.id) {
      console.log('❌ Authentication required but not provided');
      return NextResponse.json(
        { 
          error: 'Authentication required',
          authenticated: false,
          session: null
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        firstName: session.user.firstName,
        lastName: session.user.lastName
      },
      session: session
    });

  } catch (error) {
    console.error('❌ Error in test auth:', error);
    return NextResponse.json(
      { 
        error: 'Authentication test failed',
        authenticated: false,
        errorDetails: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 