import { NextRequest, NextResponse } from 'next/server';
import { sendFunctionEmail } from '@/utils/email';

// POST - Test email function assignment
export async function POST(request: NextRequest) {
  try {
    const { functionSlug, to, variables } = await request.json();

    // Validate required fields
    if (!functionSlug || !to) {
      return NextResponse.json(
        { error: 'Missing required fields: functionSlug, to' },
        { status: 400 }
      );
    }

    // Send email using function assignment
    const result = await sendFunctionEmail(to, functionSlug, variables || {});

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Email sent successfully using function: ${functionSlug}`,
        data: result.data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: (result.error as any)?.message || 'Failed to send email'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error testing email function:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 