import { sanitizeInput, sanitizeQuery, validateId, sanitizeHtml } from '@/lib/security';
import { requireAdmin, requirePermission } from '@/middleware/auth';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from '@/utils/rbac-service';
import { emailTemplateService } from '@/utils/email-template-service';

// GET - Fetch all email templates
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
    const category = searchParams.get('category') || undefined;
    const isActive = searchParams.get('is_active') ? searchParams.get('is_active') === 'true' : undefined;
    const search = searchParams.get('search') || undefined;

    const templates = await emailTemplateService.getTemplates({
      category,
      is_active: isActive,
      search
    });

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'email_templates.list',
      'email_templates',
      undefined,
      { category, isActive, search },
      request.headers.get('x-forwarded-for') || request.ip || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      templates
    });

  } catch (error) {
    logger.error('Error fetching email templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new email template
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

    const templateData = await request.json();

    // Validate required fields
    if (!templateData.name || !templateData.slug || !templateData.subject || !templateData.html_content) {
      return NextResponse.json(
        { error: 'Missing required fields: name, slug, subject, html_content' },
        { status: 400 }
      );
    }

    const template = await emailTemplateService.createTemplate({
      ...templateData,
      is_active: templateData.is_active ?? true,
      category: templateData.category ?? 'general'
    });

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'email_templates.create',
      'email_templates',
      template.id,
      { name: template.name, slug: template.slug },
      request.headers.get('x-forwarded-for') || request.ip || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      template
    }, { status: 201 });

  } catch (error) {
    logger.error('Error creating email template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 