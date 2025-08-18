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

    console.log('🧪 Testing email gateway system...');

    const testSubject = 'Email Gateway System Test';
    const testHtml = `
      <h1>Email Gateway System Test</h1>
      <p>This is a test email sent via the centralized email gateway system.</p>
      <p>If you receive this email, the email gateway configuration from admin settings is working correctly!</p>
    `;

    const result = await sendEmail(email, testSubject, testHtml);

    if (result.success) {
      console.log('Email gateway test result:', result);
      return NextResponse.json({
        success: true,
        message: 'Email gateway test sent successfully',
        data: result.data
      });
    } else {
      console.error('Email gateway test failed:', result.error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to send email gateway test',
          details: result.error
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Email gateway test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to send email gateway test',
        details: error
      },
      { status: 500 }
    );
  }
} 