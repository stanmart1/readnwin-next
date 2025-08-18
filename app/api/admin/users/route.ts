import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from '@/utils/rbac-service';

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const role = searchParams.get('role') || '';

    // Build filters
    const filters: any = {};
    if (search) filters.search = search;
    if (status) filters.status = status;
    if (role) filters.role = role;

    // Check if current user is super_admin
    const isSuperAdmin = session.user.role === 'super_admin';
    
    // Hide admin and super_admin users from non-super_admin users
    // This ensures only super_admin users can see other super_admin users
    const hideAdminUsers = !isSuperAdmin;
    
    // Get users
    const result = await rbacService.getUsers(page, limit, filters, hideAdminUsers);

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'users.list',
      'users',
      undefined,
      { page, limit, filters },
      request.headers.get('x-forwarded-for') || request.ip,
      request.headers.get('user-agent')
    );

    return NextResponse.json({
      success: true,
      users: result.users,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission
    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'users.create'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { email, username, password, first_name, last_name, role_id } = body;

    // Validate required fields
    if (!email || !username || !password || !first_name || !last_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
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

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'users.create',
      'users',
      user.id,
      { email, username, first_name, last_name, role_id },
      request.headers.get('x-forwarded-for') || request.ip,
      request.headers.get('user-agent')
    );

    // Remove password hash from response
    const { password_hash: _, ...userResponse } = user;

    return NextResponse.json({
      success: true,
      user: userResponse,
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 