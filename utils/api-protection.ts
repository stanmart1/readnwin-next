import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from './rbac-service';

export function withAuth(handler: Function) {
  return async (request: NextRequest, context?: any) => {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return await handler(request, context, session);
    } catch (error) {
      console.error('Auth wrapper error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

export async function withPermission(permission: string, handler: Function) {
  return async (request: NextRequest, context?: any) => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      permission
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return handler(request, context, session);
  };
}