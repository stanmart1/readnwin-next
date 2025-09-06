import { sanitizeInput, sanitizeQuery, validateId, sanitizeHtml } from '@/lib/security';
import { requireAdmin, requirePermission } from '@/middleware/auth';
import logger from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rbacService } from '@/utils/rbac-service';
import { blogService } from '@/utils/blog-service';

// GET - Fetch all blog posts
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

    // Check permission
    const userId = (session.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }
    
    const hasPermission = await rbacService.hasPermission(
      parseInt(userId),
      'content.manage'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const category = searchParams.get('category') || undefined;
    const featured = searchParams.get('featured') ? searchParams.get('featured') === 'true' : undefined;
    const search = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

    const posts = await blogService.getPosts({
      status,
      category,
      featured,
      search,
      limit,
      offset
    });

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(userId),
      'blog_posts.list',
      'blog_posts',
      undefined,
      { status, category, featured, search },
      request.headers.get('x-forwarded-for') || request.ip || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      posts
    });

  } catch (error) {
    logger.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new blog post
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permission
    const userId = (session.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }
    
    const hasPermission = await rbacService.hasPermission(
      parseInt(userId),
      'content.manage'
    );
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const postData = await request.json();

    // Validate required fields
    if (!postData.title || !postData.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    if (!postData.slug) {
      postData.slug = blogService.generateSlug(postData.title);
    }

    // Calculate read time if not provided
    if (!postData.read_time) {
      postData.read_time = blogService.calculateReadTime(postData.content);
    }

    const post = await blogService.createPost({
      ...postData,
      author_id: parseInt(userId),
      author_name: postData.author_name || (session.user as any).name || 'Admin',
      status: postData.status || 'draft',
      featured: postData.featured || false,
      category: postData.category || 'general',
      tags: postData.tags || []
    });

    // Log audit event
    await rbacService.logAuditEvent(
      parseInt(userId),
      'blog_posts.create',
      'blog_posts',
      post.id,
      { title: post.title, slug: post.slug },
      request.headers.get('x-forwarded-for') || request.ip || undefined,
      request.headers.get('user-agent') || undefined
    );

    return NextResponse.json({
      success: true,
      post
    }, { status: 201 });

  } catch (error) {
    logger.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 