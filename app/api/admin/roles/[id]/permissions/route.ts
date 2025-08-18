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
      'roles.read'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const roleId = parseInt(params.id);
    if (isNaN(roleId)) {
      return NextResponse.json({ error: 'Invalid role ID' }, { status: 400 });
    }

    // Get role permissions
    const rolePermissions = await rbacService.getRolePermissions(roleId);

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'roles.permissions.read',
      'roles',
      roleId,
      undefined,
      request.headers.get('x-forwarded-for') || request.ip,
      request.headers.get('user-agent')
    );

    return NextResponse.json({
      success: true,
      permissions: rolePermissions
    });

  } catch (error) {
    console.error('Error fetching role permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
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
      'roles.manage_permissions'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const roleId = parseInt(params.id);
    if (isNaN(roleId)) {
      return NextResponse.json({ error: 'Invalid role ID' }, { status: 400 });
    }

    // Get request body
    const body = await request.json();
    const { permission_id } = body;

    if (!permission_id) {
      return NextResponse.json({ error: 'Permission ID is required' }, { status: 400 });
    }

    // Assign permission to role
    const success = await rbacService.assignPermissionToRole(
      roleId,
      permission_id,
      parseInt(session.user.id)
    );

    if (!success) {
      return NextResponse.json({ error: 'Failed to assign permission to role' }, { status: 400 });
    }

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'roles.permissions.assign',
      'roles',
      roleId,
      { permission_id },
      request.headers.get('x-forwarded-for') || request.ip,
      request.headers.get('user-agent')
    );

    return NextResponse.json({
      success: true,
      message: 'Permission assigned to role successfully'
    });

  } catch (error) {
    console.error('Error assigning permission to role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
      'roles.manage_permissions'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const roleId = parseInt(params.id);
    if (isNaN(roleId)) {
      return NextResponse.json({ error: 'Invalid role ID' }, { status: 400 });
    }

    // Get permission ID from query parameters
    const { searchParams } = new URL(request.url);
    const permissionId = searchParams.get('permission_id');

    if (!permissionId) {
      return NextResponse.json({ error: 'Permission ID is required' }, { status: 400 });
    }

    // Remove permission from role
    const success = await rbacService.removePermissionFromRole(
      roleId,
      parseInt(permissionId)
    );

    if (!success) {
      return NextResponse.json({ error: 'Failed to remove permission from role' }, { status: 400 });
    }

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'roles.permissions.remove',
      'roles',
      roleId,
      { permission_id: permissionId },
      request.headers.get('x-forwarded-for') || request.ip,
      request.headers.get('user-agent')
    );

    return NextResponse.json({
      success: true,
      message: 'Permission removed from role successfully'
    });

  } catch (error) {
    console.error('Error removing permission from role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 