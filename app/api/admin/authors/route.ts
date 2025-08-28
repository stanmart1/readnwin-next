import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/utils/api-protection';
import { rbacService } from '@/utils/rbac-service';
import { ecommerceService } from '@/utils/ecommerce-service';
import { handleApiError } from '@/utils/error-handler';

export const GET = withPermission('content.read', async (request: NextRequest, context: any, session: any) => {
  try {

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const filters: any = { page, limit };
    if (search) filters.search = search;
    if (status) filters.status = status;

    const result = await ecommerceService.getAuthors(filters);

    return NextResponse.json({
      success: true,
      authors: result.authors || result,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error fetching authors:', error);
    return handleApiError(error);
  }
});

export const POST = withPermission('content.create', async (request: NextRequest, context: any, session: any) => {
  try {

    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'Author name is required' },
        { status: 400 }
      );
    }

    // Create author
    const author = await ecommerceService.createAuthor(body);

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(session.user.id),
      'content.create',
      'authors',
      author.id,
      { name: author.name },
      request.headers.get('x-forwarded-for') || request.ip || '',
      request.headers.get('user-agent') || ''
    );

    return NextResponse.json({
      success: true,
      author,
      message: 'Author created successfully'
    });

  } catch (error) {
    console.error('Error creating author:', error);
    return handleApiError(error);
  }
}); 