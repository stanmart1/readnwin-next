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

    if (!body.updates || typeof body.updates !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Updates object is required' },
        { status: 400 }
      );
    }

    const updatedCount = await faqService.bulkUpdateFAQs(body.ids, body.updates);

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedCount} FAQs`,
      updatedCount
    });

  } catch (error) {
    console.error('Error bulk updating FAQs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update FAQs' },
      { status: 500 }
    );
  }
} 