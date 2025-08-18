import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '@/utils/database';
import { sendEmailVerification } from '@/utils/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user with this email
    const result = await query(`
      SELECT id, email, first_name, last_name, email_verified, status
      FROM users 
      WHERE email = $1
    `, [email]);

    if (result.rows.length === 0) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: 'If an account with that email exists, a verification email has been sent.' },
        { status: 200 }
      );
    }

    const user = result.rows[0];

    // Check if email is already verified
    if (user.email_verified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Check if user is pending verification
    if (user.status !== 'pending') {
      return NextResponse.json(
        { error: 'Account is not pending verification' },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new verification token
    await query(`
      UPDATE users 
      SET email_verification_token = $1, 
          email_verification_expires = $2,
          updated_at = NOW()
      WHERE id = $3
    `, [verificationToken, verificationExpires, user.id]);

    // Send verification email
    const userName = `${user.first_name} ${user.last_name}`;
    const emailResult = await sendEmailVerification(email, verificationToken, userName);

    if (emailResult.success) {
      return NextResponse.json({
        message: 'Verification email sent successfully. Please check your inbox.'
      });
    } else {
      console.error('Failed to send verification email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 