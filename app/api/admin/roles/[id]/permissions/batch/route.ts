import { sanitizeInput, sanitizeQuery, validateId, sanitizeHtml } from '@/lib/security';
import { requireAdmin, requirePermission } from '@/middleware/auth';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from '@/utils/rbac-service';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request);
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!validateId(params.id)) {
    return Response.json({ error: 'Invalid role ID' }, { status: 400 });
  }
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'roles.manage_permissions'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const roleId = parseInt(params.id);
    if (isNaN(roleId)) {
      return NextResponse.json({ error: 'Invalid role ID' }, { status: 400 });
    }

    const { permission_ids } = await request.json();
    
    if (!Array.isArray(permission_ids)) {
      return NextResponse.json({ error: 'Permission IDs must be an array' }, { status: 400 });
    }

    // Use optimized batch update method
    const success = await rbacService.updateRolePermissionsBatch(
      roleId, 
      permission_ids, 
      parseInt(session.user.id)
    );
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to update permissions' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Role permissions updated successfully'
    });

  } catch (error) {
    logger.error('API Error', { error: error.message, endpoint: request.url });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}