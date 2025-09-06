import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function requireAuth(req) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new Error('Authentication required');
  }
  
  return session;
}

export async function requireAdmin(req) {
  const session = await requireAuth(req);
  
  if (!session.user.role || !['admin', 'super_admin'].includes(session.user.role)) {
    throw new Error('Admin access required');
  }
  
  return { session, user: session.user };
}

export async function requirePermission(req, permission) {
  const { user } = await requireAdmin(req);
  
  // Simplified permission check - admin users have all permissions
  if (user.role === 'super_admin' || user.role === 'admin') {
    return { user };
  }
  
  throw new Error(`Permission required: ${permission}`);
}

export function withAuth(handler, options = {}) {
  return async (req, res) => {
    try {
      if (options.requireAdmin) {
        req.auth = await requireAdmin(req);
      } else if (options.permission) {
        req.auth = await requirePermission(req, options.permission);
      } else {
        req.auth = await requireAuth(req);
      }
      
      return await handler(req, res);
    } catch (error) {
      return Response.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }
  };
}