import { sanitizeInput, sanitizeQuery, validateId, sanitizeHtml } from '@/lib/security';
import { requireAdmin, requirePermission } from '@/middleware/auth';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from '@/utils/rbac-service';
import { emailTemplateService } from '@/utils/email-template-service';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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

    const categories = await emailTemplateService.getCategories();

    return NextResponse.json({
      success: true,
      categories
    });

  } catch (error) {
    logger.error('Error fetching email template categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 