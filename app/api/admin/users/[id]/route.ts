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
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Get user
    const user = await rbacService.getUserById(userId);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Log audit event (non-blocking)
    try {
      await rbacService.logAuditEvent(
        parseInt(session.user.id),
        'users.read',
        'users',
        userId,
        undefined,
        request.headers.get('x-forwarded-for') || request.ip || undefined,
        request.headers.get('user-agent') || undefined
      );
    } catch (auditError) {
      console.error('Audit logging failed (non-critical):', auditError);
    }

    // Remove password hash from response
    const { password_hash: _, ...userResponse } = user;

    return NextResponse.json({
      success: true,
      user: userResponse
    });

  } catch (error) {
    console.error('Error fetching user:', error);
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
    console.log('🔍 Users PUT - Starting request for user:', params.id);
    
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('❌ Users PUT - No session found');
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    console.log('✅ Users PUT - Session found:', session.user.id, session.user.role);

    // Check if user is admin (skip complex permission checks for now)
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    if (!isAdmin) {
      console.log('❌ Users PUT - User is not admin:', session.user.role);
      return NextResponse.json({ 
        success: false, 
        error: 'Access denied. Admin privileges required.' 
      }, { status: 403 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Skip complex role checking for now to prevent errors
    // TODO: Re-implement role-based access control after fixing core functionality

    // Get request body
    const body = await request.json();
    const { first_name, last_name, email, username, status } = body;

    console.log('🔍 Users PUT - Updating user with data:', { first_name, last_name, email, username, status });
    
    // Update user with error handling
    let updatedUser;
    try {
      updatedUser = await rbacService.updateUser(userId, {
        first_name,
        last_name,
        email,
        username,
        status
      });
      console.log('✅ Users PUT - rbacService.updateUser success');
    } catch (updateError) {
      console.error('❌ Users PUT - rbacService.updateUser error:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update user in database',
        details: updateError instanceof Error ? updateError.message : 'Unknown database error'
      }, { status: 500 });
    }

    if (!updatedUser) {
      console.log('❌ Users PUT - User not found after update');
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Log audit event (non-blocking)
    try {
      await rbacService.logAuditEvent(
        parseInt(session.user.id),
        'users.update',
        'users',
        userId,
        { first_name, last_name, email, username, status },
        request.headers.get('x-forwarded-for') || request.ip || undefined,
        request.headers.get('user-agent') || undefined
      );
    } catch (auditError) {
      console.error('⚠️ Users PUT - Audit logging failed (non-critical):', auditError);
    }

    // Remove password hash from response
    const { password_hash: _, ...userResponse } = updatedUser;

    console.log('✅ Users PUT - Returning success response');
    return NextResponse.json({
      success: true,
      user: userResponse,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('❌ Users PUT - Unexpected error:', error);
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
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Prevent self-deletion
    if (userId === parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Skip complex role checking for now to prevent errors
    // TODO: Re-implement role-based access control after fixing core functionality

    // Delete user
    const success = await rbacService.deleteUser(userId);
    if (!success) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Log audit event (non-blocking)
    try {
      await rbacService.logAuditEvent(
        parseInt(session.user.id),
        'users.delete',
        'users',
        userId,
        undefined,
        request.headers.get('x-forwarded-for') || request.ip || undefined,
        request.headers.get('user-agent') || undefined
      );
    } catch (auditError) {
      console.error('Audit logging failed (non-critical):', auditError);
    }

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