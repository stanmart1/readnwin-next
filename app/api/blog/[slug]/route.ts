import { NextRequest, NextResponse } from 'next/server';
import { blogService } from '@/utils/blog-service';

// GET - Fetch published blog post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await blogService.getPostBySlug(params.slug);
    
    if (!post || post.status !== 'published') {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Get post images
    const images = await blogService.getPostImages(post.id!);

    // Increment view count
    const ipAddress = request.headers.get('x-forwarded-for') || request.ip || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;
    await blogService.incrementViewCount(post.id!, undefined, ipAddress, userAgent);

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        images
      }
    });

  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 