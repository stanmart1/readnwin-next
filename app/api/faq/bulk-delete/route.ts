import { NextRequest, NextResponse } from 'next/server';
import { faqService } from '@/utils/faq-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'IDs array is required' },
        { status: 400 }
      );
    }

    const deletedCount = await faqService.bulkDeleteFAQs(body.ids);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} FAQs`,
      deletedCount
    });

  } catch (error) {
    console.error('Error bulk deleting FAQs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete FAQs' },
      { status: 500 }
    );
  }
} 