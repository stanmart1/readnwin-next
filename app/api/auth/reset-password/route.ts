import { NextRequest, NextResponse } from 'next/server';
import { rbacService } from '@/utils/rbac-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await rbacService.getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.'
      });
    }

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

    // In a real application, you would:
    // 1. Generate a secure reset token
    // 2. Store it in the database with expiration
    // 3. Send an email with the reset link
    // 4. Use a proper email service (SendGrid, AWS SES, etc.)

    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a reset link has been sent.'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 