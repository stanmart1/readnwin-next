import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from '@/utils/rbac-service';
import { withPermission } from '@/utils/api-protection';
import { handleError } from '@/utils/error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withPermission('users.read', async (session) => {
    try {
      const userId = parseInt(params.id);
      if (isNaN(userId)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
      }

      // Get user roles
      const userRoles = await rbacService.getUserRoles(userId);

      // Log audit event
      await rbacService.logAuditEvent(
        parseInt(session.user.id),
        'users.roles.read',
        'users',
        userId,
        undefined,
        request.headers.get('x-forwarded-for') || request.ip || undefined,
        request.headers.get('user-agent') || undefined
      );

      return NextResponse.json({
        success: true,
        roles: userRoles
      });

    } catch (error) {
      return handleError(error, 'Error fetching user roles');
    }
  })(request);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withPermission('users.manage_roles', async (session) => {
    try {
      const userId = parseInt(params.id);
      if (isNaN(userId)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
      }

      // Get request body
      const body = await request.json();
      const { role_id, expires_at } = body;

      if (!role_id) {
        return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
      }

      // Verify the role exists
      const role = await rbacService.getRoleById(role_id);
      if (!role) {
        return NextResponse.json({ error: 'Role not found' }, { status: 404 });
      }

      // Check if user exists
      const user = await rbacService.getUserById(userId);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Assign role to user
      const success = await rbacService.assignRoleToUser(
        userId,
        role_id,
        parseInt(session.user.id),
        expires_at ? new Date(expires_at) : undefined
      );

      if (!success) {
        return NextResponse.json({ error: 'Failed to assign role to user' }, { status: 400 });
      }

      // Log audit event
      await rbacService.logAuditEvent(
        parseInt(session.user.id),
        'users.roles.assign',
        'users',
        userId,
        { role_id, role_name: role.name, expires_at },
        request.headers.get('x-forwarded-for') || request.ip || undefined,
        request.headers.get('user-agent') || undefined
      );

      return NextResponse.json({
        success: true,
        message: 'Role assigned to user successfully'
      });

    } catch (error) {
      return handleError(error, 'Error assigning role to user');
    }
  })(request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withPermission('users.manage_roles', async (session) => {
    try {
      const userId = parseInt(params.id);
      if (isNaN(userId)) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
      }

      // Get role ID from query parameters
      const { searchParams } = new URL(request.url);
      const roleId = searchParams.get('role_id');

      if (!roleId) {
        return NextResponse.json({ error: 'Role ID is required' }, { status: 400 });
      }

      // Verify the role exists
      const role = await rbacService.getRoleById(parseInt(roleId));
      if (!role) {
        return NextResponse.json({ error: 'Role not found' }, { status: 404 });
      }

      // Check if user exists
      const user = await rbacService.getUserById(userId);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Prevent removing super_admin role from the last super admin
      if (role.name === 'super_admin') {
        const superAdminCount = await rbacService.getUsersWithRole('super_admin');
        if (superAdminCount.length <= 1) {
          return NextResponse.json(
            { error: 'Cannot remove super_admin role from the last super administrator' },
            { status: 400 }
          );
        }
      }

      // Remove role from user
      const success = await rbacService.removeRoleFromUser(userId, parseInt(roleId));

      if (!success) {
        return NextResponse.json({ error: 'Failed to remove role from user' }, { status: 400 });
      }

      // Log audit event
      await rbacService.logAuditEvent(
        parseInt(session.user.id),
        'users.roles.remove',
        'users',
        userId,
        { role_id: roleId, role_name: role.name },
        request.headers.get('x-forwarded-for') || request.ip || undefined,
        request.headers.get('user-agent') || undefined
      );

      return NextResponse.json({
        success: true,
        message: 'Role removed from user successfully'
      });

    } catch (error) {
      return handleError(error, 'Error removing role from user');
    }
  })(request);
}