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

    // Get user
    const user = await rbacService.getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if current user is super_admin
    const isSuperAdmin = session.user.role === 'super_admin';
    
    // Get user roles to check if target user is super_admin
    const userRoles = await rbacService.getUserRoles(userId);
    const targetUserIsSuperAdmin = userRoles.some((role: any) => role.role.name === 'super_admin');
    
    // Prevent non-super_admin users from accessing super_admin user details
    if (targetUserIsSuperAdmin && !isSuperAdmin) {
      return NextResponse.json({ error: 'Access denied: Insufficient privileges' }, { status: 403 });
    }

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'users.read',
      'users',
      userId,
      undefined,
      request.headers.get('x-forwarded-for') || request.ip || undefined,
      request.headers.get('user-agent') || undefined
    );

    // Remove password hash from response
    const { password_hash: _, ...userResponse } = user;

    return NextResponse.json({
      success: true,
      user: userResponse,
      roles: userRoles
    });

  } catch (error) {
    console.error('Error fetching user:', error);
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
      'users.update'
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
    const targetUserIsSuperAdmin = userRoles.some((role: any) => role.role.name === 'super_admin');
    
    // Prevent non-super_admin users from updating super_admin users
    if (targetUserIsSuperAdmin && !isSuperAdmin) {
      return NextResponse.json({ error: 'Access denied: Cannot modify super administrator accounts' }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { first_name, last_name, email, username, status } = body;

    // Update user
    const updatedUser = await rbacService.updateUser(userId, {
      first_name,
      last_name,
      email,
      username,
      status
    });

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'users.update',
      'users',
      userId,
      { first_name, last_name, email, username, status },
      request.headers.get('x-forwarded-for') || request.ip || undefined,
      request.headers.get('user-agent') || undefined
    );

    // Remove password hash from response
    const { password_hash: _, ...userResponse } = updatedUser;

    return NextResponse.json({
      success: true,
      user: userResponse,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
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
      'users.delete'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Prevent self-deletion
    if (userId === parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if current user is super_admin
    const isSuperAdmin = session.user.role === 'super_admin';
    
    // Get user roles to check if target user is super_admin
    const userRoles = await rbacService.getUserRoles(userId);
    const targetUserIsSuperAdmin = userRoles.some((role: any) => role.role.name === 'super_admin');
    
    // Prevent non-super_admin users from deleting super_admin users
    if (targetUserIsSuperAdmin && !isSuperAdmin) {
      return NextResponse.json({ error: 'Access denied: Cannot delete super administrator accounts' }, { status: 403 });
    }

    // Delete user
    const success = await rbacService.deleteUser(userId);
    if (!success) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'users.delete',
      'users',
      userId,
      undefined,
      request.headers.get('x-forwarded-for') || request.ip || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    
    // Provide more detailed error messages
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (error instanceof Error) {
      // Check for specific database errors
      if (error.message.includes('foreign key constraint')) {
        errorMessage = 'Cannot delete user: User has related data that must be removed first';
        statusCode = 400;
      } else if (error.message.includes('does not exist')) {
        errorMessage = 'Cannot delete user: Required database tables are missing';
        statusCode = 500;
      } else if (error.message.includes('connection')) {
        errorMessage = 'Database connection error. Please try again.';
        statusCode = 503;
      } else {
        errorMessage = `Database error: ${error.message}`;
        statusCode = 500;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
} 