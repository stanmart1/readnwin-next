import { NextRequest, NextResponse } from 'next/server';
import { sendLoginAlertEmail } from '@/utils/email';

export async function POST(request: NextRequest) {
  try {
    const { email, userName, loginTime, ipAddress, deviceInfo } = await request.json();

    if (!email || !userName || !loginTime || !ipAddress || !deviceInfo) {
      return NextResponse.json(
        { error: 'Email, userName, loginTime, ipAddress, and deviceInfo are required' },
        { status: 400 }
      );
    }

    const result = await sendLoginAlertEmail(email, userName, loginTime, ipAddress, deviceInfo);

    if (result.success) {
      return NextResponse.json(
        { message: 'Login alert email sent successfully', data: result.data },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send login alert email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in login alert email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 