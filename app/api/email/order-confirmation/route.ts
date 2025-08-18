import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/utils/email';

export async function POST(request: NextRequest) {
  try {
    const { email, orderDetails, userName } = await request.json();

    if (!email || !orderDetails || !userName) {
      return NextResponse.json(
        { error: 'Email, orderDetails, and userName are required' },
        { status: 400 }
      );
    }

    const result = await sendOrderConfirmationEmail(email, orderDetails, userName);

    if (result.success) {
      return NextResponse.json(
        { message: 'Order confirmation email sent successfully', data: result.data },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send order confirmation email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in order confirmation email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 