import { sanitizeInput, sanitizeQuery, validateId, sanitizeHtml } from '@/lib/security';
import { requireAdmin, requirePermission } from '@/middleware/auth';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from '@/utils/rbac-service';
import bcrypt from 'bcryptjs';

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
    return Response.json({ error: 'Invalid ID format' }, { status: 400 });
  }
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

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

    
    const body = await request.json();
    const sanitizedBody = {};
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        sanitizedBody[key] = sanitizeInput(value);
      } else {
        sanitizedBody[key] = value;
      }
    }
    const { password } = sanitizedBody;

    if (!password || password.length < 6) {
      return NextResponse.json({ 
        success: false, 
        error: 'Password must be at least 6 characters long' 
      }, { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password in database
    const success = await rbacService.updateUserPassword(userId, hashedPassword);
    if (!success) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found or password update failed' 
      }, { status: 404 });
    }

    // Log audit event
    try {
      await rbacService.logAuditEvent(
        parseInt(session.user.id),
        'users.password_update',
        'users',
        userId,
        { updated_by_admin: true },
        request.headers.get('x-forwarded-for') || request.ip || undefined,
        request.headers.get('user-agent') || undefined
      );
    } catch (auditError) {
      logger.error('Audit logging failed (non-critical):', auditError);
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    logger.error('Error updating password:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}