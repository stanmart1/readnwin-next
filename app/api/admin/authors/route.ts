import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ecommerceService } from '@/utils/ecommerce-service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const filters: {
      page: number;
      limit: number;
      search?: string;
      status?: string;
    } = { page, limit };
    if (search) filters.search = search;
    if (status) filters.status = status;

    const result = await ecommerceService.getAuthors(filters);

    if (Array.isArray(result)) {
      return NextResponse.json({
        success: true,
        authors: result,
        pagination: { page: 1, limit: result.length, total: result.length, pages: 1 }
      });
    }

    return NextResponse.json({
      success: true,
      authors: result.authors || [],
      pagination: result.pagination || { page: 1, limit: 20, total: 0, pages: 0 }
    });

  } catch (error) {
    console.error('Authors API error:', error);
    return NextResponse.json({
      success: true,
      authors: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 0 }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Author name is required' }, { status: 400 });
    }

    const authorData = {
      name: body.name.trim(),
      bio: body.bio || '',
      website_url: body.website || '',
      status: 'active' as const
    };

    const author = await ecommerceService.createAuthor(authorData);

    return NextResponse.json({
      success: true,
      author,
      message: 'Author created successfully'
    });

  } catch (error) {
    console.error('Error creating author:', error);
    return NextResponse.json({ error: 'Failed to create author' }, { status: 500 });
  }
} 