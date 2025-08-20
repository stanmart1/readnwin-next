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

    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    const body = await request.json();
    const category = await ecommerceService.updateCategory(categoryId, body);

    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'content.update',
      'categories',
      categoryId,
      body,
      request.headers.get('x-forwarded-for') || request.ip,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      category,
      message: 'Category updated successfully'
    });

  } catch (error) {
    console.error('Error updating category:', error);
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

    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    await ecommerceService.deleteCategory(categoryId);

    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'content.delete',
      'categories',
      categoryId,
      {},
      request.headers.get('x-forwarded-for') || request.ip,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}