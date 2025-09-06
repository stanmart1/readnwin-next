import { sanitizeInput, sanitizeQuery, validateId, sanitizeHtml } from '@/lib/security';
import { requireAdmin, requirePermission } from '@/middleware/auth';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from '@/utils/rbac-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin(request);
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!validateId(params.id)) {
    return Response.json({ error: 'Invalid ID format' }, { status: 400 });
  }
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    if (!isAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Access denied. Admin privileges required.' 
      }, { status: 403 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid user ID' 
      }, { status: 400 });
    }

    // Get user roles
    const userRoles = await rbacService.getUserRoles(userId);

    // Log audit event (non-blocking)
    try {
      await rbacService.logAuditEvent(
        parseInt(session.user.id),
        'users.roles.read',
        'users',
        userId,
        undefined,
        request.headers.get('x-forwarded-for') || request.ip || undefined,
        request.headers.get('user-agent') || undefined
      );
    } catch (auditError) {
      logger.error('Audit logging failed (non-critical):', auditError);
    }

    return NextResponse.json({
      success: true,
      roles: userRoles
    });

  } catch (error) {
    logger.error('Error fetching user roles:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    if (!isAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Access denied. Admin privileges required.' 
      }, { status: 403 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid user ID' 
      }, { status: 400 });
    }

    // Get request body and sanitize
    const body = await request.json();
    const sanitizedBody = {};
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        sanitizedBody[key] = sanitizeInput(value);
      } else {
        sanitizedBody[key] = value;
      }
    }
    const { role_id, expires_at } = sanitizedBody;

    if (!role_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Role ID is required' 
      }, { status: 400 });
    }

    // Verify the role exists
    const role = await rbacService.getRoleById(role_id);
    if (!role) {
      return NextResponse.json({ 
        success: false, 
        error: 'Role not found' 
      }, { status: 404 });
    }

    // Check if user exists
    const user = await rbacService.getUserById(userId);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Assign role to user
    const success = await rbacService.assignRoleToUser(
      userId,
      role_id,
      parseInt(session.user.id),
      expires_at ? new Date(expires_at) : undefined
    );

    if (!success) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to assign role to user' 
      }, { status: 400 });
    }

    // Log audit event (non-blocking)
    try {
      await rbacService.logAuditEvent(
        parseInt(session.user.id),
        'users.roles.assign',
        'users',
        userId,
        { role_id, role_name: role.name, expires_at },
        request.headers.get('x-forwarded-for') || request.ip || undefined,
        request.headers.get('user-agent') || undefined
      );
    } catch (auditError) {
      logger.error('Audit logging failed (non-critical):', auditError);
    }

    return NextResponse.json({
      success: true,
      message: 'Role assigned to user successfully'
    });

  } catch (error) {
    logger.error('Error assigning role to user:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    if (!isAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Access denied. Admin privileges required.' 
      }, { status: 403 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid user ID' 
      }, { status: 400 });
    }

    // Get role ID from query parameters
    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('role_id');

    if (!roleId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Role ID is required' 
      }, { status: 400 });
    }

    // Verify the role exists
    const role = await rbacService.getRoleById(parseInt(roleId));
    if (!role) {
      return NextResponse.json({ 
        success: false, 
        error: 'Role not found' 
      }, { status: 404 });
    }

    // Check if user exists
    const user = await rbacService.getUserById(userId);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Prevent removing super_admin role from the last super admin
    if (role.name === 'super_admin') {
      const superAdminCount = await rbacService.getUsersWithRole('super_admin');
      if (superAdminCount.length <= 1) {
        return NextResponse.json({
          success: false,
          error: 'Cannot remove super_admin role from the last super administrator'
        }, { status: 400 });
      }
    }

    // Remove role from user
    const success = await rbacService.removeRoleFromUser(userId, parseInt(roleId));

    if (!success) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to remove role from user' 
      }, { status: 400 });
    }

    // Log audit event (non-blocking)
    try {
      await rbacService.logAuditEvent(
        parseInt(session.user.id),
        'users.roles.remove',
        'users',
        userId,
        { role_id: roleId, role_name: role.name },
        request.headers.get('x-forwarded-for') || request.ip || undefined,
        request.headers.get('user-agent') || undefined
      );
    } catch (auditError) {
      logger.error('Audit logging failed (non-critical):', auditError);
    }

    return NextResponse.json({
      success: true,
      message: 'Role removed from user successfully'
    });

  } catch (error) {
    logger.error('Error removing role from user:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // Check if user is admin
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    if (!isAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Access denied. Admin privileges required.' 
      }, { status: 403 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid user ID' 
      }, { status: 400 });
    }

    // Get request body and sanitize
    const body = await request.json();
    const sanitizedBody = {};
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        sanitizedBody[key] = sanitizeInput(value);
      } else {
        sanitizedBody[key] = value;
      }
    }
    const { role_ids } = sanitizedBody;

    if (!Array.isArray(role_ids)) {
      return NextResponse.json({ 
        success: false, 
        error: 'role_ids must be an array' 
      }, { status: 400 });
    }

    // Check if user exists
    const user = await rbacService.getUserById(userId);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Get current user roles
    const currentRoles = await rbacService.getUserRoles(userId);
    const currentRoleIds = currentRoles.map(r => r.role_id || r.id);

    logger.info('🔍 Current role IDs:', currentRoleIds);
    logger.info('🔍 New role IDs:', role_ids);
    
    // Remove roles that are no longer selected
    for (const currentRoleId of currentRoleIds) {
      if (!role_ids.includes(currentRoleId)) {
        logger.info('🗑️ Removing role:', currentRoleId);
        await rbacService.removeRoleFromUser(userId, currentRoleId);
      }
    }

    // Add new roles
    for (const roleId of role_ids) {
      if (!currentRoleIds.includes(roleId)) {
        logger.info('➕ Adding role:', roleId);
        await rbacService.assignRoleToUser(userId, roleId, parseInt(session.user.id));
      }
    }

    // Log audit event (non-blocking)
    try {
      await rbacService.logAuditEvent(
        parseInt(session.user.id),
        'users.roles.update',
        'users',
        userId,
        { old_role_ids: currentRoleIds, new_role_ids: role_ids },
        request.headers.get('x-forwarded-for') || request.ip || undefined,
        request.headers.get('user-agent') || undefined
      );
    } catch (auditError) {
      logger.error('Audit logging failed (non-critical):', auditError);
    }

    return NextResponse.json({
      success: true,
      message: 'User roles updated successfully'
    });

  } catch (error) {
    logger.error('Error updating user roles:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}