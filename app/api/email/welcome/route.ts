import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/utils/email';

export async function POST(request: NextRequest) {
  try {
    const { email, userName, userId } = await request.json();

    if (!email || !userName) {
      return NextResponse.json(
        { error: 'Email and userName are required' },
        { status: 400 }
      );
    }

    const result = await sendWelcomeEmail(email, userName, userId);

    if (result.success) {
      return NextResponse.json(
        { message: 'Welcome email sent successfully', data: result.data },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send welcome email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in welcome email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 