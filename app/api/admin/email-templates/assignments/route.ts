import { sanitizeInput, sanitizeQuery, validateId, sanitizeHtml } from '@/lib/security';
import { requireAdmin, requirePermission } from '@/middleware/auth';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from '@/utils/rbac-service';
import { emailTemplateService } from '@/utils/email-template-service';

// GET - Fetch function assignments
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
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
    const functionId = searchParams.get('function_id') ? parseInt(searchParams.get('function_id')!) : undefined;

    const assignments = await emailTemplateService.getFunctionAssignments(functionId);

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'email_assignments.list',
      'email_function_assignments',
      undefined,
      { functionId },
      request.headers.get('x-forwarded-for') || request.ip || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      assignments
    });

  } catch (error) {
    logger.error('Error fetching function assignments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Assign template to function
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

    const { functionId, templateId, priority } = await request.json();

    // Validate required fields
    if (!functionId || !templateId) {
      return NextResponse.json(
        { error: 'Missing required fields: functionId, templateId' },
        { status: 400 }
      );
    }

    const assignment = await emailTemplateService.assignTemplateToFunction(
      functionId,
      templateId,
      priority || 1
    );

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'email_assignments.create',
      'email_function_assignments',
      assignment.id,
      { functionId, templateId, priority },
      request.headers.get('x-forwarded-for') || request.ip || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      assignment
    }, { status: 201 });

  } catch (error) {
    logger.error('Error creating function assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Unassign template from function
export async function DELETE(request: NextRequest) {
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
    const functionId = searchParams.get('function_id');
    const templateId = searchParams.get('template_id');

    if (!functionId || !templateId) {
      return NextResponse.json(
        { error: 'Missing required parameters: function_id, template_id' },
        { status: 400 }
      );
    }

    const success = await emailTemplateService.unassignTemplateFromFunction(
      parseInt(functionId),
      parseInt(templateId)
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'email_assignments.delete',
      'email_function_assignments',
      undefined,
      { functionId: parseInt(functionId), templateId: parseInt(templateId) },
      request.headers.get('x-forwarded-for') || request.ip || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      message: 'Assignment removed successfully'
    });

  } catch (error) {
    logger.error('Error removing function assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 