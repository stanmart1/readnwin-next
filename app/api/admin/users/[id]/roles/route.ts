import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from '@/utils/rbac-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'users.read'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Check if current user is super_admin
    const isSuperAdmin = session.user.role === 'super_admin';
    
    // Get user roles to check if target user is super_admin
    const userRoles = await rbacService.getUserRoles(userId);
    const targetUserIsSuperAdmin = userRoles.some((role: any) => role.role_name === 'super_admin');
    
    // Prevent non-super_admin users from accessing super_admin user roles
    if (targetUserIsSuperAdmin && !isSuperAdmin) {
      return NextResponse.json({ error: 'Access denied: Insufficient privileges' }, { status: 403 });
    }

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'users.roles.read',
      'users',
      userId,
      { userId },
      request.headers.get('x-forwarded-for') || request.ip || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      roles: userRoles.map((ur: any) => ({
        id: ur.role_id,
        name: ur.role_name,
        display_name: ur.role_display_name,
        description: ur.role_description,
        priority: ur.role_priority,
        is_system_role: ur.role_is_system_role,
        created_at: ur.role_created_at
      }))
    });

  } catch (error) {
    console.error('Error fetching user roles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'users.manage_roles'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Check if current user is super_admin
    const isSuperAdmin = session.user.role === 'super_admin';
    
    // Get user roles to check if target user is super_admin
    const currentUserRoles = await rbacService.getUserRoles(userId);
    const targetUserIsSuperAdmin = currentUserRoles.some((role: any) => role.role_name === 'super_admin');
    
    // Prevent non-super_admin users from modifying super_admin user roles
    if (targetUserIsSuperAdmin && !isSuperAdmin) {
      return NextResponse.json({ error: 'Access denied: Cannot modify super administrator roles' }, { status: 403 });
    }

    const body = await request.json();
    const { role_ids } = body;

    if (!Array.isArray(role_ids)) {
      return NextResponse.json({ error: 'role_ids must be an array' }, { status: 400 });
    }

    // Get current user roles
    const currentRoleIds = currentUserRoles.map(ur => ur.role_id);

    // Remove roles that are no longer assigned
    for (const roleId of currentRoleIds) {
      if (!role_ids.includes(roleId)) {
        await rbacService.removeRoleFromUser(userId, roleId);
      }
    }

    // Add new roles
    for (const roleId of role_ids) {
      if (!currentRoleIds.includes(roleId)) {
        await rbacService.assignRoleToUser(userId, roleId, parseInt(session.user.id));
      }
    }

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'users.roles.update',
      'users',
      userId,
      { userId, role_ids, previous_roles: currentRoleIds },
      request.headers.get('x-forwarded-for') || request.ip || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      message: 'User roles updated successfully'
    });

  } catch (error) {
    console.error('Error updating user roles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 