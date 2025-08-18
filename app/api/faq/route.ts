import { NextRequest, NextResponse } from 'next/server';
import { faqService } from '@/utils/faq-service';

// Force dynamic rendering to prevent build-time analysis
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = {
      query: searchParams.get('query') || '',
      category: searchParams.get('category') || '',
      featured: searchParams.get('featured') === 'true',
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
      sortBy: (searchParams.get('sortBy') as any) || 'priority',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc'
    };

    const result = await faqService.getAllFAQs(params);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.question || !body.answer || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Question, answer, and category are required' },
        { status: 400 }
      );
    }

    // For now, use a default user ID (you'll need to get this from session)
    const userId = 1; // TODO: Get from session

    const faq = await faqService.createFAQ(body, userId);

    return NextResponse.json({
      success: true,
      data: faq
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create FAQ' },
      { status: 500 }
    );
  }
} 