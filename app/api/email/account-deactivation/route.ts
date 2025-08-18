import { NextRequest, NextResponse } from 'next/server';
import { sendAccountDeactivationEmail } from '@/utils/email';

export async function POST(request: NextRequest) {
  try {
    const { email, userName, deactivationReason, reactivationUrl } = await request.json();

    if (!email || !userName || !deactivationReason || !reactivationUrl) {
      return NextResponse.json(
        { error: 'Email, userName, deactivationReason, and reactivationUrl are required' },
        { status: 400 }
      );
    }

    const result = await sendAccountDeactivationEmail(email, userName, deactivationReason, reactivationUrl);

    if (result.success) {
      return NextResponse.json(
        { message: 'Account deactivation email sent successfully', data: result.data },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send account deactivation email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in account deactivation email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 