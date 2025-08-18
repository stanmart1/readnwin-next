import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/utils/email';

export async function POST(request: NextRequest) {
  try {
    const { email, resetToken, userName } = await request.json();

    if (!email || !resetToken || !userName) {
      return NextResponse.json(
        { error: 'Email, resetToken, and userName are required' },
        { status: 400 }
      );
    }

    const result = await sendPasswordResetEmail(email, resetToken, userName);

    if (result.success) {
      return NextResponse.json(
        { message: 'Password reset email sent successfully', data: result.data },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send password reset email', details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in password reset email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 