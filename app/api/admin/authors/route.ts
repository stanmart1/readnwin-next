import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/utils/api-protection';
import { rbacService } from '@/utils/rbac-service';
import { ecommerceService } from '@/utils/ecommerce-service';
import { handleApiError } from '@/utils/error-handler';

export const GET = withPermission('content.read', async (request: NextRequest, context: any, session: any) => {
  try {
    console.log('📋 Admin Authors GET: Starting request...');
    
    if (!session?.user?.id) {
      console.log('❌ Admin Authors GET: Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log(`✅ Admin Authors GET: User ${session.user.id} authenticated`);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const filters: any = { page, limit };
    if (search) filters.search = search;
    if (status) filters.status = status;

    console.log('📋 Admin Authors GET: Fetching authors with filters:', filters);

    const result = await ecommerceService.getAuthors(filters);

    console.log(`✅ Admin Authors GET: Successfully fetched authors`);

    return NextResponse.json({
      success: true,
      authors: result.authors || result,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('❌ Admin Authors GET: Error fetching authors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch authors' },
      { status: 500 }
    );
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