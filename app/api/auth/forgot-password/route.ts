import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { rbacService } from '@/utils/rbac-service';
import { sendPasswordResetEmail } from '@/utils/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await rbacService.getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: 'If an account with that email exists, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in database (you'll need to add this to your user table)
    // For now, we'll just send the email
    const userName = `${user.first_name} ${user.last_name}`;

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(email, resetToken, userName);

    if (emailResult.success) {
      // Log audit event
      await rbacService.logAuditEvent(
        user.id,
        'user.password_reset_requested',
        'users',
        user.id,
        { email },
        request.headers.get('x-forwarded-for') || request.ip,
        request.headers.get('user-agent')
      );

      return NextResponse.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    } else {
      console.error('Failed to send password reset email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 