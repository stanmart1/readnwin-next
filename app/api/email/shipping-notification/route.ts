import { NextRequest, NextResponse } from 'next/server';
import { sendShippingNotificationEmail } from '@/utils/email';

export async function POST(request: NextRequest) {
  try {
    const { email, orderDetails, userName } = await request.json();

    if (!email || !orderDetails || !userName) {
      return NextResponse.json(
        { error: 'Email, orderDetails, and userName are required' },
        { status: 400 }
      );
    }

    const result = await sendShippingNotificationEmail(email, orderDetails, userName);

    if (result.success) {
      return NextResponse.json(
        { message: 'Shipping notification email sent successfully', data: result.data },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send shipping notification email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in shipping notification email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 