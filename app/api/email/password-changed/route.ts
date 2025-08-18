import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordChangedEmail } from '@/utils/email';

export async function POST(request: NextRequest) {
  try {
    const { email, userName, changedAt, ipAddress } = await request.json();

    if (!email || !userName || !changedAt || !ipAddress) {
      return NextResponse.json(
        { error: 'Email, userName, changedAt, and ipAddress are required' },
        { status: 400 }
      );
    }

    const result = await sendPasswordChangedEmail(email, userName, changedAt, ipAddress);

    if (result.success) {
      return NextResponse.json(
        { message: 'Password changed email sent successfully', data: result.data },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send password changed email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in password changed email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 