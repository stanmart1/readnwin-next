import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from '@/utils/rbac-service';
import { sendTemplateEmail } from '@/utils/email';

// POST - Send test email using a template
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
      'system.settings'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { templateSlug, to, variables } = await request.json();

    // Validate required fields
    if (!templateSlug || !to) {
      return NextResponse.json(
        { error: 'Missing required fields: templateSlug, to' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      );
    }

    // Send test email
    const result = await sendTemplateEmail(to, templateSlug, variables || {});

    if (result.success) {
      // Log audit event
      await rbacService.logAuditEvent(
        parseInt(session.user.id),
        'email_templates.test_send',
        'email_templates',
        undefined,
        { templateSlug, to, variables },
        request.headers.get('x-forwarded-for') || request.ip || undefined,
        request.headers.get('user-agent') || undefined
      );

      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${to}`,
        data: result.data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: (result.error as any)?.message || 'Failed to send test email'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 