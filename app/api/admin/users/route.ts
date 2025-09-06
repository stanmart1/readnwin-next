import { sanitizeInput, sanitizeQuery, validateId, sanitizeHtml } from '@/lib/security';
import { requireAdmin, requirePermission } from '@/middleware/auth';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from '@/utils/rbac-service';
import { validateInput, sanitizeInput as oldSanitizeInput, requireAuth } from '@/utils/security-middleware';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    logger.info('Users API - Starting request');
    
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      logger.error('Users API - No session found');
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    logger.info('Users API - Session found', { userId: session.user.id, role: session.user.role });

    // Check if user is admin (skip complex permission checks for now)
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    if (!isAdmin) {
      logger.error('Users API - User is not admin', { role: session.user.role });
      return NextResponse.json({ 
        success: false, 
        error: 'Access denied. Admin privileges required.' 
      }, { status: 403 });
    }

    // Get and validate query parameters
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const search = sanitizeInput(searchParams.get('search') || '');
    const status = sanitizeInput(searchParams.get('status') || '');
    const role = sanitizeInput(searchParams.get('role') || '');

    logger.info('Users API - Query params', { page, limit, search, status, role });

    // Build validated filters
    const filters: any = {};
    if (search && search.length >= 2) filters.search = search;
    if (status && ['active', 'inactive', 'suspended'].includes(status)) filters.status = status;
    if (role && ['admin', 'super_admin', 'user'].includes(role)) filters.role = role;

    logger.info('Users API - Calling rbacService.getUsers');
    
    // Get users with error handling
    let result;
    try {
      result = await rbacService.getUsers(page, limit, filters, session.user.role);
      logger.info('Users API - rbacService.getUsers success', { userCount: result.users.length });
    } catch (rbacError) {
      logger.error('Users API - rbacService.getUsers error', { error: rbacError });
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch users from database',
        details: rbacError instanceof Error ? rbacError.message : 'Unknown database error'
      }, { status: 500 });
    }

    // Log audit event (non-blocking)
    try {
      await rbacService.logAuditEvent(
        parseInt(session.user.id),
        'users.list',
        'users',
        undefined,
        { page, limit, filters },
        request.headers.get('x-forwarded-for') || request.ip || undefined,
        request.headers.get('user-agent') || undefined
      );
    } catch (auditError) {
      logger.warn('Users API - Audit logging failed (non-critical)', { error: auditError });
    }

    const response = {
      success: true,
      users: result.users || [],
      pagination: {
        page,
        limit,
        total: result.total || 0,
        pages: Math.ceil((result.total || 0) / limit)
      }
    };

    logger.info('Users API - Returning response', { userCount: response.users.length });
    return NextResponse.json(response);

  } catch (error) {
    logger.error('API Error', { error: error.message, endpoint: request.url });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    logger.info('Users API POST - Starting request');
    
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

    // Get and validate request body
    const body = await request.json();
    const { email, username, password, first_name, last_name, role_id } = body;

    // Input validation
    const validation = validateInput(body, {
      email: { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
      username: { required: true, type: 'string', maxLength: 50, pattern: /^[a-zA-Z0-9_]+$/ },
      password: { required: true, type: 'string', maxLength: 100 },
      first_name: { required: true, type: 'string', maxLength: 50 },
      last_name: { required: true, type: 'string', maxLength: 50 }
    });

    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedData = {
      email: sanitizeInput(email),
      username: sanitizeInput(username),
      first_name: sanitizeInput(first_name),
      last_name: sanitizeInput(last_name)
    };

    // Hash password
    const bcrypt = require('bcryptjs');
    const password_hash = await bcrypt.hash(password, 12);

    // Create user with sanitized data
    const user = await rbacService.createUser({
      email: sanitizedData.email,
      username: sanitizedData.username,
      password_hash,
      first_name: sanitizedData.first_name,
      last_name: sanitizedData.last_name,
      status: 'active',
      email_verified: false
    });

    // Assign role if provided
    if (role_id) {
      await rbacService.assignRoleToUser(
        user.id,
        role_id,
        parseInt(session.user.id)
      );
    }

    // Log audit event (non-blocking)
    try {
      await rbacService.logAuditEvent(
        parseInt(session.user.id),
        'users.create',
        'users',
        user.id,
        { email, username, first_name, last_name, role_id },
        request.headers.get('x-forwarded-for') || request.ip || undefined,
        request.headers.get('user-agent') || undefined
      );
    } catch (auditError) {
      logger.warn('Users API POST - Audit logging failed (non-critical)', { error: auditError });
    }

    // Remove password hash from response
    const { password_hash: _, ...userResponse } = user;

    return NextResponse.json({
      success: true,
      user: userResponse,
      message: 'User created successfully'
    });

  } catch (error) {
    logger.error('API Error', { error: error.message, endpoint: request.url });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}