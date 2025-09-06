import { sanitizeInput, sanitizeQuery, validateId, sanitizeHtml } from '@/lib/security';
import { requireAdmin, requirePermission } from '@/middleware/auth';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from '@/utils/rbac-service';
import { ecommerceService } from '@/utils/ecommerce-service';

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
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'content.update'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const authorId = parseInt(params.id);
    if (isNaN(authorId)) {
      return NextResponse.json({ error: 'Invalid author ID' }, { status: 400 });
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
    const author = await ecommerceService.updateAuthor(authorId, sanitizedBody);

    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'content.update',
      'authors',
      authorId,
      sanitizedBody,
      request.headers.get('x-forwarded-for') || request.ip || '',
      request.headers.get('user-agent') || ''
    );

    return NextResponse.json({
      success: true,
      author,
      message: 'Author updated successfully'
    });

  } catch (error) {
    logger.error('Error updating author:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hasPermission = await rbacService.hasPermission(
      parseInt(session.user.id),
      'content.delete'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const authorId = parseInt(params.id);
    if (isNaN(authorId)) {
      return NextResponse.json({ error: 'Invalid author ID' }, { status: 400 });
    }

    await ecommerceService.deleteAuthor(authorId);

    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'content.delete',
      'authors',
      authorId,
      {},
      request.headers.get('x-forwarded-for') || request.ip || '',
      request.headers.get('user-agent') || ''
    );

    return NextResponse.json({
      success: true,
      message: 'Author deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting author:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}