import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from '@/utils/rbac-service';
import { emailTemplateService } from '@/utils/email-template-service';

// GET - Fetch all email functions
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

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const isActive = searchParams.get('is_active') ? searchParams.get('is_active') === 'true' : undefined;
    const search = searchParams.get('search') || undefined;

    const functions = await emailTemplateService.getEmailFunctions({
      category,
      is_active: isActive,
      search
    });

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'email_functions.list',
      'email_functions',
      undefined,
      { category, isActive, search },
      request.headers.get('x-forwarded-for') || request.ip || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      functions
    });

  } catch (error) {
    console.error('Error fetching email functions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 