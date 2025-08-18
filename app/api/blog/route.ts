import { NextRequest, NextResponse } from 'next/server';
import { blogService } from '@/utils/blog-service';

// GET - Fetch published blog posts for public display
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const featured = searchParams.get('featured') ? searchParams.get('featured') === 'true' : undefined;
    const search = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;

    // Fetch posts from database using blog service
    const posts = await blogService.getPublishedPosts({
      category,
      featured,
      search,
      limit,
      offset
    });

    // Get total count for pagination
    const totalPosts = await blogService.getPosts({
      status: 'published',
      category,
      featured,
      search
    });

    return NextResponse.json({
      success: true,
      posts,
      total: totalPosts.length,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error fetching published blog posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 