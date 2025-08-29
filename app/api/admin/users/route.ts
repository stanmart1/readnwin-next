import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from '@/utils/rbac-service';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Users API - Starting request');
    
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('❌ Users API - No session found');
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    console.log('✅ Users API - Session found:', session.user.id, session.user.role);

    // Check if user is admin (skip complex permission checks for now)
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    if (!isAdmin) {
      console.log('❌ Users API - User is not admin:', session.user.role);
      return NextResponse.json({ 
        success: false, 
        error: 'Access denied. Admin privileges required.' 
      }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const role = searchParams.get('role') || '';

    console.log('🔍 Users API - Query params:', { page, limit, search, status, role });

    // Build filters
    const filters: any = {};
    if (search) filters.search = search;
    if (status) filters.status = status;
    if (role) filters.role = role;

    console.log('🔍 Users API - Calling rbacService.getUsers');
    
    // Get users with error handling
    let result;
    try {
      result = await rbacService.getUsers(page, limit, filters, session.user.role);
      console.log('✅ Users API - rbacService.getUsers success:', result.users.length, 'users');
    } catch (rbacError) {
      console.error('❌ Users API - rbacService.getUsers error:', rbacError);
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
      console.error('⚠️ Users API - Audit logging failed (non-critical):', auditError);
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

    console.log('✅ Users API - Returning response:', response.users.length, 'users');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Users API - Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Users API POST - Starting request');
    
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

    // Get request body
    const body = await request.json();
    const { email, username, password, first_name, last_name, role_id } = body;

    // Validate required fields
    if (!email || !username || !password || !first_name || !last_name) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const password_hash = await bcrypt.hash(password, 12);

    // Create user
    const user = await rbacService.createUser({
      email,
      username,
      password_hash,
      first_name,
      last_name,
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
      console.error('⚠️ Users API POST - Audit logging failed (non-critical):', auditError);
    }

    // Remove password hash from response
    const { password_hash: _, ...userResponse } = user;

    return NextResponse.json({
      success: true,
      user: userResponse,
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('❌ Users API POST - Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 