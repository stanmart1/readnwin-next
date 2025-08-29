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

    // Check if user is admin
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get roles
    const roles = await rbacService.getRoles();

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'roles.list',
      'roles',
      undefined,
      undefined,
      request.headers.get('x-forwarded-for') || request.ip,
      request.headers.get('user-agent')
    );

    return NextResponse.json({
      success: true,
      roles
    });

  } catch (error) {
    console.error('Error fetching roles:', error);
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

    // Check if user is admin
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get request body
    const body = await request.json();
    const { name, display_name, description, priority } = body;

    // Validate required fields
    if (!name || !display_name) {
      return NextResponse.json(
        { error: 'Name and display name are required' },
        { status: 400 }
      );
    }

    // Create role
    const role = await rbacService.createRole({
      name,
      display_name,
      description,
      priority: priority || 0,
      is_system_role: false
    });

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'roles.create',
      'roles',
      role.id,
      { name, display_name, description, priority },
      request.headers.get('x-forwarded-for') || request.ip,
      request.headers.get('user-agent')
    );

    return NextResponse.json({
      success: true,
      role,
      message: 'Role created successfully'
    });

  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 