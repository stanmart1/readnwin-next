import { NextRequest, NextResponse } from 'next/server';
import { sendNewsletterSubscriptionEmail } from '@/utils/email';

export async function POST(request: NextRequest) {
  try {
    const { email, userName, subscriptionType, unsubscribeUrl } = await request.json();

    if (!email || !userName || !subscriptionType || !unsubscribeUrl) {
      return NextResponse.json(
        { error: 'Email, userName, subscriptionType, and unsubscribeUrl are required' },
        { status: 400 }
      );
    }

    const result = await sendNewsletterSubscriptionEmail(email, userName, subscriptionType, unsubscribeUrl);

    if (result.success) {
      return NextResponse.json(
        { message: 'Newsletter subscription email sent successfully', data: result.data },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send newsletter subscription email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in newsletter subscription email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 