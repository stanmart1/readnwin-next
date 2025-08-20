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
    const author = await ecommerceService.updateAuthor(authorId, body);

    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'content.update',
      'authors',
      authorId,
      body,
      request.headers.get('x-forwarded-for') || request.ip || '',
      request.headers.get('user-agent') || ''
    );

    return NextResponse.json({
      success: true,
      author,
      message: 'Author updated successfully'
    });

  } catch (error) {
    console.error('Error updating author:', error);
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
    console.error('Error deleting author:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}