import { NextRequest, NextResponse } from 'next/server';
import { sendSecurityAlertEmail } from '@/utils/email';

export async function POST(request: NextRequest) {
  try {
    const { email, alertType, severity, description, actionRequired } = await request.json();

    if (!email || !alertType || !severity || !description || !actionRequired) {
      return NextResponse.json(
        { error: 'Email, alertType, severity, description, and actionRequired are required' },
        { status: 400 }
      );
    }

    const result = await sendSecurityAlertEmail(email, alertType, severity, description, actionRequired);

    if (result.success) {
      return NextResponse.json(
        { message: 'Security alert email sent successfully', data: result.data },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send security alert email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in security alert email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 