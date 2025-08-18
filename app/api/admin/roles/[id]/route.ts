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

    // Get role
    const role = await rbacService.getRoleById(roleId);
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Get role permissions
    const rolePermissions = await rbacService.getRolePermissions(roleId);

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'roles.read',
      'roles',
      roleId,
      undefined,
      request.headers.get('x-forwarded-for') || request.ip,
      request.headers.get('user-agent')
    );

    return NextResponse.json({
      success: true,
      role,
      permissions: rolePermissions
    });

  } catch (error) {
    console.error('Error fetching role:', error);
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
      'roles.update'
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
    const { display_name, description, priority } = body;

    // Update role
    const updatedRole = await rbacService.updateRole(roleId, {
      display_name,
      description,
      priority
    });

    if (!updatedRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'roles.update',
      'roles',
      roleId,
      { display_name, description, priority },
      request.headers.get('x-forwarded-for') || request.ip,
      request.headers.get('user-agent')
    );

    return NextResponse.json({
      success: true,
      role: updatedRole,
      message: 'Role updated successfully'
    });

  } catch (error) {
    console.error('Error updating role:', error);
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
      'roles.delete'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const roleId = parseInt(params.id);
    if (isNaN(roleId)) {
      return NextResponse.json({ error: 'Invalid role ID' }, { status: 400 });
    }

    // Delete role
    const success = await rbacService.deleteRole(roleId);
    if (!success) {
      return NextResponse.json({ error: 'Role not found or cannot be deleted' }, { status: 404 });
    }

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'roles.delete',
      'roles',
      roleId,
      undefined,
      request.headers.get('x-forwarded-for') || request.ip,
      request.headers.get('user-agent')
    );

    return NextResponse.json({
      success: true,
      message: 'Role deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 