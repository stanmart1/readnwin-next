import { NextRequest, NextResponse } from 'next/server';
import { sendPromotionalOfferEmail } from '@/utils/email';

export async function POST(request: NextRequest) {
  try {
    const { email, userName, offerTitle, offerDescription, expiryDate, discountCode } = await request.json();

    if (!email || !userName || !offerTitle || !offerDescription || !expiryDate || !discountCode) {
      return NextResponse.json(
        { error: 'Email, userName, offerTitle, offerDescription, expiryDate, and discountCode are required' },
        { status: 400 }
      );
    }

    const result = await sendPromotionalOfferEmail(email, userName, offerTitle, offerDescription, expiryDate, discountCode);

    if (result.success) {
      return NextResponse.json(
        { message: 'Promotional offer email sent successfully', data: result.data },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send promotional offer email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in promotional offer email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 