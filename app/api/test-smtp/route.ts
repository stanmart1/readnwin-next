import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/utils/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('🧪 Testing SMTP email gateway...');

    const testSubject = 'SMTP Gateway Test';
    const testHtml = `
      <h1>SMTP Gateway Test</h1>
      <p>This is a test email sent via the configured SMTP gateway.</p>
      <p>If you receive this email, the SMTP configuration is working correctly!</p>
    `;
    const testText = 'SMTP Gateway Test\n\nThis is a test email sent via the configured SMTP gateway.';

    const result = await sendEmail(email, testSubject, testHtml, testText);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'SMTP test email sent successfully',
        data: result.data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to send SMTP test email',
        details: result.error
      }, { status: 500 });
    }

  } catch (error) {
    console.error('SMTP test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to send SMTP test email',
        details: error
      },
      { status: 500 }
    );
  }
} 